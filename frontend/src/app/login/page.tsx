'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute top-8 left-8 text-cyan-400/20 font-mono text-xs tracking-widest uppercase select-none">
        SYS::AUTH_v3.2.1
      </div>
      <div className="absolute bottom-8 right-8 text-emerald-400/20 font-mono text-xs tracking-widest select-none">
        SECURED | ENCRYPTED
      </div>

      <Card className="relative z-10 w-full max-w-md border-cyan-500/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,255,163,0.07)] animate-[cardEntry_0.8s_ease-out]">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-cyan-400/5 to-transparent pointer-events-none" />

        <CardHeader className="text-center pb-2 relative">
          <div className="mx-auto mb-5 w-20 h-20 rounded-2xl border border-cyan-400/30 flex items-center justify-center bg-gradient-to-br from-cyan-400/10 to-emerald-400/5 shadow-[0_0_40px_rgba(0,255,163,0.15)] animate-[glow_3s_ease-in-out_infinite_alternate]">
            <svg className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,163,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 font-mono">
            SMART ATTENDANCE
          </CardTitle>
          <p className="text-slate-500 text-xs tracking-[0.3em] uppercase mt-2 font-mono">Secure Authentication Portal</p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400/80 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <span className="text-emerald-400/60 text-[10px] tracking-widest font-mono uppercase">System Online</span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 relative">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-500 text-[10px] tracking-[0.25em] uppercase font-mono">Username</Label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-slate-900/60 border-slate-700/40 text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-12 font-mono tracking-wider transition-all duration-300 hover:border-slate-600/60"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 text-[10px] tracking-[0.25em] uppercase font-mono">Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-900/60 border-slate-700/40 text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-12 font-mono tracking-wider transition-all duration-300 hover:border-slate-600/60"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-mono animate-[shake_0.4s_ease-in-out]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold tracking-[0.15em] uppercase hover:shadow-[0_0_40px_rgba(0,255,163,0.3)] transition-all duration-500 font-mono relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Authenticate'}</span>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/attendance-scan" className="inline-flex items-center gap-2 text-emerald-400/70 hover:text-emerald-300 transition-all duration-300 text-xs tracking-widest font-mono uppercase border border-emerald-400/20 px-4 py-2 rounded-lg hover:bg-emerald-400/5 hover:border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400/60 animate-[pulse_2s_ease-in-out_infinite]" />
              Kiosk Device
            </a>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
