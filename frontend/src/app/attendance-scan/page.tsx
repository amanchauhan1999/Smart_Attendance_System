'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        if (res.ok) {
          setPythonOnline(true);
        } else {
          setPythonOnline(false);
        }
      } catch {
        setPythonOnline(false);
      }
    };
    checkPython();
    const interval = setInterval(checkPython, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isWithinHours) {
      setStatus('Kiosk is locked - outside school hours (7AM - 5PM)');
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('Ready - Position your face and blink 2-3 times');
      } catch (e: any) {
        setStatus('Camera error: ' + e.message);
      }
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
    setLoading(true);
    setLastStudent('');
    setBlinks(0);
    setScanProgress(0);
    setScanPhase('Capturing frames...');

    try {
      setScanProgress(10);
      const frames = await captureFrames(5000, 10);
      setScanProgress(40);
      setScanPhase('Analyzing face and blink pattern...');

      const formData = new FormData();
      frames.forEach((blob, idx) => formData.append('images', blob, `frame${idx}.jpg`));

      let detectRes: Response;
      try {
        detectRes = await fetch(`${PYTHON_URL}/detect-sequence`, { method: 'POST', body: formData });
      } catch {
        throw new Error('Face detection service is offline. Please check if the Python service is running.');
      }

      if (!detectRes.ok) throw new Error('Detection service returned an error');
      const result = await detectRes.json();
      setBlinks(result.blinks || 0);
      setScanProgress(70);

      if (result.matched && (result.blinks || 0) >= 2) {
        setScanPhase('Face verified. Marking attendance...');
        setScanProgress(85);

        const attFormData = new FormData();
        attFormData.append('rollNo', result.rollNo);

        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const attRes = await fetch(`${API_URL}/api/attendance`, { method: 'POST', body: attFormData, headers });
        const attData = await attRes.json();

        setScanProgress(100);

        if (attData.success) {
          setLastStudent(attData.studentName);
          setStatus('PRESENT: ' + attData.studentName + ' (' + result.rollNo + ')');
        } else {
          setStatus(attData.message || 'Attendance failed');
        }
      } else if (result.matched) {
        setScanProgress(100);
        setStatus('Blink not enough (' + (result.blinks || 0) + '/' + (result.requiredBlinks || 2) + '). Try again.');
      } else {
        setScanProgress(100);
        setStatus(result.message || 'Face not recognized. Try again.');
      }

      setTimeout(() => {
        setStatus('Ready - Position your face and blink 2-3 times');
        setBlinks(0);
        setScanProgress(0);
        setScanPhase('');
      }, 3000);

    } catch (e: any) {
      setScanProgress(0);
      setStatus('Error: ' + e.message);
      setTimeout(() => setStatus('Ready - Position your face and blink 2-3 times'), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,163,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,163,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="text-cyan-400 font-mono text-sm tracking-wider">SMART ATTENDANCE KIOSK</div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-xs font-mono ${pythonOnline === true ? 'text-emerald-400' : pythonOnline === false ? 'text-red-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${pythonOnline === true ? 'bg-emerald-400 animate-pulse' : pythonOnline === false ? 'bg-red-400' : 'bg-slate-500'}`} />
            {pythonOnline === true ? 'AI Service Online' : pythonOnline === false ? 'AI Service Offline' : 'Checking...'}
          </div>
          <div className="text-slate-400 font-mono text-sm">{currentTime}</div>
        </div>
      </div>

      <Card className="relative z-10 w-full max-w-2xl border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,163,0.1)]">
        <CardContent className="p-6 space-y-5">
          {!isWithinHours ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">&#128683;</div>
              <h2 className="text-2xl font-bold text-red-400 font-mono tracking-wider">KIOSK LOCKED</h2>
              <p className="text-slate-400 mt-2">School hours: 7:00 AM - 5:00 PM</p>
              <p className="text-slate-500 text-sm mt-1">Current time: {currentTime}</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
                  FACE ATTENDANCE
                </h1>
                <p className="text-slate-400 text-sm mt-1">Blink 2-3 times when scanning</p>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,163,0.15)]">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-80 object-cover bg-black" />
                {loading && (
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 p-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{scanPhase}</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className="text-slate-400">{status}</span>
                </div>
                <span className="text-cyan-400 font-mono">Blinks: {blinks}</span>
              </div>

              {lastStudent && (
                <div className="text-center p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
                  <div className="text-emerald-400 font-bold text-lg font-mono">&#10003; PRESENT</div>
                  <div className="text-white text-xl mt-1">{lastStudent}</div>
                </div>
              )}

              <Button onClick={startAttendance} disabled={loading} className="w-full h-14 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold tracking-wider text-lg hover:shadow-[0_0_30px_rgba(0,255,163,0.4)] transition-all disabled:opacity-50">
                {loading ? 'Scanning...' : 'Start Scan'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
