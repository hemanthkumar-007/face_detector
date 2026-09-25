"""
=============================================================
  Real-Time Face Detection using OpenCV & Haar Cascades
  Author  : Python Mentor
  Level   : Beginner-Friendly
  Requires: opencv-python
=============================================================

HOW IT WORKS
------------
1. VideoCapture  – Opens a connection to your webcam (device 0).
                   Each call to .read() grabs a single JPEG-like frame.

2. cvtColor      – Converts a colour (BGR) frame to greyscale.
                   Haar Cascades work on intensity (brightness) values,
                   not colour, so greyscale gives faster, cleaner results.

3. detectMultiScale – Slides a small detection window across the image
                      at multiple zoom levels ("scales") and flags every
                      region that the Haar Cascade model recognises as a
                      face. Returns a list of (x, y, width, height) boxes.

4. rectangle     – Draws a coloured rectangle on the original colour frame
                   using the top-left corner (x, y) and bottom-right corner
                   (x+w, y+h) returned by detectMultiScale.

HAAR CASCADE FILE
-----------------
OpenCV ships the XML model file with the package itself, so you do NOT need
to download it separately. We locate it at runtime using
cv2.data.haarcascades, which always points to the correct installation folder.

pip install command
-------------------
    pip install opencv-python
"""

# ── Standard library ──────────────────────────────────────────────────────────
import sys          # Used to exit gracefully if the camera fails to open
import time         # Used for the camera warmup delay

# ── Third-party ───────────────────────────────────────────────────────────────
import cv2          # pip install opencv-python


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 – Load the Haar Cascade face detector model
# ═══════════════════════════════════════════════════════════════════════════════

# cv2.data.haarcascades is a handy string that holds the path to the folder
# where OpenCV stores all its pre-trained XML model files.
haar_cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

# CascadeClassifier reads the XML file and builds the detection model in memory.
face_cascade = cv2.CascadeClassifier(haar_cascade_path)

# Safety check – if the file is missing or corrupt, empty() returns True.
if face_cascade.empty():
    print("[ERROR] Could not load Haar Cascade XML file.")
    print(f"        Expected path: {haar_cascade_path}")
    sys.exit(1)

print("[INFO] Haar Cascade model loaded successfully.")


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 – Open the webcam
# ═══════════════════════════════════════════════════════════════════════════════

# VideoCapture(0) targets the default/first webcam.
# Use 1, 2, … if you have multiple cameras and 0 is the wrong one.
# cv2.CAP_DSHOW forces Windows to use the DirectShow backend instead of the
# default MSMF (Media Foundation) backend. MSMF often causes
# "can't grab frame / Error: -1072875" on Windows — DirectShow avoids this.
webcam = cv2.VideoCapture(0, cv2.CAP_DSHOW)

# Give the camera sensor ~2 seconds to warm up before we start reading frames.
# Skipping this can cause the first several frames to fail on some hardware.
print("[INFO] Warming up camera…")
time.sleep(2)

# isOpened() returns False if the OS could not connect to the camera.
if not webcam.isOpened():
    print("[ERROR] Cannot open webcam. Please check that:")
    print("        • A camera is physically connected.")
    print("        • No other application is using it.")
    sys.exit(1)

print("[INFO] Webcam opened successfully.")
print("[INFO] Press  'q'  to quit.")


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 – Main detection loop
# ═══════════════════════════════════════════════════════════════════════════════

# ── Visual style constants (easy to tweak) ────────────────────────────────────
BOX_COLOR       = (0, 255, 0)   # Green in BGR colour space  (B=0, G=255, R=0)
BOX_THICKNESS   = 2             # Pixels thick for the rectangle border
TEXT_COLOR      = (0, 255, 0)   # Same green for the face-count label
TEXT_FONT       = cv2.FONT_HERSHEY_SIMPLEX
TEXT_SCALE      = 0.8           # Font size multiplier
TEXT_THICKNESS  = 2             # Stroke weight for the text

