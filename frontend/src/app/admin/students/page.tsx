'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Student {
  id: number; name: string; rollNo: string; email: string; username?: string; isActive: boolean; createdAt: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', rollNo: '', email: '', username: '', password: '' });
  const [addPhoto, setAddPhoto] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    const res = await api.get('/api/admin/students');
    setStudents(res.data);
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this student?')) return;
    await api.delete(`/api/admin/students/${id}`);
    loadStudents();
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setEditName(s.name);
    setEditRollNo(s.rollNo || '');
    setEditEmail(s.email || '');
  };

  const handleSave = async () => {
    if (!editStudent) return;
    await api.put(`/api/admin/students/${editStudent.id}`, { name: editName, rollNo: editRollNo, email: editEmail });
    setEditStudent(null);
    loadStudents();
  };

  const handleAddStudent = async () => {
    if (!addForm.name || !addForm.rollNo || !addForm.username || !addForm.password) {
      setAddMsg('Name, roll no, username and password are required');
      return;
    }
    setAddLoading(true);
    setAddMsg('');
    try {
      const formData = new FormData();
      formData.append('rollNo', addForm.rollNo);
      formData.append('name', addForm.name);
      formData.append('email', addForm.email);
      formData.append('username', addForm.username);
      formData.append('password', addForm.password);
      if (addPhoto) formData.append('photo', addPhoto);

      await api.post('/api/admin/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowAdd(false);
      setAddForm({ name: '', rollNo: '', email: '', username: '', password: '' });
      setAddPhoto(null);
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
          MANAGE STUDENTS
        </h1>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold">
          + Add Student
        </Button>
      </div>

      <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm tracking-widest uppercase text-cyan-400">All Students ({filtered.length})</CardTitle>
            <Input
              placeholder="Search by name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-cyan-400 text-xs">Name</TableHead>
                <TableHead className="text-cyan-400 text-xs">Roll No</TableHead>
                <TableHead className="text-cyan-400 text-xs">Email</TableHead>
                <TableHead className="text-cyan-400 text-xs">Username</TableHead>
                <TableHead className="text-cyan-400 text-xs">Status</TableHead>
                <TableHead className="text-cyan-400 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="border-slate-800/50">
                  <TableCell className="text-slate-300">{s.name}</TableCell>
                  <TableCell className="text-slate-400">{s.rollNo || '-'}</TableCell>
                  <TableCell className="text-slate-400">{s.email || '-'}</TableCell>
                  <TableCell className="text-slate-400">{s.username || '-'}</TableCell>
                  <TableCell>
                    <Badge className={s.isActive ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 'bg-red-400/10 text-red-400 border-red-400/30'}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30" onClick={() => openEdit(s)}>Edit</Button>
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-400/30" onClick={() => handleDelete(s.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="bg-slate-950 border-cyan-500/20">
          <DialogHeader><DialogTitle className="text-cyan-400 tracking-wider">Edit Student</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-slate-400 text-xs">Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Roll No</Label><Input value={editRollNo} onChange={(e) => setEditRollNo(e.target.value)} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Email</Label><Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-950 border-cyan-500/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-cyan-400 tracking-wider">Add New Student</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-slate-400 text-xs">Full Name *</Label><Input value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Roll Number *</Label><Input value={addForm.rollNo} onChange={(e) => setAddForm({...addForm, rollNo: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Email</Label><Input value={addForm.email} onChange={(e) => setAddForm({...addForm, email: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Login Username *</Label><Input value={addForm.username} onChange={(e) => setAddForm({...addForm, username: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div><Label className="text-slate-400 text-xs">Login Password *</Label><Input type="password" value={addForm.password} onChange={(e) => setAddForm({...addForm, password: e.target.value})} className="bg-slate-900/50 border-slate-700/50 text-white" /></div>
            <div>
              <Label className="text-slate-400 text-xs">Photo for Face Recognition</Label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setAddPhoto(e.target.files?.[0] || null)} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full mt-1 border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30">
                {addPhoto ? addPhoto.name : 'Choose Photo (JPG)'}
              </Button>
            </div>
            {addMsg && <p className="text-red-400 text-sm text-center">{addMsg}</p>}
            <Button onClick={handleAddStudent} disabled={addLoading} className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold disabled:opacity-50">
              {addLoading ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
