'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Students', href: '/admin/students', icon: '🎓' },
  { label: 'Teachers', href: '/admin/teachers', icon: '👨‍🏫' },
  { label: 'Attendance', href: '/admin/attendance', icon: '📋' },
  { label: 'Profile', href: '/admin/profile', icon: '👤' },
];

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN') { router.push('/login'); }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar items={adminNav} title="ADMIN PANEL" />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
