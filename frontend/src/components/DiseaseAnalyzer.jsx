import { useState } from "react";
import treatments from "../data/treatments.json";
import { Upload, AlertCircle, Loader2, Leaf, ShieldCheck, Search, Info } from "lucide-react";

const DiseaseAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const treatmentInfo = treatments[data.label] || {
        cause: "Unknown",
        remedy: "Please consult a local agricultural expert.",
        prevention: "General crop rotation and soil health management."
      };

      setResult({
        disease: data.label,
        confidence: (data.confidence * 100).toFixed(2),
        ...treatmentInfo
      });
    } catch (err) {
      setError("Failed to analyze image. Ensure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
          <Leaf className="w-8 h-8" /> PlantVision AI
        </h1>
        <p className="text-gray-600 mt-2">Upload a leaf photo to diagnose diseases instantly</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-dashed border-green-200">
        <div className="flex flex-col items-center justify-center space-y-4">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
          ) : (
            <div className="w-full h-48 bg-green-50 rounded-lg flex flex-col items-center justify-center text-green-600">
              <Upload className="w-12 h-12 mb-2" />
              <span>Select Leaf Image</span>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="hidden" 
            id="fileInput" 
          />
          <label 
            htmlFor="fileInput"
            className="px-6 py-2 bg-green-600 text-white rounded-full cursor-pointer hover:bg-green-700 transition"
          >
            {previewUrl ? "Change Image" : "Choose Photo"}
          </label>

          {selectedImage && !result && (
            <button 
              onClick={analyzeImage}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              {loading ? "Analyzing..." : "Diagnose Now"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle /> {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-green-100">
          <div className="bg-green-600 p-4 text-white">
            <h2 className="text-xl font-bold">Diagnosis: {result.disease}</h2>
            <p className="text-green-100">Confidence Score: {result.confidence}%</p>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800">Cause</h3>
                  <p className="text-gray-600">{result.cause}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800">Remedy</h3>
                  <p className="text-gray-600">{result.remedy}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" /> Prevention Tips
              </h3>
              <p className="text-gray-600 text-sm">{result.prevention}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseAnalyzer;