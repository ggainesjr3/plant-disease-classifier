import React, { useState } from 'react';
import { Upload, AlertCircle, Loader2, Leaf, ShieldCheck, Search, Info } from 'lucide-react';
import treatmentsData from '../data/treatments.json';

const getTreatment = (label) => {
  if (!label) return null;
  const cleanLabel = label.replace(/___/g, ' ').replace(/_/g, ' ').trim().toLowerCase();
  const match = Object.keys(treatmentsData).find(key => {
    const cleanKey = key.toLowerCase();
    return cleanKey === cleanLabel || cleanLabel.includes(cleanKey) || cleanKey.includes(cleanLabel);
  });
  return treatmentsData[match] || null;
};

const DiseaseAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Defensive Guard: File Type Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG or PNG image.");
      return;
    }

    // 2. Defensive Guard: File Size Validation (Limit to 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert("File is too large. Please upload an image smaller than 5MB.");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      setPrediction({ label: "Connection Error", confidence: "0", error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-2xl mb-4 shadow-sm">
            <Leaf className="text-green-600 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Plant<span className="text-green-600">Vision</span> AI
          </h1>
          <p className="mt-2 text-slate-500 text-lg">Professional Grade Crop Diagnostic Suite</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          <div className="p-8">
            {/* Upload Area with Defensive UI States */}
            <div className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 ${previewUrl ? 'border-green-500 bg-green-50/30' : 'border-slate-200 hover:border-green-400 bg-slate-50/50'} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {previewUrl ? (
                <div className="p-4">
                  <img src={previewUrl} alt="Preview" className="rounded-xl w-full h-64 object-cover shadow-md" />
                  {!loading && (
                    <button onClick={() => {setSelectedImage(null); setPreviewUrl(null); setPrediction(null);}} className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm text-slate-900 p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all">
                      <AlertCircle size={20} />
                    </button>
                  )}
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center py-16 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <span className="text-lg font-semibold text-slate-700">Drop leaf image here</span>
                  <input 
                    type="file" 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*" 
                    disabled={loading}
                  />
                </label>
              )}
            </div>

            <button 
              onClick={analyzeImage} 
              disabled={!selectedImage || loading} 
              className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
            >
              {loading ? <><Loader2 className="animate-spin" /><span>Sequencing...</span></> : <><Search size={20} /><span>Run Diagnostic</span></>}
            </button>

            {/* Results Section */}
            {prediction && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-6 rounded-2xl border ${prediction.error ? 'bg-red-50 border-red-100' : 'bg-slate-900 text-white shadow-2xl'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Diagnostic Report</p>
                      <h3 className="text-2xl font-bold truncate pr-4">{prediction.label}</h3>
                    </div>
                    {prediction.error ? <AlertCircle className="text-red-500" /> : <ShieldCheck className="text-green-400" />}
                  </div>

                  {prediction.label === "Analysis Inconclusive" && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-inner">
                      <AlertCircle className="text-amber-600 shrink-0 mt-1" size={20} />
                      <div>
                        <p className="text-amber-900 font-bold text-sm">Low Confidence Detection</p>
                        <p className="text-amber-700 text-xs mt-1">
                          The AI isn't 100% sure. This usually happens due to poor lighting or a cluttered background. 
                          Try taking a clearer photo from a different angle.
                        </p>
                      </div>
                    </div>
                  )}

                  {!prediction.error && !["Analysis Inconclusive", "No Plant Detected"].includes(prediction.label) && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm mb-1 font-medium text-slate-400">
                        <span>Confidence Rating</span>
                        <span className="text-green-400">{prediction.confidence}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 border border-slate-700">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: prediction.confidence }}></div>
                      </div>
                    </div>
                  )}

                  {prediction.top_3 && !prediction.error && (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Model Probability Distribution</p>
                      <div className="space-y-4">
                        {prediction.top_3.map((res, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={index === 0 ? "text-green-400 font-bold" : "text-slate-300"}>{res.label}</span>
                              <span className="text-slate-400">{res.confidence.toFixed(2)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 border border-slate-700">
                              <div className={`h-1.5 rounded-full transition-all duration-1000 ${index === 0 ? "bg-green-500" : "bg-slate-600"}`} style={{ width: `${res.confidence}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Treatment Card */}
                {prediction && !prediction.error && !["Analysis Inconclusive", "No Plant Detected"].includes(prediction.label) && (
                  <div className="mt-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <ShieldCheck className="text-blue-600 w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-800">Recommended Treatment</h4>
                    </div>
                    {(() => {
                      const treatment = getTreatment(prediction.label);
                      return treatment ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-700">Primary Action: <span className="text-blue-600">{treatment.action}</span></p>
                          <ul className="space-y-2">
                            {treatment.steps.map((step, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span> {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-sm text-amber-700 font-medium italic">No specific treatment protocol found for "{prediction.label}".</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseAnalyzer;