'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.role === 'ADMIN') router.push('/admin');
        else if (user.role === 'TEACHER') router.push('/teacher');
        else router.push('/student');
      } catch { router.push('/login'); }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-indigo-600 text-xl animate-pulse">Loading...</div>
    </div>
  );
}
