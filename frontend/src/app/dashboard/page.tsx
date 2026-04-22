'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Sparkles, Briefcase, ArrowUpRight, Users, Hash,
  ChevronRight, TrendingUp, MessageCircle, Zap, Activity,
  ArrowUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

/* ─── tiny primitives ─────────────────────────────────────────────────── */
function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
  );
}

/* ─── stat card ───────────────────────────────────────────────────────── */
function StatCard({ label, value, change, icon: Icon, iconColor, iconBg }: {
  label: string; value: string; change: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '20px 20px 18px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 18, height: 18, color: iconColor }} />
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 7px' }}>
          <ArrowUp style={{ width: 10, height: 10 }} />{change}
        </span>
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</p>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', margin: '4px 0 0' }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── mentor card ─────────────────────────────────────────────────────── */
function MentorCard({ mentor, onConnect }: { mentor: any; onConnect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const match = Math.floor(Math.random() * 9) + 91;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 14,
        border: hovered ? '1px solid #c7d2fe' : '1px solid #f1f5f9',
        boxShadow: hovered ? '0 4px 16px rgba(79,70,229,0.08)' : '0 1px 4px rgba(15,23,42,0.04)',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'all 200ms ease',
        cursor: 'default',
      }}
    >
      {/* Avatar */}
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
        {mentor.name?.charAt(0).toUpperCase() ?? 'U'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{mentor.name}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 6, padding: '2px 7px', letterSpacing: '0.02em' }}>
            {match}% MATCH
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {mentor.profile?.professional_info?.job_title ?? 'Alumni'}{' '}
          {mentor.profile?.professional_info?.company_name && (
            <span>at <strong style={{ color: '#334155' }}>{mentor.profile.professional_info.company_name}</strong></span>
          )}
        </p>
        {(mentor.profile?.skills ?? []).length > 0 && (
          <div style={{ display: 'flex', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
            {(mentor.profile.skills as string[]).slice(0, 3).map((s) => (
              <span key={s} style={{ fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onConnect}
        style={{
          flexShrink: 0,
          padding: '7px 16px',
          borderRadius: 9,
          border: hovered ? '1px solid #4f46e5' : '1px solid #e2e8f0',
          background: hovered ? '#4f46e5' : '#fff',
          color: hovered ? '#fff' : '#334155',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 200ms ease',
        }}
      >
        Connect
      </button>
    </div>
  );
}

/* ─── quick action item ───────────────────────────────────────────────── */
function QuickItem({ label, desc, icon: Icon, onClick }: { label: string; desc: string; icon: React.ElementType; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        border: hovered ? '1px solid #c7d2fe' : '1px solid #f1f5f9',
        background: hovered ? '#fafbff' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 150ms ease',
        boxShadow: hovered ? '0 2px 8px rgba(79,70,229,0.06)' : '0 1px 3px rgba(15,23,42,0.03)',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: hovered ? '#4f46e5' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms ease' }}>
        <Icon style={{ width: 16, height: 16, color: hovered ? '#fff' : '#64748b', transition: 'all 150ms ease' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{label}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, margin: '2px 0 0' }}>{desc}</p>
      </div>
      <ChevronRight style={{ width: 15, height: 15, color: hovered ? '#4f46e5' : '#cbd5e1', flexShrink: 0, transition: 'all 150ms ease' }} />
    </button>
  );
}

/* ─── page ────────────────────────────────────────────────────────────── */
const stats = [
  { label: 'Active Mentors', value: '842',  change: '+4%',  icon: Users,       iconColor: '#4f46e5', iconBg: '#eef2ff' },
  { label: 'Open Projects',  value: '24',   change: '+12%', icon: Briefcase,   iconColor: '#059669', iconBg: '#ecfdf5' },
  { label: 'Forum Posts',    value: '1.2k', change: '+8%',  icon: Hash,        iconColor: '#d97706', iconBg: '#fffbeb' },
  { label: 'Connections',    value: '3.4k', change: '+2%',  icon: TrendingUp,  iconColor: '#7c3aed', iconBg: '#f5f3ff' },
];

const quickActions = [
  { label: 'Browse Mentors', desc: 'AI-matched recommendations', href: '/mentors',     icon: Users         },
  { label: 'Marketplace',    desc: 'Projects and opportunities',  href: '/marketplace', icon: Briefcase     },
  { label: 'Forum',          desc: 'Community discussions',       href: '/forum',       icon: Hash          },
  { label: 'Messages',       desc: 'Your conversations',          href: '/chat',        icon: MessageCircle },
];

export default function Dashboard() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mentors,        setMentors]        = useState<any[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoadingMentors(false); return; }
    api.get(`/users/${user.id}/mentors`)
      .then((r) => setMentors(r.data.slice(0, 3)))
      .catch(() => setMentors([]))
      .finally(() => setLoadingMentors(false));
  }, [user?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <DashboardLayout>
      {/* shimmer keyframe */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, margin: '0 0 4px' }}>{greeting}</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {firstName}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/profile')}
              style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', transition: 'all 150ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#334155'; }}
            >
              Edit Profile
            </button>
            <button
              onClick={() => router.push('/mentors')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, border: 'none', background: '#4f46e5', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.25)', transition: 'all 150ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#4338ca'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#4f46e5'; }}
            >
              <Sparkles style={{ width: 14, height: 14 }} /> Find Mentors
            </button>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── AI Banner ── */}
        <div style={{ borderRadius: 18, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)' }}>
          {/* blobs */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '40%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Zap style={{ width: 14, height: 14, color: '#a5b4fc' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Matching Active</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.3px', lineHeight: 1.25 }}>
              We found new mentors matching your profile
            </h2>
            <p style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
              Our algorithm analyzed your skills and found{' '}
              <strong style={{ color: '#fff' }}>{mentors.length > 0 ? mentors.length : 'several'}</strong>{' '}
              highly compatible mentors this week.
            </p>
          </div>

          <button
            onClick={() => router.push('/mentors')}
            style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 11, border: 'none', background: '#fff', fontSize: 13, fontWeight: 700, color: '#312e81', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'all 150ms', flexShrink: 0 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            View Matches <ArrowUpRight style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* ── Bottom grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24, alignItems: 'start' }} className="dashboard-bottom-grid">
          <style>{`@media(max-width:900px){.dashboard-bottom-grid{grid-template-columns:1fr!important}}`}</style>

          {/* Suggested mentors */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Sparkles style={{ width: 15, height: 15, color: '#4f46e5' }} /> Suggested Mentors
              </h2>
              <button
                onClick={() => router.push('/mentors')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                View all <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {loadingMentors ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                    <Skeleton w={44} h={44} r={12} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Skeleton w="55%" h={14} />
                      <Skeleton w="40%" h={11} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Skeleton w={50} h={18} r={5} />
                        <Skeleton w={50} h={18} r={5} />
                      </div>
                    </div>
                    <Skeleton w={72} h={32} r={9} />
                  </div>
                ))}
              </div>
            ) : mentors.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, border: '2px dashed #e2e8f0', padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Users style={{ width: 22, height: 22, color: '#cbd5e1' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#334155', margin: '0 0 6px' }}>No matches yet</p>
                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: '0 0 16px' }}>Add skills to your profile to unlock AI mentor matching.</p>
                <button
                  onClick={() => router.push('/profile')}
                  style={{ padding: '8px 20px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                >
                  Update Profile
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mentors.map((m) => (
                  <MentorCard key={m._id} mentor={m} onConnect={() => router.push(`/chat?with=${m._id}`)} />
                ))}
              </div>
            )}
          </div>

          {/* Quick access */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Activity style={{ width: 15, height: 15, color: '#94a3b8' }} /> Quick Access
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickActions.map((a) => (
                <QuickItem key={a.href} label={a.label} desc={a.desc} icon={a.icon} onClick={() => router.push(a.href)} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
