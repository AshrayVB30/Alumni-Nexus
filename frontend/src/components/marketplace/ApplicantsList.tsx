'use client';
import { useEffect, useState } from 'react';
import { X, MessageCircle, User, GraduationCap, Briefcase, ShieldCheck, Share2, ExternalLink, Search } from 'lucide-react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

const C = {
  white:        '#ffffff',
  bg:           '#f8fafc',
  border:       '#e2e8f0',
  text:         '#0f172a',
  muted:        '#64748b',
  subtle:       '#94a3b8',
  indigo:       '#4f46e5',
  indigoBg:     '#eef2ff',
  indigoBorder: '#c7d2fe',
  green:        '#16a34a',
  greenBg:      '#f0fdf4',
  greenBorder:  '#bbf7d0',
};

function avatarColor(name?: string) {
  const p = ['#4f46e5','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];
  return p[(name?.charCodeAt(0) ?? 0) % p.length];
}

function Sk({ w = '100%', h = 12, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function ApplicantSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
      <Sk w={48} h={48} r={14} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Sk w="40%" h={14} />
        <Sk w="60%" h={11} />
        <Sk w="30%" h={20} r={10} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Sk w={110} h={36} r={10} />
        <Sk w={90} h={36} r={10} />
      </div>
    </div>
  );
}

function ApplicantRow({ applicant, onMessage, onProfile }: {
  applicant: any;
  onMessage: () => void;
  onProfile: () => void;
}) {
  const [hov,     setHov]     = useState(false);
  const [msgHov,  setMsgHov]  = useState(false);
  const [profHov, setProfHov] = useState(false);

  const isAlumni  = applicant.role === 'Alumni';
  const initials  = applicant.name?.charAt(0).toUpperCase() ?? 'U';
  const bg        = avatarColor(applicant.name);
  const branch    = applicant.profile?.academic_info?.branch || applicant.branch;
  const year      = applicant.profile?.academic_info?.current_year || applicant.year;
  const company   = applicant.profile?.professional_info?.company_name;
  const jobTitle  = applicant.profile?.professional_info?.job_title;
  const skills    = applicant.profile?.skills ?? [];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 24px',
        background: hov ? '#fafbff' : C.white,
        borderBottom: `1px solid ${C.border}`,
        transition: 'background 150ms',
        cursor: 'default',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
        boxShadow: hov ? `0 4px 12px ${bg}55` : 'none', transition: 'box-shadow 200ms',
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{applicant.name ?? 'Unknown'}</span>
          {/* Verified badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 700, color: C.green,
            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
            borderRadius: 20, padding: '2px 8px',
          }}>
            <ShieldCheck style={{ width: 10, height: 10 }} /> Verified
          </span>
        </div>

        {/* Role / meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          {isAlumni ? (
            <>
              <Briefcase style={{ width: 12, height: 12, color: C.subtle, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>
                {jobTitle ?? 'Alumni'}{company && <> at <strong style={{ color: C.text }}>{company}</strong></>}
              </span>
            </>
          ) : (
            <>
              <GraduationCap style={{ width: 12, height: 12, color: C.subtle, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>
                {branch ?? 'Student'}{year && <> &middot; {year}</>}
              </span>
            </>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {skills.slice(0, 4).map((s: string) => (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, color: C.muted,
                background: '#f8fafc', border: `1px solid ${C.border}`,
                borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>{s}</span>
            ))}
            {skills.length > 4 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: C.subtle, background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 7px' }}>
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        <button
          onClick={onProfile}
          onMouseEnter={() => setProfHov(true)}
          onMouseLeave={() => setProfHov(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            border: `1px solid ${profHov ? C.indigoBorder : C.border}`,
            background: profHov ? C.indigoBg : C.white,
            color: profHov ? C.indigo : C.muted,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
          }}
        >
          <User style={{ width: 13, height: 13 }} /> Profile
        </button>
        <button
          onClick={onMessage}
          onMouseEnter={() => setMsgHov(true)}
          onMouseLeave={() => setMsgHov(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10, border: 'none',
            background: msgHov ? '#4338ca' : C.indigo,
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            boxShadow: msgHov ? '0 2px 8px rgba(79,70,229,0.3)' : '0 1px 4px rgba(79,70,229,0.2)',
            transition: 'all 150ms',
          }}
        >
          <MessageCircle style={{ width: 13, height: 13 }} /> Message
        </button>
      </div>
    </div>
  );
}

export function ApplicantsList({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const router = useRouter();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [searchFoc,  setSearchFoc]  = useState(false);

  useEffect(() => {
    api.get(`/projects/${projectId}/applicants`)
      .then((r) => setApplicants(r.data))
      .catch((e) => console.error('Applicant query error:', e))
      .finally(() => setLoading(false));
  }, [projectId]);

  /* ESC to close */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  const filtered = applicants.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.profile?.academic_info?.branch?.toLowerCase().includes(q) ||
      a.profile?.professional_info?.company_name?.toLowerCase().includes(q) ||
      a.profile?.skills?.some((s: string) => s.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }} onClick={onClose} />

        {/* Modal */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 780,
          maxHeight: '85vh',
          background: C.white, borderRadius: 20,
          border: `1px solid ${C.border}`,
          boxShadow: '0 24px 64px rgba(15,23,42,0.22)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 200ms ease',
        }}>

          {/* ── Header ── */}
          <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.white }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                  Project Applicants
                </h2>
                <p style={{ fontSize: 12, color: C.subtle, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Review verified university talent
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!loading && applicants.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.indigo, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, borderRadius: 20, padding: '4px 12px' }}>
                    {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={onClose}
                  style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.subtle, transition: 'all 150ms' }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = '#fef2f2'; el.style.borderColor = '#fecaca'; el.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = C.white; el.style.borderColor = C.border; el.style.color = C.subtle; }}
                  aria-label="Close"
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* Search */}
            {!loading && applicants.length > 0 && (
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: searchFoc ? C.indigo : C.subtle, pointerEvents: 'none', transition: 'color 150ms' }} />
                <input
                  type="text"
                  placeholder="Search by name, skill, branch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFoc(true)}
                  onBlur={() => setSearchFoc(false)}
                  style={{
                    width: '100%', height: 38, borderRadius: 10,
                    border: `1.5px solid ${searchFoc ? C.indigo : C.border}`,
                    background: searchFoc ? C.white : C.bg,
                    padding: '0 14px 0 36px', fontSize: 13, fontWeight: 500, color: C.text,
                    outline: 'none', boxShadow: searchFoc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    transition: 'all 150ms', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <>
                <ApplicantSkeleton />
                <ApplicantSkeleton />
                <ApplicantSkeleton />
              </>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <User style={{ width: 26, height: 26, color: C.indigo }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
                  {search ? 'No applicants match your search' : 'No applicants yet'}
                </h3>
                <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: '0 0 20px', maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
                  {search ? 'Try a different search term.' : 'Share your project to attract qualified candidates.'}
                </p>
                {!search && (
                  <button
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, border: 'none', background: C.indigo, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}
                    onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
                  >
                    <Share2 style={{ width: 14, height: 14 }} /> Share Project
                  </button>
                )}
              </div>
            ) : (
              filtered.map((a) => (
                <ApplicantRow
                  key={a.id ?? a._id}
                  applicant={a}
                  onMessage={() => router.push(`/chat?with=${a.id ?? a._id}`)}
                  onProfile={() => router.push(`/profile/${a.id ?? a._id}`)}
                />
              ))
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck style={{ width: 13, height: 13, color: C.green }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Identity verification active for all applicants</span>
            </div>
            {!loading && filtered.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: C.subtle }}>
                {filtered.length} of {applicants.length} shown
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
