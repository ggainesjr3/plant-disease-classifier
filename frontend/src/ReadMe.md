Plant Health Audit Terminal
Full-Stack AI Engineering Portfolio Project
🚀 Project Overview

This is a production-grade web application that utilizes a Convolutional Neural Network (CNN) to diagnose plant diseases from leaf images. Moving beyond a simple classifier, this system functions as a diagnostic terminal, providing actionable agricultural intelligence including causes, preventions, and remedies for 15 specific plant categories across Pepper, Potato, and Tomato species.
🛠️ The "Above and Beyond" Engineering

Most entry-level AI projects stop at the "Prediction" stage. I implemented three key features that demonstrate an advanced understanding of the AI lifecycle:
1. Integrated Diagnostic Intelligence

Instead of returning a raw class name (e.g., Tomato_Early_Blight), I engineered a Knowledge Mapping System.

    The Logic: The frontend maps the model's numerical output to a structured data dictionary.

    The Value: This transforms the app from a "math experiment" into a "functional tool" that tells a farmer exactly why their crop is dying and how to fix it using copper-based bactericides or improved airflow.

2. The "Confidence Guard" (The Apple Problem)

A major challenge in AI is the Closed-World Assumption—the tendency for a model to guess a category it knows even when shown something completely irrelevant (like a red apple or a blank piece of paper).

    The Math without the Degree: Understanding that the final layer of the model (Softmax) produces a probability distribution, I implemented a Confidence Threshold Gate in the Flask backend.

    The Implementation: If the highest probability is below 70%, the system rejects the prediction. This demonstrates a deep understanding of model reliability and prevents "hallucinated" results.

3. Full-Stack Orchestration

I built the entire infrastructure from scratch:

    Frontend: A React.js interface with real-time image preview and state-managed UI transitions.

    Backend: A Python Flask API that handles image preprocessing (resizing to 224x224 and normalization) and serves the TensorFlow model.

    DevOps: Created a unified Python execution script to manage simultaneous service launches and process cleanup.

🧬 Technical Stack

    AI Framework: TensorFlow / Keras (CNN Architecture)

    Backend: Flask, Python, NumPy, Pillow

    Frontend: React.js, Axios, CSS3

    Environment: Linux (Ubuntu/Debian)

    <p align="center">
  <img src="./screenshot.png" width="600" title="Application Interface">
</p>