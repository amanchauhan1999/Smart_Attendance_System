'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Student { id: number; name: string; rollNo: string; email: string; username?: string; isActive: boolean; }

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', rollNo: '', email: '', username: '', password: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    const res = await api.get('/api/teacher/students');
    setStudents(res.data);
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || (s.rollNo || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.rollNo) {
      setAddMsg('Name and roll number are required');
      return;
    }
    setAddLoading(true);
    setAddMsg('');
    try {
      const formData = new FormData();
      formData.append('rollNo', form.rollNo);
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (form.username) formData.append('username', form.username);
      if (form.password) formData.append('password', form.password);
      if (photo) formData.append('photo', photo);

      await api.post('/api/teacher/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowAdd(false);
      setForm({ name: '', rollNo: '', email: '', username: '', password: '' });
      setPhoto(null);
      setAddMsg('');
      loadStudents();
    } catch (e: any) {
      setAddMsg(e.response?.data?.message || 'Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
          MY STUDENTS
        </h1>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold">
          + Register Student
        </Button>
      </div>

      <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm tracking-widest uppercase text-cyan-400">Students ({filtered.length})</CardTitle>
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-72 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-cyan-400 text-xs">Name</TableHead>
                <TableHead className="text-cyan-400 text-xs">Roll No</TableHead>
                <TableHead className="text-cyan-400 text-xs">Email</TableHead>
                <TableHead className="text-cyan-400 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="border-slate-800/50">
                  <TableCell className="text-slate-300">{s.name}</TableCell>
                  <TableCell className="text-slate-400">{s.rollNo || '-'}</TableCell>
                  <TableCell className="text-slate-400">{s.email || '-'}</TableCell>
                  <TableCell><Badge className={s.isActive ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 'bg-red-400/10 text-red-400 border-red-400/30'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-950 border-cyan-500/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-cyan-400 tracking-wider">Register New Student</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-slate-400 text-xs">Full Name *</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Roll Number *</Label><Input value={form.rollNo} onChange={(e) => setForm({...form, rollNo: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Login Username (defaults to roll no)</Label><Input value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} placeholder={form.rollNo || 'Auto-set to roll no'} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Login Password (defaults to roll no)</Label><Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder={form.rollNo || 'Auto-set to roll no'} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div>
              <Label className="text-slate-400 text-xs">Photo for Face Recognition</Label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full mt-1 border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30">
                {photo ? photo.name : 'Choose Photo (JPG)'}
              </Button>
            </div>
            {addMsg && <p className="text-red-400 text-sm text-center">{addMsg}</p>}
            <Button onClick={handleAdd} disabled={addLoading} className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold disabled:opacity-50">
              {addLoading ? 'Registering...' : 'Register Student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
