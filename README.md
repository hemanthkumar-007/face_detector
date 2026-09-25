# Real-Time Face Detection using OpenCV

A real-time face detection application built in Python using OpenCV (`cv2`) and Haar Cascade classifiers.

## ✨ Features
- **Real-Time Detection**: Fast and lightweight face detection using the Haar Cascade frontal face classifier (`haarcascade_frontalface_default.xml`).
- **Live Visuals**: Draws green bounding boxes around detected faces and overlays a real-time face counter.
- **Orientation Control**: Toggle between normal and mirrored selfie view in real time with a single keypress.
- **Hardware-Friendly**: Uses DirectShow (`CAP_DSHOW`) on Windows with built-in sensor warmup and camera privacy alerts.

## 🛠️ Prerequisites & Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/hemanthkumar-007/face_detector.git
   cd face_detector
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 How to Run

```bash
python face_detector.py
```

### ⌨️ Controls
| Key | Action |
|---|---|
| `m` | Toggle mirror view (Normal ↔ Mirror) |
| `q` | Quit application and release camera |
