import os
import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
PROJECT_ROOT = '/home/gary/plant-disease-classifier'
PREDICT_SCRIPT = os.path.join(PROJECT_ROOT, 'scripts/predict.py')
PYTHON_EXEC = 'python3' 

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # 1. Run the predict.py script with a 30-second timeout safeguard
            result = subprocess.run(
                [PYTHON_EXEC, PREDICT_SCRIPT, filepath],
                capture_output=True,
                text=True,
                check=True,
                timeout=30  # Prevents zombie processes if the model hangs
            )
            
            process_output = result.stdout
            
            # 2. Find the JSON_OUTPUT line
            for line in process_output.split('\n'):
                if line.startswith("JSON_OUTPUT: "):
                    json_str = line.replace("JSON_OUTPUT: ", "")
                    prediction_data = json.loads(json_str)
                    
                    # Clean up the uploaded file after processing
                    if os.path.exists(filepath):
                        os.remove(filepath)
                    
                    return jsonify(prediction_data)

            return jsonify({"error": "Could not parse AI output", "raw": process_output}), 500

        except subprocess.TimeoutExpired:
            # Clean up the file if processing timed out
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                "error": "Processing timed out", 
                "details": "The AI model took too long to respond. Try a smaller image."
            }), 504

        except subprocess.CalledProcessError as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": "Prediction script failed", "details": str(e.stderr)}), 500
            
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file type"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)