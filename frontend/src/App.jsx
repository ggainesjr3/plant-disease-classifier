import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Connects to your Flask backend on port 5000
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Backend is not responding');

      const data = await response.json();
      
      // CRITICAL: This saves the full object (prediction, cause, remedy, etc.)
      setResult(data); 

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error connecting to backend. Make sure your Flask server is running!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-green-700 mb-8">
          Plant Disease Classifier
        </h1>

        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <form onSubmit={handleUpload} className="flex flex-col items-center">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-4"
              accept="image/*"
            />
            
            {preview && (
              <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded-lg mb-4 border-2 border-dashed border-gray-300" />
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Analyzing...' : 'Diagnose Plant'}
            </button>
          </form>
        </div>

        {/* --- DYNAMIC RESULT AREA --- */}
        {result && (
          <div className="mt-6 p-6 bg-white rounded-lg shadow-md border-t-4 border-green-500 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Diagnosis: <span className="text-green-600">{result.prediction}</span>
            </h2>
            <p className="text-gray-600 font-semibold mb-4 italic">
              Confidence Score: {result.confidence}
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded border-l-4 border-red-400">
                <h3 className="font-bold text-red-800 text-lg">Cause</h3>
                <p className="text-red-700 leading-relaxed">{result.cause}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-400">
                <h3 className="font-bold text-blue-800 text-lg">Remedy</h3>
                <p className="text-blue-700 leading-relaxed">{result.remedy}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded border-l-4 border-gray-400">
                <h3 className="font-bold text-gray-800 text-lg">Prevention</h3>
                <p className="text-gray-700 leading-relaxed">{result.prevention}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {setResult(null); setFile(null); setPreview(null);}}
              className="mt-6 text-sm text-gray-500 hover:text-green-600 underline"
            >
              Analyze another leaf
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;