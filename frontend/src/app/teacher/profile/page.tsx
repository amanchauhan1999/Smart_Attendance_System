'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Profile {
  id: number; fullName: string; username: string; email: string; role: string; createdAt: string;
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.get('/api/teacher/me').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  if (!profile) return <div className="text-cyan-400 animate-pulse text-center mt-20">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
        MY PROFILE
      </h1>

      <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-cyan-400/30">
            <AvatarFallback className="bg-cyan-400/10 text-cyan-400 text-xl font-bold">
              {profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl text-white font-bold">{profile.fullName}</h2>
            <p className="text-cyan-400 text-sm tracking-wider">{profile.role}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Username</p>
              <p className="text-slate-300">{profile.username}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
              <p className="text-slate-300">{profile.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Role</p>
              <p className="text-cyan-400">{profile.role}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Joined</p>
              <p className="text-slate-300">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
