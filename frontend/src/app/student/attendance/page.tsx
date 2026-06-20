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
      <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
        MY ATTENDANCE
      </h1>

      <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-sm tracking-widest uppercase text-cyan-400">All Records ({logs.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-cyan-400 text-xs">#</TableHead>
                <TableHead className="text-cyan-400 text-xs">Date</TableHead>
                <TableHead className="text-cyan-400 text-xs">Status</TableHead>
                <TableHead className="text-cyan-400 text-xs">Time</TableHead>
                <TableHead className="text-cyan-400 text-xs">Blinks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, i) => (
                <TableRow key={log.id} className="border-slate-800/50">
                  <TableCell className="text-slate-500">{i + 1}</TableCell>
                  <TableCell className="text-slate-300">{log.date || '-'}</TableCell>
                  <TableCell><Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/30">{log.status}</Badge></TableCell>
                  <TableCell className="text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell className="text-slate-400">{log.blinkCount || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
