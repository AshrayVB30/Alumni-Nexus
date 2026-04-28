'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, MessageCircle, Hash,
  Briefcase, User as UserIcon, LogOut, Menu, X, Home, Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const SIDEBAR_W = 260;

const allNavItems = [
  { name: 'Dashboard',       icon: LayoutDashboard, href: '/dashboard'   },
  { name: 'Mentor Matching', icon: Users,           href: '/mentors'     },
  { name: 'Messages',        icon: MessageCircle,   href: '/chat'        },
  { name: 'Forum',           icon: Hash,            href: '/forum'       },
  { name: 'Marketplace',     icon: Briefcase,       href: '/marketplace' },
  { name: 'Profile',         icon: UserIcon,        href: '/profile'     },
  { name: 'Admin Analytics',  icon: LayoutDashboard, href: '/admin',       adminOnly: true },
  { name: 'User Management', icon: Users,           href: '/admin/users', adminOnly: true },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const user     = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);
  const router   = useRouter();
  const pathname = usePathname();

  const initial = user?.name?.charAt(0).toUpperCase()
               ?? user?.email?.charAt(0).toUpperCase()
               ?? 'U';

  return (
    <div
      className="flex flex-col bg-white"
      style={{ width: SIDEBAR_W, height: '100%', borderRight: '1px solid #f1f5f9' }}
    >
      {/* Logo */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
        <Link href="/dashboard" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Home style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>Alumni Nexus</span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: 8 }}>
          Navigation
        </p>
        {allNavItems.filter(item => {
          const isAdmin = user?.role?.toLowerCase() === 'admin';
          if (isAdmin) {
            return ['Profile', 'Admin Analytics', 'User Management'].includes(item.name);
          }
          return !item.adminOnly;
        }).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 10,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active ? '#4f46e5' : '#64748b',
                background: active ? '#eef2ff' : 'transparent',
                borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                  (e.currentTarget as HTMLElement).style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#64748b';
                }
              }}
            >
              <item.icon style={{ width: 16, height: 16, flexShrink: 0, color: active ? '#4f46e5' : '#94a3b8' }} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: 12, borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
        <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => { useAuthStore.getState().logout(); router.push('/auth/login'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer', transition: 'all 150ms' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#64748b'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            <LogOut style={{ width: 13, height: 13 }} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const current  = allNavItems.find((i) => pathname === i.href || pathname.startsWith(i.href + '/'));

  return (
    <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenuClick} className="lg:hidden" style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
          <Menu style={{ width: 20, height: 20 }} />
        </button>
        <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>Alumni Nexus</span>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{current?.name ?? 'Page'}</span>
        </div>
        <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home style={{ width: 14, height: 14, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{current?.name ?? 'Alumni Nexus'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ position: 'relative', padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
          <Bell style={{ width: 18, height: 18 }} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: '#4f46e5', borderRadius: '50%', border: '1.5px solid #fff' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, borderLeft: '1px solid #f1f5f9' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <span className="hidden sm:block" style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name ?? 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop,   setIsDesktop]   = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>

      {/* Desktop sidebar */}
      {isDesktop && (
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, zIndex: 40 }}>
          <SidebarContent />
        </div>
      )}

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, zIndex: 1, boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: isDesktop ? SIDEBAR_W : 0 }}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '28px 28px', overflowX: 'hidden' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
