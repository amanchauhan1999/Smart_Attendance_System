'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatsCard from '@/components/StatsCard';

interface Stats { studentName: string; rollNo: string; totalPresent: number; todayPresent: number; totalDaysActive: number; attendancePercentage: number; }
interface Log { id: number; status: string; timestamp: string; date: string; }

export default function StudentDashboard() {
  const [stats, setStats] = useState<Stats>({ studentName: '', rollNo: '', totalPresent: 0, todayPresent: 0, totalDaysActive: 0, attendancePercentage: 0 });
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/api/student/my-stats'),
          api.get('/api/student/my-attendance'),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data.slice(0, 5));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const isPresentToday = (stats.todayPresent || 0) > 0;
  const totalAbsent = Math.max((stats.totalDaysActive || 0) - (stats.totalPresent || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
        Dashboard
        <span className="ml-2 text-sm font-normal text-slate-500">Welcome back, {stats.studentName || 'Student'}</span>
      </h1>

      <div className={`flex items-center gap-4 p-4 rounded-xl border ${isPresentToday ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPresentToday ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          {isPresentToday ? (
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
          ) : (
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          )}
        </div>
        <div>
          <p className={`font-semibold text-sm ${isPresentToday ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isPresentToday ? 'PRESENT TODAY' : 'NOT MARKED YET'}
          </p>
          <p className="text-slate-500 text-xs">
            {isPresentToday ? 'Your attendance has been recorded for today.' : 'Scan your face at the gate device to mark attendance.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Attendance %" value={`${stats.attendancePercentage?.toFixed(1) || 0}%`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>} color="indigo" />
        <StatsCard label="Present" value={stats.totalPresent} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>} color="emerald" />
        <StatsCard label="Absent" value={totalAbsent} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>} color="rose" />
        <StatsCard label="Total Days" value={stats.totalDaysActive} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>} color="amber" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">Recent Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No attendance records yet</td></tr>
              ) : logs.map((log, i) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-400 font-medium">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-3 text-sm text-slate-900">{log.date || (log.timestamp ? new Date(log.timestamp).toLocaleDateString() : '-')}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{log.status}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
