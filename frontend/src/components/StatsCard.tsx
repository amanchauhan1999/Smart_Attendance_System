'use client';

import { useRouter } from 'next/navigation';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  trend?: string;
  color?: 'indigo' | 'teal' | 'amber' | 'purple' | 'emerald' | 'rose';
}

const colorMap = {
  indigo: { iconBg: 'bg-indigo-500', border: 'border-slate-700/50', cardBg: 'bg-slate-800/50' },
  teal: { iconBg: 'bg-teal-500', border: 'border-slate-700/50', cardBg: 'bg-slate-800/50' },
  amber: { iconBg: 'bg-amber-500', border: 'border-slate-700/50', cardBg: 'bg-slate-800/50' },
  purple: { iconBg: 'bg-violet-500', border: 'border-slate-700/50', cardBg: 'bg-slate-800/50' },
  emerald: { iconBg: 'bg-emerald-500', border: 'border-slate-700/50', cardBg: 'bg-slate-800/50' },
  rose: { iconBg: 'bg-rose-500', border: 'border-slate-700/50', cardBg: 'bg-slate-800/50' },
};

export default function StatsCard({ label, value, icon, href, trend, color = 'indigo' }: StatsCardProps) {
  const router = useRouter();
  const c = colorMap[color];

  return (
    <div
      onClick={() => href && router.push(href)}
      className={`${c.cardBg} rounded-xl border ${c.border} p-5 flex items-center gap-4 transition-all duration-200 hover:border-slate-600 ${href ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className={`w-14 h-14 rounded-xl ${c.iconBg} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  );
}
