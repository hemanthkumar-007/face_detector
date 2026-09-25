# Real-Time Face Detection & Web App (FaceVision AI)

A real-time face detection system featuring both:
1. **🌐 Web Application (Vercel Ready)**: Real-time, browser-based face detection running with zero server latency on any mobile device, tablet, or laptop.
2. **🐍 Python Desktop App**: Classical OpenCV script (`cv2`) using Haar Cascade classifiers and DirectShow webcam capture.

---

## 🌐 Deploy to Vercel (1-Click)

This project is ready to deploy directly on **Vercel**:

### Option 1: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import **`hemanthkumar-007/face_detector`**.
3. Keep default settings (Framework: *Other*) and click **Deploy**.
4. Your site will be instantly live with a free SSL `.vercel.app` URL!

### Option 2: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## ✨ Web App Features
- **Client-Side Machine Learning**: Runs in the browser with WebGL & WebAssembly acceleration (no video data is ever sent to a server).
- **Live Bounding Boxes**: Draws glowing green bounding boxes and confidence score tags on detected faces.
- **Real-Time HUD**: Real-time face counter, FPS speed counter, and orientation state.
- **Controls**:
  - `M` / **Toggle Mirror**: Flip between normal and selfie mirror view.
  - **Flip Camera**: Switch between front and rear cameras (ideal on smartphones).
  - `Q` / **Stop**: Release webcam stream cleanly.

---

## 🐍 Python Desktop App (`face_detector.py`)

### Installation & Run
```bash
pip install -r requirements.txt
python face_detector.py
```

### Controls in Desktop Window
- `m`: Toggle mirror view
- `q`: Quit and release webcam
