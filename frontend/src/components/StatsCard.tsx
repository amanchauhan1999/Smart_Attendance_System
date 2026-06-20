'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function StatsCard({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <Card className="border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(0,255,163,0.1)] transition-all duration-300">
      <CardContent className="p-6 text-center">
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
          {value}
        </div>
        <div className="text-slate-400 text-xs tracking-widest uppercase mt-2">{label}</div>
      </CardContent>
    </Card>
  );
}
