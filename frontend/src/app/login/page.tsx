'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const data = res.data;
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      if (data.role === 'ADMIN') router.push('/admin');
      else if (data.role === 'TEACHER') router.push('/teacher');
      else router.push('/student');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-white/80 text-sm font-medium tracking-wider uppercase">Smart Attendance</span>
            </div>
          </div>

          {/* Illustration */}
          <div className="mb-10">
            <svg viewBox="0 0 400 320" fill="none" className="w-full max-w-md">
              {/* Monitor/Screen */}
              <rect x="60" y="40" width="280" height="200" rx="12" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
              <rect x="70" y="50" width="260" height="170" rx="6" fill="white" fillOpacity="0.05" />

              {/* Face outline on screen */}
              <circle cx="200" cy="120" r="40" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
              <circle cx="185" cy="112" r="4" fill="white" fillOpacity="0.6" />
              <circle cx="215" cy="112" r="4" fill="white" fillOpacity="0.6" />
              <path d="M190 130 Q200 138 210 130" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Scan lines */}
              <line x1="155" y1="90" x2="245" y2="90" stroke="#22c55e" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="4 4">
                <animate attributeName="y1" values="80;160;80" dur="3s" repeatCount="indefinite" />
                <animate attributeName="y2" values="80;160;80" dur="3s" repeatCount="indefinite" />
              </line>

              {/* Corner brackets */}
              <path d="M160 85 L160 75 L170 75" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M240 85 L240 75 L230 75" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M160 155 L160 165 L170 165" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M240 155 L240 165 L230 165" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Check mark */}
              <circle cx="320" cy="70" r="22" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2" />
              <path d="M310 70 L317 77 L332 62" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

              {/* Stand */}
              <rect x="180" y="240" width="40" height="8" rx="2" fill="white" fillOpacity="0.15" />
              <rect x="160" y="248" width="80" height="4" rx="2" fill="white" fillOpacity="0.1" />

              {/* Floating cards */}
              <rect x="20" y="180" width="100" height="60" rx="8" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
              <circle cx="40" cy="200" r="10" fill="#818cf8" fillOpacity="0.4" />
              <rect x="55" y="195" width="50" height="4" rx="2" fill="white" fillOpacity="0.3" />
              <rect x="55" y="203" width="35" height="3" rx="1.5" fill="white" fillOpacity="0.15" />

              <rect x="280" y="180" width="100" height="60" rx="8" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
              <circle cx="300" cy="200" r="10" fill="#22c55e" fillOpacity="0.4" />
              <rect x="315" y="195" width="50" height="4" rx="2" fill="white" fillOpacity="0.3" />
              <rect x="315" y="203" width="35" height="3" rx="1.5" fill="white" fillOpacity="0.15" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Face Recognition<br />Attendance System
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-md">
            Secure, automated attendance tracking using AI-powered facial recognition with liveness detection.
          </p>

          <div className="flex items-center gap-8 mt-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Real-time</p>
                <p className="text-white/40 text-xs">Instant marking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Secure</p>
                <p className="text-white/40 text-xs">Liveness check</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Analytics</p>
                <p className="text-white/40 text-xs">Live reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-slate-900 font-bold text-lg">Smart Attendance</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1">Sign in to your account to continue</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <a href="/attendance-scan" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Open Kiosk Device
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
