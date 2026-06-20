'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';

interface Student { id: number; name: string; rollNo: string; email: string; username?: string; isActive: boolean; }

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', rollNo: '', email: '', username: '', password: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    const res = await api.get('/api/teacher/students');
    setStudents(res.data);
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || (s.rollNo || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleAdd = async () => {
    if (!form.name || !form.rollNo) { setAddMsg('Name and roll number are required'); return; }
    setAddLoading(true); setAddMsg('');
    try {
      const formData = new FormData();
      formData.append('rollNo', form.rollNo);
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (form.username) formData.append('username', form.username);
      if (form.password) formData.append('password', form.password);
      if (photo) formData.append('photo', photo);
      await api.post('/api/teacher/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowAdd(false); setForm({ name: '', rollNo: '', email: '', username: '', password: '' }); setPhoto(null); setAddMsg(''); loadStudents();
    } catch (e: any) { setAddMsg(e.response?.data?.message || 'Failed to add student'); } finally { setAddLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
          My Students
        </h1>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">+ Register Student</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Roll No</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No students found</td></tr>
              ) : paginated.map((s, i) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-400 font-medium">{String((currentPage - 1) * perPage + i + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{s.name[0]}</div>
                      <span className="text-sm font-medium text-slate-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{s.rollNo || '-'}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{s.email || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40">Prev</button>
            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).slice(0, 5).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === p ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Register New Student</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-500">Full Name *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900" /></div>
              <div><label className="text-xs text-slate-500">Roll Number *</label><input value={form.rollNo} onChange={(e) => setForm({...form, rollNo: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900" /></div>
              <div><label className="text-xs text-slate-500">Email</label><input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900" /></div>
              <div><label className="text-xs text-slate-500">Login Username (defaults to roll no)</label><input value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} placeholder={form.rollNo || 'Auto-set to roll no'} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400" /></div>
              <div><label className="text-xs text-slate-500">Login Password (defaults to roll no)</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder={form.rollNo || 'Auto-set to roll no'} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400" /></div>
              <div>
                <label className="text-xs text-slate-500">Photo for Face Recognition</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                <button onClick={() => fileInputRef.current?.click()} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 text-left hover:border-indigo-300 transition-colors">
                  {photo ? photo.name : 'Choose Photo (JPG)'}
                </button>
              </div>
              {addMsg && <p className="text-rose-600 text-sm text-center">{addMsg}</p>}
              <button onClick={handleAdd} disabled={addLoading} className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {addLoading ? 'Registering...' : 'Register Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
