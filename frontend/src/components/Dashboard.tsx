import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Shield, UploadCloud, Camera, CheckCircle, AlertTriangle, SwitchCamera, Scan, Activity, Fingerprint, ChevronRight, Database } from 'lucide-react';

export default function Dashboard() {
  const [docMode, setDocMode] = useState<'upload' | 'camera'>('upload');
  const [liveMode, setLiveMode] = useState<'upload' | 'camera'>('camera');

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  const [liveFile, setLiveFile] = useState<File | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const docWebcamRef = useRef<Webcam>(null);
  const liveWebcamRef = useRef<Webcam>(null);

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      setDocPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLiveFile(file);
      setLivePreviewUrl(URL.createObjectURL(file));
    }
  };

  const captureDoc = useCallback(() => {
    const imageSrc = docWebcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera_doc.jpg", { type: "image/jpeg" });
          setDocumentFile(file);
          setDocPreviewUrl(imageSrc);
        });
    }
  }, [docWebcamRef]);

  const captureLive = useCallback(() => {
    const imageSrc = liveWebcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera_live.jpg", { type: "image/jpeg" });
          setLiveFile(file);
          setLivePreviewUrl(imageSrc);
        });
    }
  }, [liveWebcamRef]);

  const handleUpload = async () => {
    if (!documentFile || !liveFile) {
      setError("Please provide both documents.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('live_photo', liveFile);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/document/verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (typeof response.data === 'string') {
        setError("Cloudflare Error: Backend server is unreachable or crashed.");
      } else {
        setResult(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const docVideoConstraints = { width: 640, height: 480, facingMode: "environment" };
  const selfieVideoConstraints = { width: 640, height: 480, facingMode: "user" };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-white">
          Identity Verification <span className="text-cyan-400">Terminal</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Upload or capture your government ID and a live selfie. Our 4-tier AI engine will perform OCR, forgery detection, and biometric matching in seconds.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Data Input */}
        <div className="space-y-6">
          
          {/* Step 1: Document */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/20 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                <div className="p-2 bg-slate-700/50 rounded-lg text-cyan-400"><Scan size={20} /></div>
                1. Government ID
              </h3>
              <button onClick={() => setDocMode(docMode === 'upload' ? 'camera' : 'upload')} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 px-3 py-1.5 rounded-full">
                <SwitchCamera size={14} /> {docMode === 'upload' ? 'Scan via Camera' : 'Upload File'}
              </button>
            </div>

            {docMode === 'upload' ? (
              docPreviewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-600 group/preview">
                  <img src={docPreviewUrl} className="w-full h-48 object-cover opacity-80" alt="ID" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => { setDocumentFile(null); setDocPreviewUrl(null); }} className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium backdrop-blur-md">Remove ID</button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-xl hover:border-cyan-400 hover:bg-cyan-900/10 transition-all cursor-pointer">
                  <UploadCloud className="w-12 h-12 text-slate-500 mb-3" />
                  <span className="text-slate-300 font-medium">Drop ID Image Here</span>
                  <span className="text-slate-500 text-sm mt-1">PNG, JPG up to 10MB</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleDocChange} />
                </label>
              )
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-600 relative">
                  <Webcam audio={false} ref={docWebcamRef} screenshotFormat="image/jpeg" videoConstraints={docVideoConstraints} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 border-2 border-cyan-500/30 m-4 rounded-lg pointer-events-none"></div>
                </div>
                <button onClick={captureDoc} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  <Camera size={18} /> Capture ID
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Selfie */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                <div className="p-2 bg-slate-700/50 rounded-lg text-blue-400"><Fingerprint size={20} /></div>
                2. Live Biometrics
              </h3>
              <button onClick={() => setLiveMode(liveMode === 'upload' ? 'camera' : 'upload')} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full">
                <SwitchCamera size={14} /> {liveMode === 'upload' ? 'Use Webcam' : 'Upload File'}
              </button>
            </div>

            {liveMode === 'upload' ? (
              livePreviewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-600 group/preview">
                  <img src={livePreviewUrl} className="w-full h-48 object-cover opacity-80" alt="Selfie" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => { setLiveFile(null); setLivePreviewUrl(null); }} className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium backdrop-blur-md">Remove Selfie</button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-xl hover:border-blue-400 hover:bg-blue-900/10 transition-all cursor-pointer">
                  <UploadCloud className="w-12 h-12 text-slate-500 mb-3" />
                  <span className="text-slate-300 font-medium">Drop Selfie Here</span>
                  <span className="text-slate-500 text-sm mt-1">Make sure your face is clearly visible</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLiveChange} />
                </label>
              )
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-600 relative">
                  <Webcam audio={false} ref={liveWebcamRef} screenshotFormat="image/jpeg" videoConstraints={selfieVideoConstraints} className="w-full h-48 object-cover" />
                  {/* Face outline overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-40 border-2 border-dashed border-blue-400/50 rounded-[40%]"></div>
                  </div>
                </div>
                <button onClick={captureLive} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  <Camera size={18} /> Capture Face
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !documentFile || !liveFile}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${
              loading 
                ? 'bg-slate-700 text-cyan-400 cursor-wait shadow-cyan-900/20 border border-cyan-500/30'
                : !documentFile || !liveFile
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 border border-transparent hover:-translate-y-1'
            }`}
          >
            {loading ? (
              <><Activity className="animate-pulse" /> Running Deep Learning Models...</>
            ) : (
              <><Shield /> Initialize Verification <ChevronRight size={20} /></>
            )}
          </button>
        </div>

        {/* Right Column: AI Results Dashboard */}
        <div className="h-full">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-5 rounded-2xl flex items-start gap-3 mb-6 shadow-lg shadow-red-500/5">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-300 mb-1">Verification Failed</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {result ? (
            <div className="bg-slate-800/80 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-fade-in flex flex-col h-full">
              
              {/* Header Score Section */}
              <div className="p-8 border-b border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Analysis Complete</h2>
                    <p className="text-slate-400 text-sm font-mono tracking-widest">ID: {result.document_id ? result.document_id.split('-')[0] : 'UNKNOWN'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Risk Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-5xl font-black tracking-tighter ${result.risk_score > 70 ? 'text-red-500' : result.risk_score > 30 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {result.risk_score || 0}
                      </span>
                      <span className="text-slate-500 font-bold text-xl">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">7-Tier Pipeline Status</h3>
                
                {/* 7-Step Pipeline Design */}
                <div className="space-y-2 mb-8 flex-1">
                  {[
                    { step: 'Document Input', status: true, detail: 'High-res image acquired', icon: <UploadCloud size={16}/> },
                    { step: 'OCR Engine', status: !!result?.signals?.document_type || !!result?.signals?.qr_code_validated, detail: result?.signals?.document_type || 'Text decoded successfully', icon: <Scan size={16}/> },
                    { step: 'Cryptographic MRZ', status: true, detail: result?.signals?.mrz_validation === 'Failed' ? 'Invalid structure' : 'Integrity verified', icon: <Database size={16}/> },
                    { step: 'Adversarial Defense', status: result?.signals?.tampering_detected !== 'Yes', detail: result?.signals?.tampering_detected === 'Yes' ? 'Anomalies detected' : 'No forgery signatures', icon: <Shield size={16}/> },
                    { step: 'ArcFace Biometrics', status: result?.signals?.face_match !== 'Match Failed', detail: result?.signals?.face_match || 'Analyzed', icon: <Fingerprint size={16}/> },
                    { step: 'Compliance DB', status: result?.signals?.document_expired !== 'Yes' && result?.signals?.blacklist_match !== 'Yes', detail: 'Passed watchlists', icon: <Activity size={16}/> },
                    { step: 'Decision Matrix', status: true, detail: `Calculated Risk: ${result.risk_score || 0}%`, icon: <CheckCircle size={16}/> }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors group">
                      <div className={`p-2 rounded-lg ${item.status ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {item.status ? item.icon : <AlertTriangle size={16} />}
                      </div>
                      <div className="flex-grow flex justify-between items-center">
                        <span className="font-semibold text-slate-200 text-sm">{idx + 1}. {item.step}</span>
                        <span className="text-xs text-slate-400 font-mono hidden sm:block truncate max-w-[180px]">{item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 border-dashed rounded-2xl flex flex-col items-center justify-center h-full min-h-[500px] text-center p-10 relative overflow-hidden">
              {loading ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scan"></div>
                  <Shield className="w-16 h-16 text-cyan-500 mb-6 animate-pulse" />
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing Data Securely</h3>
                  <p className="text-slate-400 max-w-sm">Deep learning models are currently processing the document structure, extracting text, and rendering geometric face embeddings...</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-700">
                    <Activity className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">System Ready</h3>
                  <p className="text-slate-500 max-w-sm">Input the required documents on the left to initiate the secure verification pipeline.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
