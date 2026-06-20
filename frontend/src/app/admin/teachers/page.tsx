'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Teacher {
  id: number; username: string; fullName: string; email: string; role: string; isActive: boolean;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'TEACHER' });
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', role: 'TEACHER', password: '' });
  const [addMsg, setAddMsg] = useState('');
  const [editMsg, setEditMsg] = useState('');

  useEffect(() => { loadTeachers(); }, []);

  const loadTeachers = async () => {
    const res = await api.get('/api/admin/teachers');
    setTeachers(res.data);
  };

  const handleAdd = async () => {
    if (!form.username || !form.password || !form.fullName) {
      setAddMsg('Username, password and name are required');
      return;
    }
    try {
      await api.post('/api/admin/teachers', form);
      setShowAdd(false);
      setForm({ username: '', password: '', fullName: '', email: '', role: 'TEACHER' });
      setAddMsg('');
      loadTeachers();
    } catch (e: any) {
      setAddMsg(e.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this teacher?')) return;
    await api.delete(`/api/admin/teachers/${id}`);
    loadTeachers();
  };

  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    setEditForm({ fullName: t.fullName, email: t.email || '', role: t.role, password: '' });
  };

  const handleUpdate = async () => {
    if (!editTeacher) return;
    try {
      const updates: Record<string, any> = {
        fullName: editForm.fullName,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.password) updates.password = editForm.password;
      await api.put(`/api/admin/teachers/${editTeacher.id}`, updates);
      setEditTeacher(null);
      setEditMsg('');
      loadTeachers();
    } catch (e: any) {
      setEditMsg(e.response?.data?.message || 'Failed to update teacher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
          MANAGE TEACHERS
        </h1>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold">+ Add Teacher</Button>
      </div>

      <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-sm tracking-widest uppercase text-cyan-400">All Teachers ({teachers.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-cyan-400 text-xs">Name</TableHead>
                <TableHead className="text-cyan-400 text-xs">Username</TableHead>
                <TableHead className="text-cyan-400 text-xs">Email</TableHead>
                <TableHead className="text-cyan-400 text-xs">Role</TableHead>
                <TableHead className="text-cyan-400 text-xs">Status</TableHead>
                <TableHead className="text-cyan-400 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t.id} className="border-slate-800/50">
                  <TableCell className="text-slate-300">{t.fullName}</TableCell>
                  <TableCell className="text-slate-400">{t.username}</TableCell>
                  <TableCell className="text-slate-400">{t.email || '-'}</TableCell>
                  <TableCell className="text-cyan-400">{t.role}</TableCell>
                  <TableCell>
                    <Badge className={t.isActive ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 'bg-red-400/10 text-red-400 border-red-400/30'}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30" onClick={() => openEdit(t)}>Edit</Button>
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-400/30" onClick={() => handleDelete(t.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-950 border-cyan-500/20">
          <DialogHeader><DialogTitle className="text-cyan-400 tracking-wider">Add Teacher</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-slate-400 text-xs">Full Name *</Label><Input value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Username *</Label><Input value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Password *</Label><Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Role</Label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white">
                <option value="TEACHER">TEACHER</option>
                <option value="ADMIN">ADMIN (HOD)</option>
              </select>
            </div>
            {addMsg && <p className="text-red-400 text-sm text-center">{addMsg}</p>}
            <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold">Add Teacher</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTeacher} onOpenChange={() => { setEditTeacher(null); setEditMsg(''); }}>
        <DialogContent className="bg-slate-950 border-cyan-500/20">
          <DialogHeader><DialogTitle className="text-cyan-400 tracking-wider">Edit Teacher</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-slate-400 text-xs">Full Name</Label><Input value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Role</Label>
              <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white">
                <option value="TEACHER">TEACHER</option>
                <option value="ADMIN">ADMIN (HOD)</option>
              </select>
            </div>
            <div><Label className="text-slate-400 text-xs">New Password (leave blank to keep current)</Label><Input type="password" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            {editMsg && <p className="text-red-400 text-sm text-center">{editMsg}</p>}
            <Button onClick={handleUpdate} className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
