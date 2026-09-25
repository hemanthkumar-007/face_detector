// ==============================================================
// FaceVision AI - Client-Side Real-Time Face Detection
// Powered by MediaPipe Face Detection
// ==============================================================

const videoElement = document.getElementById('webcam-video');
const canvasElement = document.getElementById('overlay-canvas');
const canvasCtx = canvasElement.getContext('2d');

const startCameraBtn = document.getElementById('start-camera-btn');
const primaryStartBtn = document.getElementById('primary-start-btn');
const stopCameraBtn = document.getElementById('stop-camera-btn');
const toggleMirrorBtn = document.getElementById('toggle-mirror-btn');
const switchCameraBtn = document.getElementById('switch-camera-btn');

const faceCountDisplay = document.getElementById('face-count-display');
const fpsDisplay = document.getElementById('fps-display');
const orientationDisplay = document.getElementById('orientation-display');
const cameraStatusText = document.getElementById('camera-status-text');
const statusPulse = document.getElementById('status-pulse');
const cameraPlaceholder = document.getElementById('camera-placeholder');
const alertBanner = document.getElementById('alert-banner');
const alertMessage = document.getElementById('alert-message');

// State Variables
let isCameraRunning = false;
let isMirrored = false;
let currentFacingMode = 'user'; // 'user' or 'environment'
let cameraStream = null;
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

// Initialize MediaPipe Face Detection
const faceDetection = new FaceDetection({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});

faceDetection.setOptions({
  model: 'short',          // 'short' is optimized for selfie/webcam range (< 2 meters)
  minDetectionConfidence: 0.5
});

faceDetection.onResults(onDetectionResults);

// Render detection results onto HTML5 Canvas
function onDetectionResults(results) {
  // Update canvas size to match current video aspect ratio
  if (canvasElement.width !== videoElement.videoWidth && videoElement.videoWidth > 0) {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  }

  const width = canvasElement.width;
  const height = canvasElement.height;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, width, height);

  // If mirrored, flip horizontally before drawing
  if (isMirrored) {
    canvasCtx.translate(width, 0);
    canvasCtx.scale(-1, 1);
  }

  // Draw camera frame to canvas
  canvasCtx.drawImage(results.image, 0, 0, width, height);

  const faces = results.detections || [];
  faceCountDisplay.textContent = faces.length;

  // Draw detection bounding boxes
  faces.forEach((detection, idx) => {
    const box = detection.boundingBox;
    const x = box.xCenter * width - (box.width * width) / 2;
    const y = box.yCenter * height - (box.height * height) / 2;
    const w = box.width * width;
    const h = box.height * height;
    const score = Math.round((detection.score[0] || 0) * 100);

    // Green Cyber Bounding Box
    canvasCtx.strokeStyle = '#00f59b';
    canvasCtx.lineWidth = 3;
    canvasCtx.shadowColor = 'rgba(0, 245, 155, 0.6)';
    canvasCtx.shadowBlur = 10;
    
    // Smooth rounded rect
    roundRect(canvasCtx, x, y, w, h, 8);
    canvasCtx.stroke();
    canvasCtx.shadowBlur = 0; // reset shadow

    // Corner decorative accents
    drawCornerAccents(canvasCtx, x, y, w, h);

    // Face tag label
    canvasCtx.save();
    const tagText = `Face #${idx + 1} (${score}%)`;
    canvasCtx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    const textWidth = canvasCtx.measureText(tagText).width;
    
    canvasCtx.fillStyle = 'rgba(7, 10, 18, 0.85)';
    canvasCtx.fillRect(x, Math.max(0, y - 26), textWidth + 14, 22);
    
    canvasCtx.fillStyle = '#00f59b';
    canvasCtx.fillText(tagText, x + 7, Math.max(16, y - 10));
    canvasCtx.restore();
  });

  canvasCtx.restore();

  // Calculate FPS
  const now = performance.now();
  frameCount++;
  if (now - lastFrameTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
    fpsDisplay.textContent = `${fps} FPS`;
    frameCount = 0;
    lastFrameTime = now;
  }
}

// Draw corner brackets around detection box for high-tech HUD look
function drawCornerAccents(ctx, x, y, w, h) {
  const lineLength = Math.min(w, h) * 0.2;
  ctx.strokeStyle = '#00d2ff';
  ctx.lineWidth = 4;

  ctx.beginPath();
  // Top-Left
  ctx.moveTo(x, y + lineLength); ctx.lineTo(x, y); ctx.lineTo(x + lineLength, y);
  // Top-Right
  ctx.moveTo(x + w - lineLength, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + lineLength);
  // Bottom-Left
  ctx.moveTo(x, y + h - lineLength); ctx.lineTo(x, y + h); ctx.lineTo(x + lineLength, y + h);
  // Bottom-Right
  ctx.moveTo(x + w - lineLength, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - lineLength);
  ctx.stroke();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Continuous frame sending loop
let animationFrameId = null;

async function processCameraFrame() {
  if (!isCameraRunning) return;

  if (videoElement.readyState >= 2) {
    await faceDetection.send({ image: videoElement });
  }

  animationFrameId = requestAnimationFrame(processCameraFrame);
}

// Start Camera Stream
async function startCamera() {
  hideAlert();
  try {
    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = cameraStream;
    await videoElement.play();

    isCameraRunning = true;
    cameraPlaceholder.classList.add('hidden');
    startCameraBtn.style.display = 'none';
    stopCameraBtn.style.display = 'inline-flex';
    cameraStatusText.textContent = 'Camera Live';
    statusPulse.classList.remove('offline');

    lastFrameTime = performance.now();
    frameCount = 0;
    processCameraFrame();
  } catch (err) {
    console.error('Camera access error:', err);
    showAlert(`Camera error: ${err.message || 'Permission denied or device in use.'}`);
    statusPulse.classList.add('offline');
    cameraStatusText.textContent = 'Camera Blocked';
  }
}

// Stop Camera Stream
function stopCamera() {
  isCameraRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  videoElement.srcObject = null;
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  cameraPlaceholder.classList.remove('hidden');
  startCameraBtn.style.display = 'inline-flex';
  stopCameraBtn.style.display = 'none';
  cameraStatusText.textContent = 'Camera Idle';
  statusPulse.classList.add('offline');
  faceCountDisplay.textContent = '0';
  fpsDisplay.textContent = '0 FPS';
}

// Toggle Mirror View
function toggleMirror() {
  isMirrored = !isMirrored;
  orientationDisplay.textContent = isMirrored ? 'Mirrored' : 'Normal';
  toggleMirrorBtn.classList.toggle('active', isMirrored);
}

// Flip Camera (Front / Rear)
async function switchCamera() {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  if (isCameraRunning) {
    stopCamera();
    await startCamera();
  }
}

function showAlert(message) {
  alertMessage.textContent = message;
  alertBanner.classList.add('show');
}

function hideAlert() {
  alertBanner.classList.remove('show');
}

// Event Listeners
startCameraBtn.addEventListener('click', startCamera);
primaryStartBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);
toggleMirrorBtn.addEventListener('click', toggleMirror);
switchCameraBtn.addEventListener('click', switchCamera);

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') {
    toggleMirror();
  } else if (e.key === 'q' || e.key === 'Q') {
    if (isCameraRunning) stopCamera();
  }
});
