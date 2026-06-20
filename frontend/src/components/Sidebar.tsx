'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export default function Sidebar({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <div className="p-6 border-b border-cyan-500/10">
        <h1 className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
          {title}
        </h1>
        {user && (
          <div className="mt-3">
            <p className="text-slate-300 text-sm font-medium">{user.fullName}</p>
            <p className="text-cyan-400/70 text-xs tracking-wider uppercase">{user.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => { router.push(item.href); setMobileOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
              pathname === item.href
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-cyan-500/10">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full border-slate-700/50 text-slate-400 hover:text-red-400 hover:border-red-400/30"
        >
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-950/90 border border-cyan-500/20 text-cyan-400"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full bg-slate-950/95 border-r border-cyan-500/20 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex min-h-screen w-64 bg-slate-950/90 border-r border-cyan-500/20 flex-col">
        {navContent}
      </div>
    </>
  );
}
