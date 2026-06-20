'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Log { id: number; student?: { name: string; rollNo: string }; status: string; timestamp: string; date: string; }

export default function AdminAttendancePage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const perPage = 10;

  useEffect(() => { loadLogs(); }, [dateFilter]);

  const loadLogs = async () => {
    const url = dateFilter ? `/api/admin/attendance?date=${dateFilter}` : '/api/admin/attendance';
    const res = await api.get(url);
    setLogs(res.data);
  };

  const filtered = logs.filter(l =>
    (l.student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.student?.rollNo || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const exportCSV = () => {
    const d = dateFilter || new Date().toISOString().split('T')[0];
    window.open(`/api/admin/attendance/export/csv?startDate=${d}&endDate=${d}`, '_blank');
  };

  const exportPDF = () => {
    const d = dateFilter || new Date().toISOString().split('T')[0];
    window.open(`/api/admin/attendance/export/pdf?startDate=${d}&endDate=${d}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
        Attendance Records
      </h1>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              <input type="text" placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500" />
            </div>
            <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">CSV</button>
            <button onClick={exportPDF} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 text-sm transition-colors">PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Roll No</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No records found</td></tr>
              ) : paginated.map((log, i) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-400 font-medium">{String((currentPage - 1) * perPage + i + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{(log.student?.name || '?')[0]}</div>
                      <span className="text-sm font-medium text-slate-900">{log.student?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{log.student?.rollNo || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{log.status}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{log.date || (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : '-')}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
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
    </div>
  );
}
