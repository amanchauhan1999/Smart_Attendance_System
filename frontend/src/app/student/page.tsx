'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Stats {
  studentName: string; rollNo: string; totalPresent: number;
  todayPresent: number; totalDaysActive: number; attendancePercentage: number;
}

interface Log { id: number; status: string; timestamp: string; date: string; }

export default function StudentDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/api/student/my-stats'),
          api.get('/api/student/my-attendance'),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data.slice(0, 10));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const isPresentToday = (stats?.todayPresent || 0) > 0;
  const totalAbsent = Math.max((stats?.totalDaysActive || 0) - (stats?.totalPresent || 0), 0);
  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [stats?.totalPresent || 0, totalAbsent],
      backgroundColor: ['#22d3ee', '#f43f5e'],
      borderColor: ['rgba(34,211,238,0.5)', 'rgba(244,63,94,0.5)'],
      borderWidth: 1,
    }],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
          MY DASHBOARD
        </h1>
        <p className="text-slate-400 mt-1">Welcome back, {stats?.studentName || 'Student'}</p>
      </div>

      {/* Today Status Banner */}
      <Card className={`border-2 ${isPresentToday ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-amber-400/40 bg-amber-400/5'} backdrop-blur-sm`}>
        <CardContent className="p-6 flex items-center gap-5">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isPresentToday ? 'bg-emerald-400/15' : 'bg-amber-400/15'}`}>
            {isPresentToday ? '&#10003;' : '&#9203;'}
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono tracking-wider ${isPresentToday ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPresentToday ? 'PRESENT TODAY' : 'NOT MARKED YET'}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {isPresentToday
                ? 'Your attendance has been recorded for today.'
                : 'Scan your face at the gate device to mark attendance.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Attendance %" value={`${stats?.attendancePercentage || 0}%`} icon="📈" />
        <StatsCard label="Total Present" value={stats?.totalPresent || 0} icon="✅" />
        <StatsCard label="Total Days" value={stats?.totalDaysActive || 0} icon="📅" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
          <CardHeader><CardTitle className="text-sm tracking-widest uppercase text-cyan-400">My Attendance</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-64"><Doughnut data={chartData} /></div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
          <CardHeader><CardTitle className="text-sm tracking-widest uppercase text-cyan-400">Recent Records</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-cyan-400 text-xs">Date</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Status</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-800/50">
                    <TableCell className="text-slate-300">{log.date || '-'}</TableCell>
                    <TableCell><Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/30">{log.status}</Badge></TableCell>
                    <TableCell className="text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
