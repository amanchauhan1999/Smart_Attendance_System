'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

const studentNav = [
  { label: 'Dashboard', href: '/student', icon: '📊' },
  { label: 'My Attendance', href: '/student/attendance', icon: '📋' },
  { label: 'My Profile', href: '/student/profile', icon: '👤' },
];

function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'STUDENT') { router.push('/login'); }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar items={studentNav} title="STUDENT PORTAL" />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StudentGuard>{children}</StudentGuard>
    </AuthProvider>
  );
}
