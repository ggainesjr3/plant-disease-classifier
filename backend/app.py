import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Load the model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'models', 'plant_disease_model.h5')
model = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = [
    'Pepper__bell___Bacterial_spot', 'Pepper__bell___healthy', 
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 
    'Tomato_Bacterial_spot', 'Tomato_Early_blight', 'Tomato_Late_blight', 
    'Tomato_Leaf_Mold', 'Tomato_Septoria_leaf_spot', 
    'Tomato_Spider_mites_Two_spotted_spider_mite', 'Tomato__Target_Spot', 
    'Tomato__Tomato_YellowLeaf__Curl_Virus', 'Tomato__Tomato_mosaic_virus', 
    'Tomato_healthy'
]

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400
    
    file = request.files['file']
    img = Image.open(io.BytesIO(file.read())).convert('RGB')
    img = img.resize((224, 224))
    
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    confidence = float(np.max(predictions[0]))
    
    # --- THE FIX: CONFIDENCE GUARD ---
    # If the model is less than 70% sure, we call it "Unknown"
    # This stops it from guessing when you show it an apple or paper.
    if confidence < 0.70:
        return jsonify({
            'class': 'Unknown Object',
            'confidence': confidence,
            'message': 'Please provide a clear photo of a Pepper, Potato, or Tomato leaf.'
        })
    
    return jsonify({
        'class': CLASS_NAMES[predicted_index],
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)