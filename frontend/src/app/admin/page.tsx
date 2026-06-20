'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalAttendanceRecords: number;
  todayAttendance: number;
  todayPercentage: number;
}

interface Log {
  id: number;
  student?: { name: string; rollNo: string };
  status: string;
  timestamp: string;
  date: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/api/admin/dashboard/stats'),
          api.get('/api/admin/attendance'),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data.slice(0, 8));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }));
    };
    tick();
    const i = setInterval(tick, 10000);
    return () => clearInterval(i);
  }, []);

  const absentToday = Math.max((stats?.totalStudents || 0) - (stats?.todayAttendance || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 font-mono">
            ADMIN DASHBOARD
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-mono tracking-wider">{currentTime}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-emerald-400/70 text-xs font-mono tracking-wider uppercase">System Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Students"
          value={stats?.totalStudents || 0}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>}
          href="/admin/students"
          color="cyan"
        />
        <StatsCard
          label="Total Teachers"
          value={stats?.totalTeachers || 0}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>}
          href="/admin/teachers"
          color="emerald"
        />
        <StatsCard
          label="Present Today"
          value={stats?.todayAttendance || 0}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          color="amber"
          trend={`${absentToday} absent today`}
        />
        <StatsCard
          label="Attendance Rate"
          value={`${(stats?.todayPercentage || 0).toFixed(1)}%`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-cyan-500/10 bg-slate-950/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs tracking-widest uppercase text-slate-400 font-mono">Recent Activity</CardTitle>
              <a href="/admin/attendance" className="text-cyan-400/70 text-xs font-mono hover:text-cyan-400 transition-colors">View All →</a>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <p className="font-mono text-sm">No activity today</p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={log.id} className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-slate-800/30 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center text-xs font-mono text-cyan-400">
                      {(log.student?.name || '?')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm truncate">{log.student?.name || 'Unknown'}</p>
                      <p className="text-slate-600 text-xs font-mono">{log.student?.rollNo || '-'}</p>
                    </div>
                    <Badge className={`text-[10px] font-mono px-2 py-0.5 ${log.status === 'PRESENT' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border-rose-400/20'}`}>
                      {log.status}
                    </Badge>
                    <span className="text-slate-600 text-xs font-mono flex-shrink-0">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10 bg-slate-950/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs tracking-widest uppercase text-slate-400 font-mono">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Manage Students', desc: 'Add, edit, remove students', href: '/admin/students', color: 'cyan' },
              { label: 'Manage Teachers', desc: 'Add, edit, remove teachers', href: '/admin/teachers', color: 'emerald' },
              { label: 'View Attendance', desc: 'Check attendance records', href: '/admin/attendance', color: 'amber' },
              { label: 'My Profile', desc: 'Update your profile', href: '/admin/profile', color: 'rose' },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-800/50 hover:border-slate-700/50 hover:bg-slate-800/20 transition-all group"
              >
                <div className={`w-2 h-2 rounded-full bg-${action.color}-400`} />
                <div>
                  <p className="text-slate-300 text-sm group-hover:text-white transition-colors">{action.label}</p>
                  <p className="text-slate-600 text-xs">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-slate-700 group-hover:text-slate-500 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
