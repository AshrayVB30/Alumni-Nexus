'use client';
import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import { ApplicantsList } from '@/components/marketplace/ApplicantsList';
import {
  Briefcase, Plus, Users, DollarSign, Search,
  X, ArrowUpRight, SlidersHorizontal, Bookmark,
  CheckCircle, Clock, Zap,
} from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import type { MarketplaceProject } from '@/types';

const C = {
  bg: '#f8fafc', white: '#ffffff', border: '#e2e8f0',
  text: '#0f172a', muted: '#64748b', subtle: '#94a3b8',
  indigo: '#4f46e5', indigoBg: '#eef2ff', indigoBorder: '#c7d2fe',
  green: '#16a34a', greenBg: '#f0fdf4', greenBorder: '#bbf7d0',
};

function Sk({ w = '100%', h = 14, r = 7 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function CardSkeleton() {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Sk w={44} h={44} r={13} />
          <Sk w={80} h={24} r={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <Sk w="70%" h={16} />
          <Sk h={12} />
          <Sk w="85%" h={12} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Sk w={56} h={22} r={6} />
          <Sk w={56} h={22} r={6} />
          <Sk w={56} h={22} r={6} />
        </div>
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, background: '#fafbff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Sk w={100} h={14} r={6} />
        <Sk w={88} h={34} r={10} />
      </div>
    </div>
  );
}

function ProjectModal({ project, userId, onClose, onApply }: {
  project: MarketplaceProject; userId: string;
  onClose: () => void; onApply: (id: string) => void;
}) {
  const hasApplied = project.applicants?.includes(userId);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: C.white, borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(15,23,42,0.18)', border: `1px solid ${C.border}` }}>
        <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase style={{ width: 20, height: 20, color: C.indigo }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 5px', letterSpacing: '-0.3px' }}>{project.title}</h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '2px 9px' }}>Alumni Verified</span>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: C.subtle, flexShrink: 0 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {project.stipend && (
              <div style={{ flex: 1, minWidth: 120, padding: '14px 16px', background: C.greenBg, borderRadius: 12, border: `1px solid ${C.greenBorder}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Compensation</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#15803d', margin: 0 }}>{project.stipend}</p>
              </div>
            )}
            {project.duration && (
              <div style={{ flex: 1, minWidth: 120, padding: '14px 16px', background: C.indigoBg, borderRadius: 12, border: `1px solid ${C.indigoBorder}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.indigo, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Duration</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#3730a3', margin: 0 }}>{project.duration}</p>
              </div>
            )}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>About this Project</p>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{project.description}</p>
          </div>
          {(project.skills_required ?? []).length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Required Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.skills_required.map((s) => (
                  <span key={s} style={{ fontSize: 12, fontWeight: 600, color: C.muted, background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {project.posted_by !== userId && (
            <button
              onClick={() => onApply(project._id)}
              onMouseEnter={() => setHov(true)}
              onMouseLeave={() => setHov(false)}
              disabled={hasApplied}
              style={{
                width: '100%', height: 48, borderRadius: 12, border: 'none',
                background: hasApplied ? '#f1f5f9' : hov ? '#4338ca' : C.indigo,
                color: hasApplied ? C.subtle : '#fff',
                fontSize: 14, fontWeight: 700, cursor: hasApplied ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: hasApplied ? 'none' : '0 2px 10px rgba(79,70,229,0.25)',
                transition: 'all 150ms',
              }}
            >
              {hasApplied
                ? <><CheckCircle style={{ width: 16, height: 16 }} /> Already Applied</>
                : <>Apply for this Project <ArrowUpRight style={{ width: 16, height: 16 }} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, userId, onOpen, onApply, onViewApplicants }: {
  project: MarketplaceProject; userId: string;
  onOpen: () => void; onApply: (id: string) => void; onViewApplicants: (id: string) => void;
}) {
  const [hov,      setHov]      = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [applyHov, setApplyHov] = useState(false);

  const hasApplied = project.applicants?.includes(userId);
  const isOwner    = project.posted_by === userId;

  const timeAgo = (d?: string) => {
    if (!d) return null;
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30)  return `${days} days ago`;
    const m = Math.floor(days / 30);
    return `${m} month${m > 1 ? 's' : ''} ago`;
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onOpen}
      style={{
        background: C.white, borderRadius: 16, cursor: 'pointer',
        border: `1px solid ${hov ? C.indigoBorder : C.border}`,
        boxShadow: hov ? '0 8px 24px rgba(79,70,229,0.09)' : '0 1px 4px rgba(15,23,42,0.05)',
        transition: 'all 200ms ease', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0, transition: 'all 200ms',
            background: hov ? C.indigo : C.indigoBg,
            border: `1px solid ${hov ? C.indigo : C.indigoBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Briefcase style={{ width: 18, height: 18, color: hov ? '#fff' : C.indigo, transition: 'all 200ms' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            {project.stipend && (
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <DollarSign style={{ width: 10, height: 10 }} />{project.stipend}
              </span>
            )}
            {project.duration && (
              <span style={{ fontSize: 10, fontWeight: 600, color: C.subtle, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock style={{ width: 10, height: 10 }} />{project.duration}
              </span>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: hov ? C.indigo : C.text, margin: '0 0 8px', letterSpacing: '-0.2px', lineHeight: 1.3, transition: 'color 200ms' }}>
          {project.title}
        </h3>
        <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, lineHeight: 1.6, margin: '0 0 14px', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {project.description}
        </p>

        {(project.skills_required ?? []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {project.skills_required.slice(0, 4).map((s) => (
              <span key={s} style={{ fontSize: 10, fontWeight: 600, color: C.muted, background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</span>
            ))}
            {project.skills_required.length > 4 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: C.subtle, background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px' }}>+{project.skills_required.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '12px 16px', borderTop: `1px solid ${hov ? C.indigoBorder : C.border}`, background: hov ? '#fafbff' : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, transition: 'all 200ms' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '2px 8px' }}>Verified</span>
          {timeAgo(project.created_at) && (
            <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500 }}>{timeAgo(project.created_at)}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
            title={saved ? 'Unsave' : 'Save'}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${saved ? C.indigoBorder : C.border}`, background: saved ? C.indigoBg : C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms', flexShrink: 0 }}
          >
            <Bookmark style={{ width: 13, height: 13, color: saved ? C.indigo : C.subtle, fill: saved ? C.indigo : 'none' }} />
          </button>
          {isOwner ? (
            <button
              onClick={(e) => { e.stopPropagation(); onViewApplicants(project._id); }}
              style={{ height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 150ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.indigoBorder; (e.currentTarget as HTMLElement).style.color = C.indigo; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; }}
            >
              <Users style={{ width: 12, height: 12 }} />{project.applicants?.length ?? 0} Applicants
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); if (!hasApplied) onApply(project._id); }}
              onMouseEnter={() => setApplyHov(true)}
              onMouseLeave={() => setApplyHov(false)}
              disabled={hasApplied}
              style={{
                height: 32, padding: '0 14px', borderRadius: 8, border: 'none',
                background: hasApplied ? '#f1f5f9' : applyHov ? '#4338ca' : C.indigo,
                color: hasApplied ? C.subtle : '#fff',
                fontSize: 12, fontWeight: 700, cursor: hasApplied ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 5, transition: 'all 150ms',
                boxShadow: !hasApplied && applyHov ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
              }}
            >
              {hasApplied ? <><CheckCircle style={{ width: 12, height: 12 }} /> Applied</> : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms',
        border: `1px solid ${active ? C.indigo : hov ? C.indigoBorder : C.border}`,
        background: active ? C.indigo : hov ? C.indigoBg : C.white,
        color: active ? '#fff' : hov ? C.indigo : C.muted,
      }}
    >
      {label}
    </button>
  );
}

const STACKS   = ['All', 'Python', 'React', 'Next.js', 'Node.js', 'AI/ML', 'Flutter', 'Django'];
const SORT_OPT = [
  { label: 'Latest',         value: 'latest'  },
  { label: 'Highest Paying', value: 'pay'     },
  { label: 'Most Applied',   value: 'applied' },
];

export default function Marketplace() {
  const user      = useAuthStore((s) => s.user);
  const router    = useRouter();
  const { toast } = useToast();

  const [projects,     setProjects]     = useState<MarketplaceProject[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [stack,        setStack]        = useState('All');
  const [sortBy,       setSortBy]       = useState('latest');
  const [searchFoc,    setSearchFoc]    = useState(false);
  const [selected,     setSelected]     = useState<MarketplaceProject | null>(null);
  const [applicantsId, setApplicantsId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const r = await api.get('/projects/');
      setProjects(r.data);
    } catch {
      toast('Failed to load projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleApply = async (id: string) => {
    try {
      await api.post(`/projects/${id}/apply`);
      toast('Application submitted.', 'success');
      fetchProjects();
      setSelected(null);
    } catch (err: any) {
      toast(err.response?.data?.detail || 'Application failed.', 'error');
    }
  };

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.skills_required?.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (stack !== 'All') {
      list = list.filter((p) =>
        p.skills_required?.some((s) => s.toLowerCase().includes(stack.toLowerCase()))
      );
    }
    if (sortBy === 'pay')     list.sort((a, b) => (b.stipend ?? '').localeCompare(a.stipend ?? ''));
    if (sortBy === 'applied') list.sort((a, b) => (b.applicants?.length ?? 0) - (a.applicants?.length ?? 0));
    return list;
  }, [projects, search, stack, sortBy]);

  return (
    <DashboardLayout>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: C.greenBg, border: `1px solid ${C.greenBorder}`, marginBottom: 10 }}>
              <Zap style={{ width: 11, height: 11, color: C.green }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {loading ? 'Loading...' : `${projects.length} Live Opportunities`}
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Marketplace</h1>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: 0 }}>
              Projects and opportunities posted by verified alumni.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: searchFoc ? C.indigo : C.subtle, pointerEvents: 'none', transition: 'color 150ms' }} />
              <input
                type="text"
                placeholder="Search projects, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFoc(true)}
                onBlur={() => setSearchFoc(false)}
                style={{
                  height: 40, width: 260, borderRadius: 11,
                  border: `1.5px solid ${searchFoc ? C.indigo : C.border}`,
                  background: C.white, padding: '0 36px 0 38px', fontSize: 13, fontWeight: 500, color: C.text,
                  outline: 'none', boxShadow: searchFoc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                  transition: 'all 150ms',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.subtle, display: 'flex', padding: 2 }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
            {user?.role === 'Alumni' && (
              <button
                onClick={() => router.push('/marketplace/post')}
                style={{ height: 40, padding: '0 18px', borderRadius: 11, border: 'none', background: C.indigo, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 2px 8px rgba(79,70,229,0.25)', transition: 'all 150ms', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#4338ca'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = C.indigo; }}
              >
                <Plus style={{ width: 15, height: 15 }} /> Post Project
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
              <SlidersHorizontal style={{ width: 14, height: 14, color: C.subtle }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.subtle }}>Stack:</span>
            </div>
            {STACKS.map((s) => <Pill key={s} label={s} active={stack === s} onClick={() => setStack(s)} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.subtle, whiteSpace: 'nowrap' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ height: 34, borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, padding: '0 10px', fontSize: 12, fontWeight: 600, color: C.muted, outline: 'none', cursor: 'pointer' }}
            >
              {SORT_OPT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {[1,2,3,4,5,6].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 20, border: `2px dashed ${C.border}`, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#f8fafc', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Briefcase style={{ width: 28, height: 28, color: '#cbd5e1' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              {search || stack !== 'All' ? 'No projects match your filters' : 'Marketplace is empty'}
            </h3>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: '0 0 24px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
              {search || stack !== 'All' ? 'Try adjusting your search or filters.' : 'New opportunities will appear here once alumni start posting.'}
            </p>
            {(search || stack !== 'All') && (
              <button
                onClick={() => { setSearch(''); setStack('All'); }}
                style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: C.subtle, fontWeight: 500, margin: 0 }}>
              Showing <strong style={{ color: C.text }}>{filtered.length}</strong> project{filtered.length !== 1 ? 's' : ''}
              {search && <> for &quot;<strong style={{ color: C.indigo }}>{search}</strong>&quot;</>}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {filtered.map((p) => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  userId={user?.id ?? ''}
                  onOpen={() => setSelected(p)}
                  onApply={handleApply}
                  onViewApplicants={(id) => setApplicantsId(id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selected && (
        <ProjectModal
          project={selected}
          userId={user?.id ?? ''}
          onClose={() => setSelected(null)}
          onApply={handleApply}
        />
      )}

      {applicantsId && (
        <ApplicantsList projectId={applicantsId} onClose={() => setApplicantsId(null)} />
      )}
    </DashboardLayout>
  );
}
