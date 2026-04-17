import sys
import os
import numpy as np
import tensorflow as tf
import json
from tensorflow.keras.preprocessing import image

# 1. Suppress TensorFlow logging for a cleaner terminal output
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def get_labels(data_path):
    """Automatically gets the disease names from your folder structure."""
    if not os.path.exists(data_path):
        return None
    # Keras sorts folders alphabetically during training
    labels = sorted([f for f in os.listdir(data_path) if os.path.isdir(os.path.join(data_path, f))])
    return labels

def predict_disease(img_path):
    # --- CONFIGURATION ---
    IMG_HEIGHT = 224 
    IMG_WIDTH = 224
    THRESHOLD = 85.0
    
    PROJECT_ROOT = '/home/gary/plant-disease-classifier'
    DATA_DIR = os.path.join(PROJECT_ROOT, 'data/raw/color')
    MODEL_PATH = os.path.join(PROJECT_ROOT, 'models/plant_model_v2.keras')
    
    try:
        # 2. Load Labels and Model
        labels = get_labels(DATA_DIR)
        model = tf.keras.models.load_model(MODEL_PATH)

        # 3. Process the Image
        img = image.load_img(img_path, target_size=(IMG_HEIGHT, IMG_WIDTH))
        img_array = image.img_to_array(img)
        # Normalize to 0-1 range
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        # 4. Make Prediction & Extract Top 3
        predictions = model.predict(img_array, verbose=0)[0]
        
        # Get the indices of the top 3 highest scores
        top_3_indices = predictions.argsort()[-3:][::-1]
        
        results = []
        for idx in top_3_indices:
            raw_label = labels[idx] if labels else f"Class {idx}"
            
            # Professional naming logic
            if raw_label.lower() == 'background':
                display_name = "No Plant Detected"
            else:
                display_name = raw_label.replace('___', ' ').replace('_', ' ')
            
            results.append({
                "label": display_name,
                "confidence": float(predictions[idx] * 100)
            })

        # 5. Professional Decision Logic (Using the top result)
        top_result = results[0]
        
        # If the AI's best guess is weak, flag it as Inconclusive
        if top_result['confidence'] < THRESHOLD and top_result['label'] != "No Plant Detected":
            final_label = "Analysis Inconclusive"
            final_confidence = 0.0
        else:
            final_label = top_result['label']
            final_confidence = top_result['confidence']

        # 6. Output JSON for the Node.js/Flask frontend
        output = {
            "label": final_label,
            "confidence": f"{final_confidence:.2f}%",
            "top_3": results 
        }
        
        # We use a prefix so the Node.js/Flask app can easily find this line
        print(f"JSON_OUTPUT: {json.dumps(output)}")

    except Exception as e:
        error_output = {"label": "Error", "confidence": "0%", "error": str(e)}
        print(f"JSON_OUTPUT: {json.dumps(error_output)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        predict_disease(sys.argv[1])
    else:
        print("ERROR: No image path provided.")