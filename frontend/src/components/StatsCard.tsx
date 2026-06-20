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
  indigo: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', border: 'border-slate-200', cardBg: 'bg-white' },
  teal: { iconBg: 'bg-teal-100', iconText: 'text-teal-600', border: 'border-slate-200', cardBg: 'bg-white' },
  amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600', border: 'border-slate-200', cardBg: 'bg-white' },
  purple: { iconBg: 'bg-violet-100', iconText: 'text-violet-600', border: 'border-slate-200', cardBg: 'bg-white' },
  emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', border: 'border-slate-200', cardBg: 'bg-white' },
  rose: { iconBg: 'bg-rose-100', iconText: 'text-rose-600', border: 'border-slate-200', cardBg: 'bg-white' },
};

export default function StatsCard({ label, value, icon, href, trend, color = 'indigo' }: StatsCardProps) {
  const router = useRouter();
  const c = colorMap[color];

  return (
    <div
      onClick={() => href && router.push(href)}
      className={`${c.cardBg} rounded-xl border ${c.border} p-5 flex items-center gap-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm ${href ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className={`w-14 h-14 rounded-xl ${c.iconBg} flex items-center justify-center ${c.iconText} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}
