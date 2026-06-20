'use client';

import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_URL || 'http://localhost:5000';

export default function AttendanceScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Initializing camera...');
  const [loading, setLoading] = useState(false);
  const [blinks, setBlinks] = useState(0);
  const [lastStudent, setLastStudent] = useState('');
  const [isWithinHours, setIsWithinHours] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [pythonOnline, setPythonOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsWithinHours(hour >= 7 && hour < 17);
    };
    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkPython = async () => {
      try {
        const res = await fetch(`${PYTHON_URL}/health`);
        setPythonOnline(res.ok);
      } catch { setPythonOnline(false); }
    };
    checkPython();
    const interval = setInterval(checkPython, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isWithinHours) { setStatus('Kiosk is locked - outside school hours (7AM - 5PM)'); return; }
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('Ready - Position your face and blink 2-3 times');
      } catch (e: any) { setStatus('Camera error: ' + e.message); }
    };
    startCamera();
  }, [isWithinHours]);

  const captureFrames = async (durationMs = 5000, fps = 10) => {
    const video = videoRef.current;
    if (!video) return [];
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    const frames = [];
    const intervalMs = 1000 / fps;
    const totalFrames = Math.floor(durationMs / intervalMs);
    for (let i = 0; i < totalFrames; i++) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (blob) frames.push(blob);
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return frames;
  };

  const startAttendance = async () => {
    if (!isWithinHours || loading) return;
    setLoading(true); setLastStudent(''); setBlinks(0); setScanProgress(0); setScanPhase('Capturing frames...');
    try {
      setScanProgress(10);
      const frames = await captureFrames(5000, 10);
      setScanProgress(40); setScanPhase('Analyzing face and blink pattern...');
      const formData = new FormData();
      frames.forEach((blob, idx) => formData.append('images', blob, `frame${idx}.jpg`));
      let detectRes: Response;
      try { detectRes = await fetch(`${PYTHON_URL}/detect-sequence`, { method: 'POST', body: formData }); }
      catch { throw new Error('Face detection service is offline.'); }
      if (!detectRes.ok) throw new Error('Detection service returned an error');
      const result = await detectRes.json();
      setBlinks(result.blinks || 0); setScanProgress(70);
      if (result.matched && (result.blinks || 0) >= 2) {
        setScanPhase('Face verified. Marking attendance...'); setScanProgress(85);
        const attFormData = new FormData();
        attFormData.append('rollNo', result.rollNo);
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const attRes = await fetch(`${API_URL}/api/attendance`, { method: 'POST', body: attFormData, headers });
        const attData = await attRes.json();
        setScanProgress(100);
        if (attData.success) { setLastStudent(attData.studentName); setStatus('PRESENT: ' + attData.studentName + ' (' + result.rollNo + ')'); }
        else { setStatus(attData.message || 'Attendance failed'); }
      } else if (result.matched) {
        setScanProgress(100); setStatus('Blink not enough (' + (result.blinks || 0) + '/' + (result.requiredBlinks || 2) + '). Try again.');
      } else { setScanProgress(100); setStatus(result.message || 'Face not recognized. Try again.'); }
      setTimeout(() => { setStatus('Ready - Position your face and blink 2-3 times'); setBlinks(0); setScanProgress(0); setScanPhase(''); }, 3000);
    } catch (e: any) {
      setScanProgress(0); setStatus('Error: ' + e.message);
      setTimeout(() => setStatus('Ready - Position your face and blink 2-3 times'), 3000);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-slate-900">Smart Attendance Kiosk</h1>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-xs ${pythonOnline === true ? 'text-emerald-600' : pythonOnline === false ? 'text-red-600' : 'text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${pythonOnline === true ? 'bg-emerald-500 animate-pulse' : pythonOnline === false ? 'bg-red-500' : 'bg-slate-400'}`} />
              {pythonOnline === true ? 'AI Online' : pythonOnline === false ? 'AI Offline' : 'Checking...'}
            </div>
            <span className="text-sm text-slate-500">{currentTime}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          {!isWithinHours ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">&#128683;</div>
              <h2 className="text-xl font-bold text-red-600">KIOSK LOCKED</h2>
              <p className="text-slate-500 mt-2">School hours: 7:00 AM - 5:00 PM</p>
              <p className="text-slate-400 text-sm mt-1">Current time: {currentTime}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Face Attendance</h2>
                <p className="text-slate-500 text-sm mt-1">Blink 2-3 times when scanning</p>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-80 object-cover bg-slate-100" />
                {loading && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-3 border-t border-slate-200">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{scanPhase}</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="text-slate-600">{status}</span>
                </div>
                <span className="text-slate-500 font-medium">Blinks: {blinks}</span>
              </div>

              {lastStudent && (
                <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-600 font-bold text-lg">&#10003; PRESENT</div>
                  <div className="text-slate-900 text-xl mt-1">{lastStudent}</div>
                </div>
              )}

              <button onClick={startAttendance} disabled={loading} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg transition-colors disabled:opacity-50">
                {loading ? 'Scanning...' : 'Start Scan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
