'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
  MessageCircle, ChevronLeft, GitBranch, Link2, Globe,
  GraduationCap, Briefcase, FileText, ShieldCheck,
  Bookmark, UserPlus, ExternalLink, Star, Award,
  MapPin, Calendar, TrendingUp, Code2, Layers,
  Download, Mail, AlertCircle, Send,
} from 'lucide-react';

/* ─── tokens ─────────────────────────────────────────────────────────── */
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
  indigoDk:     '#4338ca',
  green:        '#16a34a',
  greenBg:      '#f0fdf4',
  greenBorder:  '#bbf7d0',
  amber:        '#d97706',
  amberBg:      '#fffbeb',
  amberBorder:  '#fde68a',
};

/* ─── helpers ─────────────────────────────────────────────────────────── */
function avatarColor(name?: string) {
  const p = ['#4f46e5','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];
  return p[(name?.charCodeAt(0) ?? 0) % p.length];
}

/* ─── primitives ──────────────────────────────────────────────────────── */
function Sk({ w = '100%', h = 12, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(15,23,42,0.05)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, background: '#fafbff' }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 14, height: 14, color: C.indigo }} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11, color: C.subtle, fontWeight: 500, margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function ActionBtn({ label, icon: Icon, primary, onClick, style: extraStyle }: {
  label: string; icon: React.ElementType; primary?: boolean; onClick?: () => void; style?: React.CSSProperties;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', borderRadius: 11, cursor: 'pointer',
        fontSize: 13, fontWeight: 700, transition: 'all 150ms',
        border: primary ? 'none' : `1px solid ${hov ? C.indigoBorder : C.border}`,
        background: primary
          ? hov ? C.indigoDk : C.indigo
          : hov ? C.indigoBg : C.white,
        color: primary ? '#fff' : hov ? C.indigo : C.muted,
        boxShadow: primary ? '0 2px 8px rgba(79,70,229,0.25)' : 'none',
        ...extraStyle,
      }}
    >
      <Icon style={{ width: 15, height: 15 }} />
      {label}
    </button>
  );
}

/* ─── project card ────────────────────────────────────────────────────── */
function ProjectCard({ proj, featured }: { proj: any; featured?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, padding: featured ? '20px' : '16px',
        border: `1px solid ${hov ? C.indigoBorder : C.border}`,
        background: hov ? '#fafbff' : C.bg,
        boxShadow: hov ? '0 4px 16px rgba(79,70,229,0.08)' : 'none',
        transition: 'all 200ms', position: 'relative',
      }}
    >
      {featured && (
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: C.amberBg, border: `1px solid ${C.amberBorder}` }}>
          <Star style={{ width: 10, height: 10, color: C.amber, fill: C.amber }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Featured</span>
        </div>
      )}
      <h4 style={{ fontSize: featured ? 15 : 14, fontWeight: 700, color: C.text, margin: `0 0 ${featured ? 8 : 6}px`, paddingRight: featured ? 80 : 0 }}>
        {proj.title || 'Untitled Project'}
      </h4>
      {proj.description && (
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, fontWeight: 500, margin: `0 0 ${featured ? 14 : 10}px`, display: '-webkit-box', WebkitLineClamp: featured ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {proj.description}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: proj.github_link ? 12 : 0 }}>
        {(proj.tech_stack ?? []).map((t: string) => (
          <span key={t} style={{ fontSize: 10, fontWeight: 600, color: C.muted, background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t}</span>
        ))}
      </div>
      {proj.github_link && (
        <a href={proj.github_link} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.indigo, textDecoration: 'none', marginTop: 4 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
        >
          <GitBranch style={{ width: 13, height: 13 }} /> View on GitHub
          <ExternalLink style={{ width: 11, height: 11 }} />
        </a>
      )}
    </div>
  );
}

/* ─── skill tag ───────────────────────────────────────────────────────── */
function SkillTag({ label }: { label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '5px 12px', borderRadius: 20, cursor: 'default',
        fontSize: 12, fontWeight: 600, transition: 'all 150ms',
        border: `1px solid ${hov ? C.indigoBorder : C.border}`,
        background: hov ? C.indigoBg : C.bg,
        color: hov ? C.indigo : C.muted,
      }}
    >
      {label}
    </span>
  );
}

