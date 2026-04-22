'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const publicRoutes = ['/auth/login', '/auth/register', '/'];
const protectedRoutes = ['/dashboard', '/chat', '/forum', '/marketplace', '/mentors', '/profile'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore(state => state.isHydrated);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) return;

    const isPublicRoute = publicRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !token) {
      router.push('/auth/login');
    } else if ((pathname === '/' || pathname === '/auth/login' || pathname === '/auth/register') && token) {
      router.push('/dashboard');
    }
  }, [isHydrated, token, pathname, router]);

  // Show loading state during hydration on protected routes
  if (!isHydrated && protectedRoutes.some(route => pathname.startsWith(route))) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
