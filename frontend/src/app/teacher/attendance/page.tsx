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
      <h1 className="text-xl font-bold text-slate-900">Attendance Logs</h1>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm tracking-widest uppercase text-slate-500">Records ({logs.length})</CardTitle>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-white border-slate-200 text-slate-900 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400 animate-pulse text-center py-8">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-500 text-xs">Name</TableHead>
                  <TableHead className="text-slate-500 text-xs">Roll No</TableHead>
                  <TableHead className="text-slate-500 text-xs">Status</TableHead>
                  <TableHead className="text-slate-500 text-xs">Date</TableHead>
                  <TableHead className="text-slate-500 text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-100">
                    <TableCell className="text-slate-900">{log.student?.name || '-'}</TableCell>
                    <TableCell className="text-slate-500">{log.student?.rollNo || '-'}</TableCell>
                    <TableCell><Badge className={log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}>{log.status}</Badge></TableCell>
                    <TableCell className="text-slate-500">{log.date || '-'}</TableCell>
                    <TableCell className="text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '-'}</TableCell>
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