# ── Mirror / Flip setting ────────────────────────────────────────────────────
# Set to False for non-mirrored (normal camera view)
# Set to True for mirrored (selfie / looking-in-a-mirror view)
# You can also press 'm' on your keyboard anytime while running to toggle it!
mirror_view = False

# ── detectMultiScale tuning parameters ───────────────────────────────────────
# scaleFactor  – How much the image is shrunk at each pyramid level.
#                1.08 is more fine-grained than 1.1, catching faces at more scales.
SCALE_FACTOR    = 1.08

# minNeighbors – Lowered to 4 for higher sensitivity so faces are detected
#                even in sub-optimal angles or lighting.
MIN_NEIGHBORS   = 4

# minSize      – Minimum pixel size (width, height) of a detectable face.
MIN_FACE_SIZE   = (30, 30)


while True:

    # ── 3a. Grab a frame from the webcam ─────────────────────────────────────
    frame_captured, colour_frame = webcam.read()

    if not frame_captured:
        print("[WARNING] Failed to capture frame. Retrying…")
        time.sleep(0.1)
        continue

    # Apply horizontal flip only if mirror_view is enabled
    if mirror_view:
        colour_frame = cv2.flip(colour_frame, 1)

    # Check if the camera feed is completely black (e.g. shutter closed)
    avg_brightness = colour_frame.mean()
    is_feed_black = avg_brightness < 5.0

    # ── 3b. Convert to greyscale ──────────────────────────────────────────────
    grey_frame = cv2.cvtColor(colour_frame, cv2.COLOR_BGR2GRAY)

    # Histogram equalization balances contrast, helping detect faces in dim or harsh lighting
    grey_frame = cv2.equalizeHist(grey_frame)

    # ── 3c. Detect faces ──────────────────────────────────────────────────────
    detected_faces = face_cascade.detectMultiScale(
        grey_frame,
        scaleFactor  = SCALE_FACTOR,
        minNeighbors = MIN_NEIGHBORS,
        minSize      = MIN_FACE_SIZE,
    )

    face_count = len(detected_faces)

    # ── 3d. Draw bounding boxes around every detected face ────────────────────
    for (x, y, face_width, face_height) in detected_faces:
        top_left     = (x, y)
        bottom_right = (x + face_width, y + face_height)
        cv2.rectangle(colour_frame, top_left, bottom_right, BOX_COLOR, BOX_THICKNESS)

    # ── 3e. Display status on screen ─────────────────────────────────────────
    if is_feed_black:
        # Visual alert if the lens is covered or physical shutter is closed
        cv2.putText(
            colour_frame,
            "CAMERA FEED IS BLACK - CHECK PRIVACY SHUTTER",
            (10, 35),
            TEXT_FONT,
            0.6,
            (0, 0, 255),  # Red warning
            2,
            cv2.LINE_AA,
        )
    else:
        count_label = f"Faces detected: {face_count}"
        cv2.putText(
            colour_frame,
            count_label,
            (10, 35),
            TEXT_FONT,
            TEXT_SCALE,
            TEXT_COLOR,
            TEXT_THICKNESS,
            cv2.LINE_AA,
        )

    # ── 3f. Show the annotated frame in a window ──────────────────────────────
    cv2.imshow("Real-Time Face Detection | Q=Quit, M=Toggle Mirror", colour_frame)

    # ── 3g. Check for key presses ────────────────────────────────────────────
    # waitKey(1) waits 1 ms for a key event; without it the window would freeze.
    key_pressed = cv2.waitKey(1) & 0xFF

    if key_pressed == ord("q"):
        print("[INFO] 'q' pressed – shutting down…")
        break
    elif key_pressed == ord("m"):
        mirror_view = not mirror_view
        state_str = "ON (Mirrored)" if mirror_view else "OFF (Normal)"
        print(f"[INFO] Mirror view toggled: {state_str}")


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4 – Clean up resources
# ═══════════════════════════════════════════════════════════════════════════════

# Always release the camera so other applications can use it.
webcam.release()

# Close every OpenCV window that was opened by this script.
cv2.destroyAllWindows()

print("[INFO] Camera released. All windows closed. Goodbye!")
