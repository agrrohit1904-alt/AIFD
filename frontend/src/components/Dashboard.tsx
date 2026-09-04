import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Image as ImageIcon, Camera, SwitchCamera } from 'lucide-react';

interface ProcessResponse {
  document_id: string;
  risk_score: number;
  signals: any;
  status: string;
}

export default function Dashboard() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  const [docMode, setDocMode] = useState<'upload' | 'camera'>('upload');
  
  const [liveFile, setLiveFile] = useState<File | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState<'upload' | 'camera'>('upload');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const docWebcamRef = useRef<Webcam>(null);
  const liveWebcamRef = useRef<Webcam>(null);

  // Utility to convert Base64 screenshot to a File object
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      setDocPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleLiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLiveFile(file);
      setLivePreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const captureDoc = useCallback(() => {
    const imageSrc = docWebcamRef.current?.getScreenshot();
    if (imageSrc) {
      const file = dataURLtoFile(imageSrc, 'doc_capture.jpg');
      setDocumentFile(file);
      setDocPreviewUrl(imageSrc);
      setDocMode('upload'); // Switch back to see preview
      setResult(null);
    }
  }, [docWebcamRef]);

  const captureLive = useCallback(() => {
    const imageSrc = liveWebcamRef.current?.getScreenshot();
    if (imageSrc) {
      const file = dataURLtoFile(imageSrc, 'live_capture.jpg');
      setLiveFile(file);
      setLivePreviewUrl(imageSrc);
      setLiveMode('upload'); // Switch back to see preview
      setResult(null);
    }
  }, [liveWebcamRef]);

  const handleUpload = async () => {
    if (!documentFile || !liveFile) {
      setError("Please provide both an ID Document and a Live Selfie.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('live_photo', liveFile);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/document/verify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to process document. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const docVideoConstraints = {
    width: 640,
    height: 480,
    facingMode: "environment" // Use back camera for documents
  };

  const selfieVideoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user" // Use front camera for selfie
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="text-cyan-400" />
          Identity Document Verification
        </h1>
        <p className="text-slate-400 mt-2">Upload or capture a passport/ID and a live selfie for automated risk assessment</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Uploads & Previews */}
        <div className="space-y-6">
          
          {/* Document Capture */}
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-300" />
                1. ID Document
              </h2>
              <button 
                onClick={() => setDocMode(docMode === 'upload' ? 'camera' : 'upload')}
                className="text-sm flex items-center gap-1 text-cyan-400 hover:text-cyan-200"
              >
                <SwitchCamera className="w-4 h-4" />
                {docMode === 'upload' ? 'Use Camera' : 'Upload File'}
              </button>
            </div>

            {docMode === 'upload' ? (
              <>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-800/50 transition-colors">
                  <input type="file" id="doc-upload" className="hidden" accept="image/*" onChange={handleDocChange} />
                  <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="w-10 h-10 text-slate-500" />
                    <span className="text-slate-300 font-medium">Click to select ID image</span>
                  </label>
                </div>
                {docPreviewUrl && (
                  <div className="mt-4 text-center">
                    <img src={docPreviewUrl} alt="Doc preview" className="max-h-40 rounded-md border border-slate-700 object-contain mx-auto" />
                    <button onClick={() => { setDocumentFile(null); setDocPreviewUrl(null); }} className="text-red-500 text-sm mt-2">Clear</button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="rounded-lg overflow-hidden border border-slate-600 mb-3 bg-slate-700">
                  <Webcam
                    audio={false}
                    ref={docWebcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={docVideoConstraints}
                    className="w-full max-h-48 object-cover"
                  />
                </div>
                <button onClick={captureDoc} className="bg-cyan-900/40 text-cyan-300 px-4 py-2 rounded font-medium hover:bg-cyan-800/60 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Capture ID
                </button>
              </div>
            )}
          </div>

          {/* Live Selfie Capture */}
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-300" />
                2. Live Selfie
              </h2>
              <button 
                onClick={() => setLiveMode(liveMode === 'upload' ? 'camera' : 'upload')}
                className="text-sm flex items-center gap-1 text-cyan-400 hover:text-cyan-200"
              >
                <SwitchCamera className="w-4 h-4" />
                {liveMode === 'upload' ? 'Use Camera' : 'Upload File'}
              </button>
            </div>

            {liveMode === 'upload' ? (
              <>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-800/50 transition-colors">
                  <input type="file" id="live-upload" className="hidden" accept="image/*" onChange={handleLiveChange} />
                  <label htmlFor="live-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="w-10 h-10 text-slate-500" />
                    <span className="text-slate-300 font-medium">Click to select selfie</span>
                  </label>
                </div>
                {livePreviewUrl && (
                  <div className="mt-4 text-center">
                    <img src={livePreviewUrl} alt="Selfie preview" className="max-h-40 rounded-md border border-slate-700 object-contain mx-auto" />
                    <button onClick={() => { setLiveFile(null); setLivePreviewUrl(null); }} className="text-red-500 text-sm mt-2">Clear</button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="rounded-lg overflow-hidden border border-slate-600 mb-3 bg-slate-700">
                  <Webcam
                    audio={false}
                    ref={liveWebcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={selfieVideoConstraints}
                    className="w-full max-h-48 object-cover"
                  />
                </div>
                <button onClick={captureLive} className="bg-cyan-900/40 text-cyan-300 px-4 py-2 rounded font-medium hover:bg-cyan-800/60 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Capture Selfie
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          {(docPreviewUrl || livePreviewUrl) && (
            <button
              onClick={handleUpload}
              disabled={loading || !documentFile || !liveFile}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-md hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 transition-colors font-medium text-lg shadow-sm"
            >
              {loading ? 'Processing Pipeline...' : 'Run Full Verification'}
            </button>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold">7-Step Verification Pipeline</h2>
                <div className="text-right">
                  <p className="text-sm text-slate-400 uppercase tracking-wide font-semibold">Risk Score</p>
                  <p className={`text-4xl font-bold ${getRiskColor(result.risk_score)}`}>
                    {result.risk_score} <span className="text-lg text-slate-500">/ 100</span>
                  </p>
                </div>
              </div>

              {/* 7-Step SIH Pipeline Checklist */}
              <div className="space-y-3 mb-8">
                {[
                  { step: '1. Document Upload', status: true, detail: 'Document & Selfie captured' },
                  { step: '2. OCR Extraction', status: !!result.signals.document_type || !!result.signals.qr_code_validated, detail: result.signals.document_type || 'Text Extracted' },
                  { step: '3. MRZ / Format Validation', status: true, detail: result.signals.mrz_validation === 'Failed' ? 'Failed Checksums' : 'Validated' },
                  { step: '4. Tampering Detection', status: result.signals.tampering_detected !== 'Yes', detail: result.signals.tampering_detected === 'Yes' ? 'Tampering Flagged' : 'No Tampering Detected' },
                  { step: '5. Face Match (Deep Learning)', status: result.signals.face_match !== 'Match Failed', detail: result.signals.face_match },
                  { step: '6. Database / Rule Checks', status: result.signals.document_expired !== 'Yes' && result.signals.blacklist_match !== 'Yes', detail: 'Checked Expiry & Blacklist' },
                  { step: '7. Explainable Risk Score', status: true, detail: `Score: ${result.risk_score}/100 generated` }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded border border-slate-700">
                    {item.status ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-grow flex justify-between items-center">
                      <span className="font-semibold text-slate-100">{item.step}</span>
                      <span className="text-sm text-slate-300 truncate max-w-[200px]">{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700">
                <h3 className="font-medium text-slate-100">Raw Signal Breakdown</h3>
                
                <div className="grid gap-3">
                  {Object.entries(result.signals).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700">
                      <span className="text-slate-300 capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-100 text-right ml-4">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 flex items-center text-sm text-slate-400 gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Document ID: {result.document_id}
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[300px]">
              <AlertTriangle className="w-12 h-12 text-slate-600 mb-3" />
              <p>Provide both an ID and a Live Selfie via upload or camera, then run verification to see the results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
