'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Log { id: number; status: string; timestamp: string; date: string; blinkCount: number; }

export default function StudentAttendancePage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    api.get('/api/student/my-attendance').then(res => setLogs(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">My Attendance</h1>

      <Card className="border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-sm tracking-widest uppercase text-slate-500">All Records ({logs.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-500 text-xs">#</TableHead>
                <TableHead className="text-slate-500 text-xs">Date</TableHead>
                <TableHead className="text-slate-500 text-xs">Status</TableHead>
                <TableHead className="text-slate-500 text-xs">Time</TableHead>
                <TableHead className="text-slate-500 text-xs">Blinks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, i) => (
                <TableRow key={log.id} className="border-slate-100">
                  <TableCell className="text-slate-400">{i + 1}</TableCell>
                  <TableCell className="text-slate-900">{log.date || '-'}</TableCell>
                  <TableCell><Badge className={log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}>{log.status}</Badge></TableCell>
                  <TableCell className="text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell className="text-slate-500">{log.blinkCount || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
