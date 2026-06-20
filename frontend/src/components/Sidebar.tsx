'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white font-mono">{title}</h1>
            <p className="text-[10px] text-slate-600 tracking-widest font-mono">SMART ATTENDANCE</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 flex items-center justify-center text-xs font-bold text-cyan-400">
                {user.fullName?.[0] || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-slate-300 text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-cyan-400/50 text-[10px] tracking-widest uppercase font-mono">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setMobileOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 font-mono ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/10 to-emerald-500/5 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,255,163,0.05)]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${active ? 'bg-cyan-500/10' : 'bg-slate-800/50'}`}>
                {item.icon}
              </span>
              <span className="tracking-wider">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full border-slate-800/50 text-slate-500 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 font-mono text-xs tracking-wider"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
          LOGOUT
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/50 text-cyan-400 backdrop-blur-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full bg-slate-950/95 border-r border-slate-800/50 flex flex-col backdrop-blur-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {navContent}
          </div>
        </div>
      )}

      <div className="hidden lg:flex min-h-screen w-64 bg-slate-950/80 border-r border-slate-800/50 flex-col backdrop-blur-xl">
        {navContent}
      </div>
    </>
  );
}
