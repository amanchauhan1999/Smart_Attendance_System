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

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/api/admin/dashboard/stats'),
          api.get('/api/admin/attendance'),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data.slice(0, 10));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [stats?.todayAttendance || 0, Math.max((stats?.totalStudents || 0) - (stats?.todayAttendance || 0), 0)],
      backgroundColor: ['#22d3ee', '#f43f5e'],
      borderColor: ['rgba(34,211,238,0.5)', 'rgba(244,63,94,0.5)'],
      borderWidth: 1,
    }],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
          ADMIN DASHBOARD
        </h1>
        <p className="text-slate-400 mt-1 tracking-wider">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Students" value={stats?.totalStudents || 0} icon="🎓" />
        <StatsCard label="Total Teachers" value={stats?.totalTeachers || 0} icon="👨‍🏫" />
        <StatsCard label="Today Present" value={stats?.todayAttendance || 0} icon="✅" />
        <StatsCard label="Attendance Rate" value={`${(stats?.todayPercentage || 0).toFixed(1)}%`} icon="📈" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm tracking-widest uppercase text-cyan-400">Today Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-64"><Doughnut data={chartData} /></div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm tracking-widest uppercase text-cyan-400">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-cyan-400 text-xs">Name</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Roll</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Status</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-800/50">
                    <TableCell className="text-slate-300">{log.student?.name || '-'}</TableCell>
                    <TableCell className="text-slate-400">{log.student?.rollNo || '-'}</TableCell>
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
