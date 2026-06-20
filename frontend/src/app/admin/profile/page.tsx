'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Profile { id: number; fullName: string; username: string; email: string; role: string; createdAt: string; }

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => { api.get('/api/teacher/me').then(res => setProfile(res.data)).catch(console.error); }, []);

  if (!profile) return <div className="text-slate-500 text-center mt-20">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
        Profile
      </h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-200">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
            {profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-indigo-600 text-sm tracking-wider">{profile.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Username</p><p className="text-sm text-slate-900">{profile.username}</p></div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p><p className="text-sm text-slate-900">{profile.email || 'Not set'}</p></div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Role</p><p className="text-sm text-indigo-600">{profile.role}</p></div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Joined</p><p className="text-sm text-slate-900">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</p></div>
        </div>
      </div>
    </div>
  );
}