/* ─── stat chip ───────────────────────────────────────────────────────── */
function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 12px', background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`, flex: 1, minWidth: 80 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: 14, height: 14, color: C.indigo }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>{value}</p>
      <p style={{ fontSize: 10, fontWeight: 600, color: C.subtle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>{label}</p>
    </div>
  );
}

/* ─── loading skeleton ────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '28px 32px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <Sk w={80} h={80} r={22} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Sk w="40%" h={24} />
            <Sk w="60%" h={14} />
            <Sk w="30%" h={20} r={10} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Sk w={130} h={40} r={11} />
            <Sk w={110} h={40} r={11} />
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map((i) => <Sk key={i} h={14} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4].map((i) => <Sk key={i} h={14} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── page ────────────────────────────────────────────────────────────── */
export default function PublicProfile() {
  const params    = useParams();
  const router    = useRouter();
  const viewer    = useAuthStore((s) => s.user);
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    if (!params.id) return;
    api.get(`/users/${params.id}`)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>User not found</p>
          <button onClick={() => router.back()} style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const profile   = data.profile ?? {};
  const isStudent = data.role === 'Student';
  const isAlumni  = data.role === 'Alumni';
  const acad      = profile.academic_info ?? {};
  const prof      = profile.professional_info ?? {};
  const skills    = profile.skills ?? [];
  const projects  = profile.projects ?? [];
  const links     = profile.social_links ?? {};

  /* build tagline — include top skills for students */
  const taglineParts: string[] = [];
  if (isStudent) {
    if (acad.branch)       taglineParts.push(acad.branch);
    if (acad.current_year) taglineParts.push(acad.current_year);
    if (acad.college_name) taglineParts.push(acad.college_name);
  } else {
    if (prof.job_title)    taglineParts.push(prof.job_title);
    if (prof.company_name) taglineParts.push(prof.company_name);
    if (prof.industry)     taglineParts.push(prof.industry);
  }

  /* skill tagline for students — show top 3 skills inline */
  const skillTagline = isStudent && skills.length > 0
    ? skills.slice(0, 3).join(' · ')
    : null;

  const bg = avatarColor(data.name);

  return (
    <DashboardLayout>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Back */}
        <button
          onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content', transition: 'color 150ms' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.indigo; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.muted; }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} /> Back
        </button>

        {/* ── Hero header card ── */}
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 800, boxShadow: `0 4px 16px ${bg}44`, flexShrink: 0 }}>
                  {data.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.4px' }}>{data.name}</h1>
                    {/* Role badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
                      ...(isStudent
                        ? { color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}` }
                        : { color: C.amber, background: C.amberBg, border: `1px solid ${C.amberBorder}` })
                    }}>
                      {data.role}
                    </span>
                    {/* Verified */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '2px 8px' }}>
                      <ShieldCheck style={{ width: 10, height: 10 }} /> Verified
                    </span>
                  </div>
                  {taglineParts.length > 0 && (
                    <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: '0 0 4px' }}>
                      {taglineParts.join(' · ')}
                    </p>
                  )}
                  {/* Skill tagline for students */}
                  {skillTagline && (
                    <p style={{ fontSize: 13, color: C.indigo, fontWeight: 600, margin: '0 0 6px' }}>
                      {skillTagline}
                    </p>
                  )}
                  {/* Open to opportunities */}
                  {isStudent && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>Open to Opportunities</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <ActionBtn
                  label="Send Message"
                  icon={MessageCircle}
                  primary
                  onClick={() => router.push(`/chat?with=${data._id}`)}
                />
                {links.portfolio ? (
                  <ActionBtn
                    label="View Resume"
                    icon={Download}
                    onClick={() => window.open(links.portfolio, '_blank')}
                  />
                ) : (
                  <button
                    onClick={() => router.push(`/chat?with=${data._id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '9px 16px', borderRadius: 11, cursor: 'pointer',
                      fontSize: 13, fontWeight: 700, transition: 'all 150ms',
                      border: `1px dashed ${C.border}`,
                      background: C.bg, color: C.subtle,
                    }}
                    title="Request resume via message"
                  >
                    <Send style={{ width: 14, height: 14 }} /> Request Resume
                  </button>
                )}
                <button
                  onClick={() => setSaved(!saved)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 150ms',
                    border: `1px solid ${saved ? '#fde68a' : C.border}`,
                    background: saved ? '#fffbeb' : C.white,
                    color: saved ? C.amber : C.muted,
                  }}
                >
                  <Star style={{ width: 15, height: 15, fill: saved ? C.amber : 'none', color: saved ? C.amber : C.muted }} />
                  {saved ? 'Shortlisted' : 'Shortlist'}
                </button>
                {viewer?.role === 'Alumni' && (
                  <ActionBtn
                    label="Invite to Project"
                    icon={UserPlus}
                    onClick={() => router.push('/marketplace/post')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="profile-view-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
          <style>{`@media(max-width:820px){.profile-view-grid{grid-template-columns:1fr!important}}`}</style>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* About */}
            <Card>
              <SectionHeader icon={FileText} title="About" />
              <div style={{ padding: '16px 20px' }}>
                {profile.bio ? (
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{profile.bio}</p>
                ) : (
                  <p style={{ fontSize: 13, color: C.subtle, fontStyle: 'italic', margin: 0 }}>No bio added yet.</p>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <SectionHeader icon={Code2} title="Skills" subtitle={skills.length > 0 ? `${skills.length} listed` : undefined} />
              <div style={{ padding: '16px 20px' }}>
                {skills.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {skills.map((s: string) => <SkillTag key={s} label={s} />)}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '12px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#fffbeb', border: `1px solid ${C.amberBorder}` }}>
                      <AlertCircle style={{ width: 13, height: 13, color: C.amber, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>Skills not added yet</span>
                    </div>
                    <button
                      onClick={() => router.push(`/chat?with=${data._id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer', transition: 'all 150ms' }}
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.indigoBorder; el.style.color = C.indigo; el.style.background = C.indigoBg; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.border; el.style.color = C.muted; el.style.background = C.white; }}
                    >
                      <Mail style={{ width: 13, height: 13 }} /> Ask for Skills
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Resume / Portfolio — always show */}
            <Card>
              <SectionHeader icon={Download} title="Resume & Portfolio" />
              <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.linkedin && (
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#0077b5', textDecoration: 'none', padding: '8px 12px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', transition: 'all 150ms' }}
                  >
                    <Link2 style={{ width: 14, height: 14 }} /> LinkedIn Profile
                    <ExternalLink style={{ width: 11, height: 11, marginLeft: 'auto' }} />
                  </a>
                )}
                {links.github && (
                  <a href={links.github} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: C.text, textDecoration: 'none', padding: '8px 12px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, transition: 'all 150ms' }}
                  >
                    <GitBranch style={{ width: 14, height: 14 }} /> GitHub Profile
                    <ExternalLink style={{ width: 11, height: 11, marginLeft: 'auto' }} />
                  </a>
                )}
                {links.portfolio && (
                  <a href={links.portfolio} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: C.green, textDecoration: 'none', padding: '8px 12px', borderRadius: 10, background: C.greenBg, border: `1px solid ${C.greenBorder}`, transition: 'all 150ms' }}
                  >
                    <Globe style={{ width: 14, height: 14 }} /> Portfolio / Resume
                    <ExternalLink style={{ width: 11, height: 11, marginLeft: 'auto' }} />
                  </a>
                )}
                {!links.linkedin && !links.github && !links.portfolio && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#fffbeb', border: `1px solid ${C.amberBorder}` }}>
                      <AlertCircle style={{ width: 13, height: 13, color: C.amber }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>No resume uploaded</span>
                    </div>
                    <button
                      onClick={() => router.push(`/chat?with=${data._id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer', transition: 'all 150ms' }}
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.indigoBorder; el.style.color = C.indigo; el.style.background = C.indigoBg; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.border; el.style.color = C.muted; el.style.background = C.white; }}
                    >
                      <Send style={{ width: 13, height: 13 }} /> Request Resume
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Verification card */}
            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 14, border: `1px solid ${C.greenBorder}`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenBg, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award style={{ width: 16, height: 16, color: C.green }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.green, margin: '0 0 2px' }}>University Verified</p>
                <p style={{ fontSize: 11, color: '#15803d', fontWeight: 500, margin: 0 }}>Identity confirmed by Alumni Nexus</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Projects — TOP PRIORITY */}
            <Card>
              <SectionHeader
                icon={FileText}
                title="Projects"
                subtitle={projects.length > 0 ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : 'Work samples'}
              />
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {projects.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fffbeb', border: `1px solid ${C.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <AlertCircle style={{ width: 22, height: 22, color: C.amber }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 5px' }}>No projects yet</p>
                    <p style={{ fontSize: 12, color: C.muted, fontWeight: 500, margin: '0 0 16px', maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>
                      Request portfolio or work samples to evaluate this student&apos;s practical skills.
                    </p>
                    <button
                      onClick={() => router.push(`/chat?with=${data._id}`)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '9px 18px', borderRadius: 10, border: 'none',
                        background: C.indigo, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                      }}
                    >
                      <Send style={{ width: 14, height: 14 }} /> Request Work Samples
                    </button>
                  </div>
                ) : (
                  projects.map((proj: any, idx: number) => (
                    <ProjectCard key={idx} proj={proj} featured={idx === 0} />
                  ))
                )}
              </div>
            </Card>

            {/* Academic / Professional — secondary */}
            {isStudent ? (
              <Card>
                <SectionHeader icon={GraduationCap} title="Academic Snapshot" />
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { icon: MapPin,     label: 'University', value: acad.college_name },
                      { icon: Layers,     label: 'Branch',     value: acad.branch       },
                      { icon: Calendar,   label: 'Year',       value: acad.current_year },
                      { icon: TrendingUp, label: 'CGPA',       value: acad.cgpa ? String(acad.cgpa) : null },
                    ].filter(({ value }) => value).map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ padding: '12px 14px', background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <Icon style={{ width: 13, height: 13, color: C.indigo }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.3 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <SectionHeader icon={Briefcase} title="Experience (if any)" />
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { icon: Briefcase,  label: 'Role',       value: prof.job_title        },
                      { icon: MapPin,     label: 'Company',    value: prof.company_name     },
                      { icon: Layers,     label: 'Industry',   value: prof.industry         },
                      { icon: TrendingUp, label: 'Experience', value: prof.years_experience ? `${prof.years_experience} yrs` : null },
                    ].filter(({ value }) => value).map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ padding: '12px 14px', background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <Icon style={{ width: 13, height: 13, color: C.indigo }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.3 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ── Mobile sticky action bar ── */}
        <div className="mobile-action-bar" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: C.white, borderTop: `1px solid ${C.border}`, zIndex: 30, boxShadow: '0 -4px 16px rgba(15,23,42,0.08)', gap: 8 }}>
          <style>{`@media(max-width:640px){.mobile-action-bar{display:flex!important}}`}</style>
          <button
            onClick={() => router.push(`/chat?with=${data._id}`)}
            style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', background: C.indigo, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            <MessageCircle style={{ width: 16, height: 16 }} /> Message
          </button>
          {links.portfolio && (
            <button
              onClick={() => window.open(links.portfolio, '_blank')}
              style={{ height: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }}
            >
              <Download style={{ width: 15, height: 15 }} /> Resume
            </button>
          )}
          <button
            onClick={() => setSaved(!saved)}
            style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${saved ? '#fde68a' : C.border}`, background: saved ? '#fffbeb' : C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saved ? C.amber : C.muted, flexShrink: 0 }}
          >
            <Star style={{ width: 18, height: 18, fill: saved ? C.amber : 'none', color: saved ? C.amber : C.muted }} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
