# PlantVision AI: Deep Learning Crop Diagnostic Suite

PlantVision AI is a full-stack computer vision application designed to help gardeners and farmers identify plant diseases in real-time. The system utilizes a Convolutional Neural Network (CNN) to analyze leaf images and provides actionable treatment protocols based on the diagnosis.

## 🚀 Key Features

* **Top-3 Probability Distribution:** Unlike "black box" classifiers, this UI visualizes the model's confidence across the top three most likely classes.
* **Edge-Case Handling:** Implements "Analysis Inconclusive" logic for low-confidence detections (<85%) to ensure diagnostic reliability.
* **Fuzzy-Match Treatment Database:** A data-driven mapping system that connects AI labels to a structured JSON knowledge base, handling naming variations and underscores automatically.
* **Defensive Engineering:** Integrated input sanitization, error boundaries, and robust API error handling.

## 🛠️ Technical Stack

* **Frontend:** React 18, Tailwind CSS, Lucide Icons
* **Backend:** Flask (Python 3.10+), Subprocess Management
* **AI/ML:** TensorFlow 2.x, Keras, MobileNetV2 (Transfer Learning)
* **Environment:** Linux (Ubuntu/Debian)

## 📂 Project Structure

```text
.
├── backend/
│   ├── app.py              # Flask API & Subprocess orchestration
│   └── uploads/            # Temporary storage for image processing
├── scripts/
│   └── predict.py          # TensorFlow inference engine & Top-3 logic
├── frontend/
│   ├── src/
│   │   ├── components/     # React UI Components (DiseaseAnalyzer.jsx)
│   │   └── data/           # treatments.json (Knowledge Base)
└── models/
    └── plant_model_v2.keras # Trained CNN Weights