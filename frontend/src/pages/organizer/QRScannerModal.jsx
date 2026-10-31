import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, CheckCircle2, AlertCircle, Camera, Search, UserCheck, 
  FlipHorizontal, RefreshCw, XCircle, Volume2, ShieldCheck, Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../services/api';
import Modal from '../../components/Modal';

export default function QRScannerModal({ isOpen, onClose, event, onCheckInSuccess }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanningPaused, setIsScanningPaused] = useState(false);
  
  const scannerRef = useRef(null);
  const isStartingRef = useRef(false);

  // Clean state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setTicketInput('');
      setResult(null);
      setError(null);
      setCameraError(null);
      setIsScanningPaused(false);
    } else {
      if (activeTab === 'camera') {
        // Small delay to allow modal DOM container to render
        const timer = setTimeout(() => {
          startCamera();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, activeTab]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (cameraId = null) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraError(null);

    try {
      // Discover available cameras
      let devices = cameras;
      if (devices.length === 0) {
        try {
          devices = await Html5Qrcode.getCameras();
          setCameras(devices);
          if (devices.length > 0 && !cameraId) {
            // Prefer back camera if available
            const backCam = devices.find(d => 
              d.label.toLowerCase().includes('back') || 
              d.label.toLowerCase().includes('environment') ||
              d.label.toLowerCase().includes('rear')
            );
            cameraId = backCam ? backCam.id : devices[0].id;
            setSelectedCameraId(cameraId);
          }
        } catch (e) {
          console.warn('Could not list cameras:', e);
        }
      }

      // Stop existing instance if running
      await stopCamera();

      // Ensure the container exists in DOM
      const readerElem = document.getElementById('qr-camera-viewport');
      if (!readerElem) {
        isStartingRef.current = false;
        return;
      }

      const html5QrCode = new Html5Qrcode('qr-camera-viewport');
      scannerRef.current = html5QrCode;

      const cameraConfig = cameraId 
        ? { deviceId: { exact: cameraId } } 
        : { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleCameraDecoded(decodedText);
        },
        () => {
          // Frame parsed with no QR (normal frame-by-frame polling)
        }
      );

      setCameraActive(true);
      setIsScanningPaused(false);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError(
        err.message || 'Unable to access camera. Please allow camera permissions in your browser or use Manual Entry.'
      );
      setCameraActive(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping camera:', err);
      } finally {
        scannerRef.current = null;
        setCameraActive(false);
      }
    }
  };

  const handleCameraDecoded = async (decodedText) => {
    if (!decodedText || isScanningPaused) return;

    // Pause scanning to prevent multiple triggers for the same pass
    setIsScanningPaused(true);
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        scannerRef.current.pause();
      } catch (e) {
        // ignore
      }
    }

    await handleVerify(decodedText);
  };

  const resumeCamera = () => {
    setResult(null);
    setError(null);
    setIsScanningPaused(false);
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {
        // If resume fails, restart camera
        startCamera(selectedCameraId);
      }
    } else {
      startCamera(selectedCameraId);
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setSelectedCameraId(nextCamera.id);
    await startCamera(nextCamera.id);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const tempScanner = new Html5Qrcode('qr-file-helper');
      const decodedText = await tempScanner.scanFile(file, true);
      tempScanner.clear();
      await handleVerify(decodedText);
    } catch (err) {
      setError('Could not decode QR code from the uploaded image. Please ensure it is clear.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || ticketInput).trim();
    if (!code) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.checkInAttendee(event.id, code);
      setResult(res);
      setTicketInput('');

      if (!res.already_checked_in) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        if (onCheckInSuccess) onCheckInSuccess();
      }
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Gate Pass Scanner: ${event.title}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        
        {/* Event Quick Badge */}
        <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Venue Gate:</span>{' '}
            <strong className="text-slate-900">{event.venue}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Checked-In:</span>{' '}
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-900 text-white text-[10px] tracking-tight">
              {event.attended_count || 0} / {event.registered_count || 0}
            </span>
          </div>
        </div>

        {/* Tab Switcher: Live Camera vs Manual Entry */}
        <div className="grid grid-cols-2 p-1 bg-[#F8F9FA] rounded-2xl border border-slate-100 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-slate-700" />
            Live Camera Scanner
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              stopCamera();
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-slate-700" />
            Manual / Barcode Gun
          </button>
        </div>

        {/* Hidden container for image file QR extraction */}
        <div id="qr-file-helper" className="hidden" />

        {/* TAB 1: Live Camera Viewport */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[300px] flex flex-col items-center justify-center text-white">
              
              {/* html5-qrcode video viewport */}
              <div 
                id="qr-camera-viewport" 
                className="w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden"
              />

              {/* Viewfinder Target Reticle & Laser Sweep Animation */}
              {cameraActive && !isScanningPaused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative w-56 h-56 border-2 border-dashed border-orange-500/80 rounded-2xl flex items-center justify-center shadow-lg">
                    {/* Corner Reticle Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-orange-500 -mt-1 -ml-1 rounded-tl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-orange-500 -mt-1 -mr-1 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-orange-500 -mb-1 -ml-1 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-orange-500 -mb-1 -mr-1 rounded-br" />
                    
                    {/* Laser scanning bar */}
                    <div className="absolute left-2 right-2 h-0.5 bg-orange-400 shadow-[0_0_8px_#f97316] animate-pulse" />
                  </div>
                </div>
              )}

              {/* Camera Inactive / Permission Prompt */}
              {!cameraActive && !cameraError && (
                <div className="p-6 text-center space-y-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-300">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Camera Standby</div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Click below to activate your device camera and scan student entry passes in real-time.
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera(selectedCameraId)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Activate Camera
                  </button>
                </div>
              )}

              {/* Camera Permission / Device Error */}
              {cameraError && (
                <div className="p-6 text-center space-y-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-rose-950/80 mx-auto flex items-center justify-center text-rose-400 border border-rose-800">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-rose-300">Camera Access Error</div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      {cameraError}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => startCamera()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Access
                    </button>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-3.5 py-2 bg-white text-slate-900 rounded-xl text-xs font-semibold uppercase tracking-wider"
                    >
                      Use Manual Entry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls Bar */}
            {cameraActive && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-semibold text-slate-700">Camera active</span>
                </div>

                <div className="flex items-center gap-2">
                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="px-3 py-1.5 rounded-xl bg-[#F8F9FA] border border-slate-200/70 text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1.5"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      Flip Lens
                    </button>
                  )}

                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#F8F9FA] border border-slate-200/70 text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Manual / Barcode Scanner Field */}
        {activeTab === 'manual' && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Scan Pass Barcode or Enter Ticket Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. TKT-HACK-7A9B"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono uppercase focus:outline-none focus:border-slate-900 shadow-2xs"
                  />
                </div>
                <button
                  onClick={() => handleVerify()}
                  disabled={loading || !ticketInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Compatible with hardware USB/Bluetooth barcode readers and manual ticket IDs.
              </p>
            </div>
          </div>
        )}

        {/* Verification Success Display */}
        {result && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 animate-slide-up shadow-sm ${
              result.already_checked_in
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-current/15">
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.already_checked_in ? (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span>{result.message}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                result.already_checked_in ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {result.already_checked_in ? 'Repeated Scan' : 'Entry Granted'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-800">
              <div>
                <span className="text-slate-500 text-[11px]">Student Name:</span>
                <div className="font-bold text-xs">{result.student_name}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Pass Code:</span>
                <div className="font-mono text-xs font-semibold">{result.ticket_code}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Email / Roll:</span>
                <div className="text-xs text-slate-700 truncate">{result.student_email}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Gate Check-in Time:</span>
                <div className="font-mono text-xs text-slate-700">{result.attended_at}</div>
              </div>
            </div>

            {/* Resume / Scan Next CTA */}
            {activeTab === 'camera' && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={resumeCamera}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Next Pass
                </button>
              </div>
            )}
          </div>
        )}

        {/* Verification Error Display */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 animate-slide-up shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-sm">Gate Pass Rejected</div>
                <p className="mt-0.5 text-xs text-rose-800">{error}</p>
              </div>
            </div>
            {activeTab === 'camera' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={resumeCamera}
                  className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>VIT-AP Gate Security Protocol</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Close Gate Console
          </button>
        </div>

      </div>
    </Modal>
  );
}
