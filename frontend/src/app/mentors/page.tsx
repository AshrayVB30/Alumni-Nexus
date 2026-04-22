'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import {
  MessageCircle, User, Sparkles, Target, Briefcase,
  Search, SlidersHorizontal, X, ArrowUpRight,
} from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { Mentor } from '@/types';

/* ─── design tokens ─────────────────────────────────────────────────── */
const C = {
  bg:           '#f8fafc',
  white:        '#ffffff',
  border:       '#e2e8f0',
  text:         '#0f172a',
  muted:        '#64748b',
  subtle:       '#94a3b8',
  indigo:       '#4f46e5',
  indigoBg:     '#eef2ff',
  indigoBorder: '#c7d2fe',
};

/* ─── match badge colour ─────────────────────────────────────────────── */
function matchStyle(pct: number): React.CSSProperties {
  if (pct >= 90) return { color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0' };
  if (pct >= 75) return { color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a' };
  return         { color: '#475569', background: '#f8fafc',  border: '1px solid #e2e8f0' };
}

/* ─── skeleton ───────────────────────────────────────────────────────── */
function Sk({ w = '100%', h = 14, r = 7 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function MentorSkeleton() {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Sk w={48} h={48} r={14} />
          <Sk w={72} h={22} r={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <Sk w="60%" h={16} />
          <Sk w="45%" h={12} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Sk w={52} h={20} r={10} />
          <Sk w={52} h={20} r={10} />
          <Sk w={52} h={20} r={10} />
        </div>
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, background: '#fafbff', display: 'flex', gap: 8 }}>
        <Sk h={36} r={10} />
        <Sk w={36} h={36} r={10} />
      </div>
    </div>
  );
}

/* ─── mentor card ────────────────────────────────────────────────────── */
function MentorCard({ mentor, matchPct, onMessage, onProfile }: {
  mentor: Mentor;
  matchPct: number;
  onMessage: () => void;
  onProfile: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [msgHov,  setMsgHov]  = useState(false);
  const [profHov, setProfHov] = useState(false);

  const skills = mentor.profile?.skills ?? [];
  const job    = mentor.profile?.professional_info?.job_title ?? 'Alumni';
  const co     = mentor.profile?.professional_info?.company_name;
  const exp    = mentor.profile?.professional_info?.years_experience;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${hovered ? C.indigoBorder : C.border}`,
        boxShadow: hovered
          ? '0 8px 24px rgba(79,70,229,0.10)'
          : '0 1px 4px rgba(15,23,42,0.05)',
        transition: 'all 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Card body */}
      <div style={{ padding: '20px 20px 16px', flex: 1 }}>

        {/* Top row: avatar + match badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14,
            background: hovered
              ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
              : 'linear-gradient(135deg,#6366f1,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
            boxShadow: hovered ? '0 4px 12px rgba(79,70,229,0.3)' : '0 2px 6px rgba(79,70,229,0.2)',
            transition: 'all 200ms',
          }}>
            {mentor.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '4px 10px',
            letterSpacing: '0.02em', ...matchStyle(matchPct),
          }}>
            {matchPct}% match
          </span>
        </div>

        {/* Name + role */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.2px' }}>
            {mentor.name ?? mentor.email}
          </h3>
          <p style={{ fontSize: 12, color: C.muted, fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Briefcase style={{ width: 12, height: 12, color: C.subtle, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job}{co && <> at <strong style={{ color: '#334155' }}>{co}</strong></>}
            </span>
          </p>
          {exp && (
            <p style={{ fontSize: 11, color: C.subtle, fontWeight: 500, margin: '3px 0 0' }}>
              {exp} {Number(exp) === 1 ? 'year' : 'years'} experience
            </p>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.slice(0, 4).map((s) => (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, color: C.muted,
                background: '#f8fafc', border: `1px solid ${C.border}`,
                borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {s}
              </span>
            ))}
            {skills.length > 4 && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: C.subtle,
                background: '#f8fafc', border: `1px solid ${C.border}`,
                borderRadius: 6, padding: '3px 8px',
              }}>
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${hovered ? C.indigoBorder : C.border}`,
        background: hovered ? '#fafbff' : '#fafafa',
        display: 'flex', gap: 8, transition: 'all 200ms',
      }}>
        <button
          onClick={onMessage}
          onMouseEnter={() => setMsgHov(true)}
          onMouseLeave={() => setMsgHov(false)}
          style={{
            flex: 1, height: 36, borderRadius: 10, border: 'none',
            background: msgHov ? '#4338ca' : C.indigo,
            color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 150ms', boxShadow: msgHov ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
          }}
        >
          <MessageCircle style={{ width: 13, height: 13 }} /> Message
        </button>
        <button
          onClick={onProfile}
          onMouseEnter={() => setProfHov(true)}
          onMouseLeave={() => setProfHov(false)}
          title="View profile"
          style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            border: `1px solid ${profHov ? C.indigoBorder : C.border}`,
            background: profHov ? C.indigoBg : C.white,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 150ms',
          }}
        >
          <User style={{ width: 14, height: 14, color: profHov ? C.indigo : C.subtle }} />
        </button>
      </div>
    </div>
  );
}

