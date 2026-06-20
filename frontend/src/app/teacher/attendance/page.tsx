'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Log { id: number; student?: { name: string; rollNo: string }; status: string; timestamp: string; date: string; }

export default function TeacherAttendancePage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, [dateFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const url = dateFilter ? `/api/teacher/attendance?date=${dateFilter}` : '/api/teacher/attendance';
      const res = await api.get(url);
      setLogs(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
        ATTENDANCE LOGS
      </h1>

      <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm tracking-widest uppercase text-cyan-400">Records ({logs.length})</CardTitle>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-slate-900/50 border-slate-700/50 text-white w-48" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-cyan-400 animate-pulse text-center py-8">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-cyan-400 text-xs">Name</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Roll No</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Status</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Date</TableHead>
                  <TableHead className="text-cyan-400 text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-800/50">
                    <TableCell className="text-slate-300">{log.student?.name || '-'}</TableCell>
                    <TableCell className="text-slate-400">{log.student?.rollNo || '-'}</TableCell>
                    <TableCell><Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/30">{log.status}</Badge></TableCell>
                    <TableCell className="text-slate-400">{log.date || '-'}</TableCell>
                    <TableCell className="text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
