'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'TEACHER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/api/auth/register', form);
      const data = res.data;
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setSuccess('Registration successful! Redirecting...');

      setTimeout(() => {
        if (data.role === 'ADMIN') router.push('/admin');
        else if (data.role === 'TEACHER') router.push('/teacher');
        else router.push('/student');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="relative z-10 w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-wider text-slate-900">
            Register
          </CardTitle>
          <p className="text-slate-500 text-sm tracking-widest uppercase mt-1">Create your account</p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500 text-xs tracking-widest uppercase">Full Name</Label>
              <Input placeholder="Dr. Rajesh Kumar" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 text-xs tracking-widest uppercase">Username</Label>
              <Input placeholder="rajesh_kumar" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} required className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 text-xs tracking-widest uppercase">Email</Label>
              <Input type="email" placeholder="rajesh@school.edu" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 text-xs tracking-widest uppercase">Password</Label>
              <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required minLength={6} className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 text-xs tracking-widest uppercase">Role</Label>
              <Select value={form.role} onValueChange={(v) => { if (v) setForm({...form, role: v}); }}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin (HOD)</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center">{error}</div>}
            {success && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm text-center">{success}</div>}

            <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wider uppercase transition-all duration-300">
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors">Login here</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