/* ─── filter pill ────────────────────────────────────────────────────── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        border: `1px solid ${active ? C.indigo : hov ? C.indigoBorder : C.border}`,
        background: active ? C.indigo : hov ? C.indigoBg : C.white,
        color: active ? '#fff' : hov ? C.indigo : C.muted,
        transition: 'all 150ms', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

/* ─── page ───────────────────────────────────────────────────────────── */
const INDUSTRIES = ['All', 'Tech', 'Finance', 'Healthcare', 'Design', 'Marketing', 'Education'];
const SORT_OPTIONS = [
  { label: 'Best Match', value: 'match' },
  { label: 'Most Experience', value: 'exp' },
  { label: 'Name A–Z', value: 'name' },
];

export default function Mentors() {
  const user      = useAuthStore((s) => s.user);
  const router    = useRouter();
  const { toast } = useToast();

  const [mentors,  setMentors]  = useState<Mentor[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [industry, setIndustry] = useState('All');
  const [sortBy,   setSortBy]   = useState('match');
  const [searchFocused, setSearchFocused] = useState(false);

  // stable match percentages per mentor
  const [matchMap] = useState<Map<string, number>>(() => new Map());
  const getMatch = (id: string) => {
    if (!matchMap.has(id)) matchMap.set(id, Math.floor(Math.random() * 15) + 85);
    return matchMap.get(id)!;
  };

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    api.get(`/users/${user.id}/mentors`)
      .then((r) => setMentors(r.data))
      .catch(() => toast('Failed to load mentors.', 'error'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = useMemo(() => {
    let list = [...mentors];

    // search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name?.toLowerCase().includes(q) ||
        m.profile?.professional_info?.company_name?.toLowerCase().includes(q) ||
        m.profile?.professional_info?.job_title?.toLowerCase().includes(q) ||
        m.profile?.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    // industry filter
    if (industry !== 'All') {
      list = list.filter((m) =>
        m.profile?.professional_info?.industry?.toLowerCase().includes(industry.toLowerCase()) ||
        m.profile?.professional_info?.job_title?.toLowerCase().includes(industry.toLowerCase())
      );
    }

    // sort
    if (sortBy === 'match')  list.sort((a, b) => getMatch(b._id) - getMatch(a._id));
    if (sortBy === 'exp')    list.sort((a, b) => Number(b.profile?.professional_info?.years_experience ?? 0) - Number(a.profile?.professional_info?.years_experience ?? 0));
    if (sortBy === 'name')   list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    return list;
  }, [mentors, search, industry, sortBy]);

  return (
    <DashboardLayout>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            {/* AI badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, marginBottom: 10 }}>
              <Sparkles style={{ width: 12, height: 12, color: C.indigo }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.indigo, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Matching Active</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              Mentor Discovery
            </h1>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: 0 }}>
              Personalized matches based on your skills and goals.
              {!loading && mentors.length > 0 && (
                <span style={{ color: C.indigo, fontWeight: 700 }}> {mentors.length} mentors found.</span>
              )}
            </p>
          </div>

          {/* Search + action */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: searchFocused ? C.indigo : C.subtle, pointerEvents: 'none', transition: 'color 150ms' }} />
              <input
                type="text"
                placeholder="Search by name, skill, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  height: 40, width: 280, borderRadius: 11,
                  border: `1.5px solid ${searchFocused ? C.indigo : C.border}`,
                  background: C.white, padding: '0 36px 0 38px', fontSize: 13, fontWeight: 500, color: C.text,
                  outline: 'none', boxShadow: searchFocused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                  transition: 'all 150ms',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.subtle, display: 'flex', padding: 2 }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
            <button
              onClick={() => router.push('/profile')}
              style={{ height: 40, padding: '0 16px', borderRadius: 11, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.indigoBorder; (e.currentTarget as HTMLElement).style.color = C.indigo; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; }}
            >
              Update Skills
            </button>
          </div>
        </div>

        {/* ── Filters row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Industry pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
              <SlidersHorizontal style={{ width: 14, height: 14, color: C.subtle }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.subtle }}>Filter:</span>
            </div>
            {INDUSTRIES.map((ind) => (
              <FilterPill key={ind} label={ind} active={industry === ind} onClick={() => setIndustry(ind)} />
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.subtle, whiteSpace: 'nowrap' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ height: 34, borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, padding: '0 10px', fontSize: 12, fontWeight: 600, color: C.muted, outline: 'none', cursor: 'pointer' }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {[1,2,3,4,5,6].map((i) => <MentorSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 20, border: `2px dashed ${C.border}`, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#f8fafc', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Target style={{ width: 28, height: 28, color: '#cbd5e1' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              {search || industry !== 'All' ? 'No mentors match your filters' : 'No matches yet'}
            </h3>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: '0 0 24px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
              {search || industry !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Add skills to your profile to enable AI mentor matching.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(search || industry !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setIndustry('All'); }}
                  style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer' }}
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => router.push('/profile')}
                style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: C.indigo, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Update Profile <ArrowUpRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Result count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 13, color: C.subtle, fontWeight: 500, margin: 0 }}>
                Showing <strong style={{ color: C.text }}>{filtered.length}</strong> mentor{filtered.length !== 1 ? 's' : ''}
                {search && <> for "<strong style={{ color: C.indigo }}>{search}</strong>"</>}
              </p>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {filtered.map((m) => (
                <MentorCard
                  key={m._id}
                  mentor={m}
                  matchPct={getMatch(m._id)}
                  onMessage={() => router.push(`/chat?with=${m._id}`)}
                  onProfile={() => router.push(`/profile/${m._id}`)}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
