'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  id: number; name: string; rollNo: string; email: string;
  username: string; photoPath: string; createdAt: string; role: string;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.get('/api/student/me').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  if (!profile) return <div className="text-slate-400 animate-pulse text-center mt-20">Loading profile...</div>;

  const photoUrl = profile.photoPath ? `http://localhost:8080${profile.photoPath}` : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">My Profile</h1>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-indigo-200">
            {photoUrl && <AvatarImage src={photoUrl} alt={profile.name} className="object-cover" />}
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl font-bold">
              {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl text-slate-900">{profile.name}</CardTitle>
            <p className="text-indigo-600 text-sm tracking-wider">{profile.rollNo}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Username</p>
              <p className="text-slate-700">{profile.username}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
              <p className="text-slate-700">{profile.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Roll Number</p>
              <p className="text-slate-700">{profile.rollNo || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Role</p>
              <p className="text-indigo-600">{profile.role}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Registered</p>
              <p className="text-slate-700">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
