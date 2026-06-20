'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

const teacherNav = [
  { label: 'Dashboard', href: '/teacher', icon: '📊' },
  { label: 'Students', href: '/teacher/students', icon: '🎓' },
  { label: 'Attendance', href: '/teacher/attendance', icon: '📋' },
  { label: 'Profile', href: '/teacher/profile', icon: '👤' },
];

function TeacherGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') { router.push('/login'); }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar items={teacherNav} title="TEACHER PANEL" />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TeacherGuard>{children}</TeacherGuard>
    </AuthProvider>
  );
}
