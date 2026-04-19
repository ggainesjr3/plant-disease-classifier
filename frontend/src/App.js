import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const PLANT_INFO = {
    'Pepper__bell___Bacterial_spot': { cause: 'Bacteria', prevention: 'Clean seeds.', remedy: 'Copper-based sprays.' },
    'Pepper__bell___healthy': { cause: 'None', prevention: 'Continue current care.', remedy: 'N/A' },
    'Potato___Early_blight': { cause: 'Fungus', prevention: 'Rotate crops.', remedy: 'Fungicides.' },
    'Potato___Late_blight': { cause: 'Water Mold', prevention: 'Keep leaves dry.', remedy: 'Copper fungicides.' },
    'Potato___healthy': { cause: 'None', prevention: 'Check soil moisture.', remedy: 'N/A' },
    'Tomato_Bacterial_spot': { cause: 'Bacteria', prevention: 'Avoid overhead watering.', remedy: 'Sulfur or copper.' },
    'Tomato_Early_blight': { cause: 'Fungus', prevention: 'Mulching.', remedy: 'Fungicides.' },
    'Tomato_Late_blight': { cause: 'Oomycete', prevention: 'Airflow.', remedy: 'Remove infected leaves.' },
    'Tomato_Leaf_Mold': { cause: 'High Humidity', prevention: 'Ventilation.', remedy: 'Reduce moisture.' },
    'Tomato_Septoria_leaf_spot': { cause: 'Fungus', prevention: 'Clean tools.', remedy: 'Fungicides.' },
    'Tomato_Spider_mites_Two_spotted_spider_mite': { cause: 'Pests', prevention: 'Hydrate plant.', remedy: 'Neem Oil.' },
    'Tomato__Target_Spot': { cause: 'Fungus', prevention: 'Spacing.', remedy: 'Fungicides.' },
    'Tomato__Tomato_YellowLeaf__Curl_Virus': { cause: 'Whiteflies', prevention: 'Insect nets.', remedy: 'Sticky traps.' },
    'Tomato__Tomato_mosaic_virus': { cause: 'Virus', prevention: 'Disinfect hands.', remedy: 'None (Remove plant).' },
    'Tomato_healthy': { cause: 'None', prevention: 'Regular care.', remedy: 'N/A' }
};

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setPrediction(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select an image!");
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', formData);
      setPrediction(response.data);
    } catch (err) {
      alert("Backend error! Make sure run_all.py is running in the terminal.");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h1>Plant Health Audit Terminal</h1>
      <p style={{color: '#666'}}>AI Engineer Portfolio Project</p>
      
      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        {preview && (
          <img src={preview} alt="Preview" style={{ width: '100%', marginTop: '15px', borderRadius: '10px' }} />
        )}
      </div>

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing Pixels..." : "Run Diagnostic"}
      </button>

      {prediction && (
        <div className="result-card">
          {prediction.class === 'Unknown Object' ? (
            <div>
              <h2 style={{color: '#d32f2f'}}>Low Confidence Result</h2>
              <p>{prediction.message}</p>
            </div>
          ) : (
            <div>
              <h2>Result: {prediction.class.replace(/___/g, ' ')}</h2>
              <p><strong>Model Confidence:</strong> {(prediction.confidence * 100).toFixed(1)}%</p>
              
              {PLANT_INFO[prediction.class] && (
                <div style={{ textAlign: 'left', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <p><strong>Primary Cause:</strong> {PLANT_INFO[prediction.class].cause}</p>
                  <p><strong>Prevention Strategy:</strong> {PLANT_INFO[prediction.class].prevention}</p>
                  <p><strong>Recommended Remedy:</strong> {PLANT_INFO[prediction.class].remedy}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;