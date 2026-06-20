'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Log {
  id: number; student?: { name: string; rollNo: string }; status: string; timestamp: string; date: string;
}

export default function AdminAttendancePage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { loadLogs(); }, [dateFilter]);

  const loadLogs = async () => {
    const url = dateFilter ? `/api/admin/attendance?date=${dateFilter}` : '/api/admin/attendance';
    const res = await api.get(url);
    setLogs(res.data);
  };

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
      <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
        ATTENDANCE RECORDS
      </h1>

      <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-sm tracking-widest uppercase text-cyan-400">Records ({logs.length})</CardTitle>
            <div className="flex items-center gap-3">
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-slate-900/50 border-slate-700/50 text-white w-48" />
              <Button onClick={exportCSV} className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs">CSV</Button>
              <Button onClick={exportPDF} variant="outline" className="border-cyan-400/30 text-cyan-400 text-xs">PDF</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
