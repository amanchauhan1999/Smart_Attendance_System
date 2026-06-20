'use client';

import { useRouter } from 'next/navigation';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  trend?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  cyan: {
    bg: 'from-cyan-500/10 to-cyan-500/5',
    border: 'border-cyan-500/20',
    icon: 'bg-cyan-500/10 text-cyan-400',
    value: 'from-cyan-400 to-cyan-300',
    glow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]',
  },
  emerald: {
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/10 text-emerald-400',
    value: 'from-emerald-400 to-emerald-300',
    glow: 'hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]',
  },
  amber: {
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500/10 text-amber-400',
    value: 'from-amber-400 to-amber-300',
    glow: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]',
  },
  rose: {
    bg: 'from-rose-500/10 to-rose-500/5',
    border: 'border-rose-500/20',
    icon: 'bg-rose-500/10 text-rose-400',
    value: 'from-rose-400 to-rose-300',
    glow: 'hover:shadow-[0_0_30px_rgba(251,113,133,0.15)]',
  },
};

export default function StatsCard({ label, value, icon, href, trend, color = 'cyan' }: StatsCardProps) {
  const router = useRouter();
  const c = colorMap[color];

  return (
    <div
      onClick={() => href && router.push(href)}
      className={`relative overflow-hidden rounded-xl border ${c.border} bg-gradient-to-br ${c.bg} backdrop-blur-sm p-6 transition-all duration-300 ${c.glow} ${href ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.03] to-transparent rounded-full -translate-y-8 translate-x-8" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-mono">{label}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${c.value} bg-clip-text text-transparent font-mono mt-2`}>
            {value}
          </p>
          {trend && (
            <p className="text-emerald-400 text-xs mt-1 font-mono">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.icon}`}>
          {icon}
        </div>
      </div>

      {href && (
        <div className="absolute bottom-3 right-3">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
