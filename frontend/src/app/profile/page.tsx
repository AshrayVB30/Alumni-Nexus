'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import {
  Save, Link2, GitBranch, Globe, GraduationCap,
  Briefcase, BookOpen, Users, Check,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────────────── */
type SocialLinks  = { linkedin: string; github: string; portfolio: string };
type AcademicInfo = { college_name: string; branch: string; current_year: string; cgpa: string };
type ProfInfo     = { company_name: string; job_title: string; years_experience: string; industry: string };
type MentorPrefs  = { is_available: boolean; domains: string[]; availability: string };
type ProfileState = {
  bio: string; skills: string[];
  social_links: SocialLinks;
  academic_info: AcademicInfo;
  professional_info: ProfInfo;
  mentorship_prefs: MentorPrefs;
};

const blank: ProfileState = {
  bio: '',
  skills: [],
  social_links:      { linkedin: '', github: '', portfolio: '' },
  academic_info:     { college_name: '', branch: '', current_year: '', cgpa: '' },
  professional_info: { company_name: '', job_title: '', years_experience: '', industry: '' },
  mentorship_prefs:  { is_available: false, domains: [], availability: '' },
};

function sanitize(obj: any, tmpl: any): any {
  if (obj === null || obj === undefined) return tmpl;
  if (Array.isArray(tmpl)) return Array.isArray(obj) ? obj : [];
  if (typeof tmpl !== 'object') return obj ?? tmpl;
  const out: any = { ...tmpl };
  for (const k of Object.keys(tmpl)) out[k] = sanitize(obj[k], tmpl[k]);
  return out;
}

/* ─── design primitives ─────────────────────────────────────────────── */
const C = {
  bg:      '#f8fafc',
  white:   '#ffffff',
  border:  '#e2e8f0',
  borderFocus: '#4f46e5',
  text:    '#0f172a',
  muted:   '#64748b',
  subtle:  '#94a3b8',
  indigo:  '#4f46e5',
  indigoBg:'#eef2ff',
  indigoBorder:'#c7d2fe',
  success: '#16a34a',
  successBg:'#f0fdf4',
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(15,23,42,0.05)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, background: '#fafbff' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, letterSpacing: '0.01em' }}>{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        height: 40, width: '100%', borderRadius: 10, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
        background: C.white, padding: '0 12px', fontSize: 13, fontWeight: 500, color: C.text,
        outline: 'none', boxShadow: focused ? `0 0 0 3px rgba(79,70,229,0.1)` : 'none',
        transition: 'all 150ms', boxSizing: 'border-box',
      }}
    />
  );
}

function IconInput({ icon, value, onChange, placeholder }: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 11, display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 1 }}>
        {icon}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 40, width: '100%', borderRadius: 10, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
          background: C.white, padding: '0 12px 0 36px', fontSize: 13, fontWeight: 500, color: C.text,
          outline: 'none', boxShadow: focused ? `0 0 0 3px rgba(79,70,229,0.1)` : 'none',
          transition: 'all 150ms', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        height: 40, width: '100%', borderRadius: 10, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
        background: C.white, padding: '0 12px', fontSize: 13, fontWeight: 500, color: value ? C.text : C.subtle,
        outline: 'none', boxShadow: focused ? `0 0 0 3px rgba(79,70,229,0.1)` : 'none',
        transition: 'all 150ms', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none',
      }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TagsField({ tags, onChange, placeholder }: {
  tags: string[]; onChange: (t: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) { onChange([...tags, t]); setInput(''); }
  };

  return (
    <div
      style={{
        minHeight: 44, borderRadius: 10, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
        background: C.white, padding: '6px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        boxShadow: focused ? `0 0 0 3px rgba(79,70,229,0.1)` : 'none', transition: 'all 150ms', cursor: 'text',
      }}
      onClick={() => document.getElementById('tag-input-' + placeholder)?.focus()}
    >
      {tags.map((tag) => (
        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, fontSize: 12, fontWeight: 600, color: C.indigo }}>
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.indigo, padding: 0, lineHeight: 1, fontSize: 14, display: 'flex', alignItems: 'center' }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={'tag-input-' + placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        onBlur={() => { add(); setFocused(false); }}
        onFocus={() => setFocused(true)}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', fontSize: 13, fontWeight: 500, color: C.text, background: 'transparent', padding: '2px 4px' }}
      />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? C.indigo : '#e2e8f0', position: 'relative', transition: 'background 200ms', flexShrink: 0,
        boxShadow: checked ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20,
        borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        transition: 'left 200ms ease',
      }} />
    </button>
  );
}

function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

/* ─── page ───────────────────────────────────────────────────────────── */
export default function Profile() {
  const user      = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [name,    setName]    = useState('');
  const [profile, setProfile] = useState<ProfileState>(blank);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/users/${user.id}`)
      .then((r) => {
        setName(r.data.name ?? '');
        if (r.data.profile) setProfile(sanitize(r.data.profile, blank));
      })
      .catch(() => toast('Failed to load profile.', 'error'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${user?.id}/profile`, { name, profile });
      toast('Profile saved successfully.', 'success');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast('Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof ProfileState>(parent: K, field: string, value: any) =>
    setProfile((p) => ({ ...p, [parent]: { ...(p[parent] as object), [field]: value } }));

  const isStudent = user?.role === 'Student';

  return (
    <DashboardLayout>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>

        {/* ── Profile Header Card ── */}
        <Card>
          <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* Avatar */}
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 16px rgba(79,70,229,0.25)' }}>
                {loading ? '?' : (name?.charAt(0).toUpperCase() || 'U')}
              </div>
              {/* Name + meta */}
              <div>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Skeleton w={160} h={22} r={6} />
                    <Skeleton w={120} h={14} r={5} />
                  </div>
                ) : (
                  <>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 6px', letterSpacing: '-0.4px' }}>{name || 'Your Profile'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.indigo, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, borderRadius: 20, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {user?.role}
                      </span>
                      <span style={{ fontSize: 13, color: C.subtle, fontWeight: 500 }}>{user?.email}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 11,
                border: 'none', background: saved ? '#16a34a' : C.indigo, color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: saving || loading ? 'not-allowed' : 'pointer',
                opacity: saving || loading ? 0.7 : 1, boxShadow: `0 2px 10px rgba(79,70,229,0.25)`,
                transition: 'all 200ms', flexShrink: 0,
              }}
            >
              {saved ? <Check style={{ width: 15, height: 15 }} /> : <Save style={{ width: 15, height: 15 }} />}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
            </button>
          </div>
        </Card>

        {/* ── Main grid ── */}
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20, alignItems: 'start' }}>
          <style>{`@media(max-width:820px){.profile-grid{grid-template-columns:1fr!important}}`}</style>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* About */}
            <Card>
              <CardHeader icon={<Users style={{ width: 15, height: 15, color: C.indigo }} />} title="About" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Display Name">
                  {loading ? <Skeleton h={40} r={10} /> : (
                    <TextInput value={name} onChange={setName} placeholder="Your full name" />
                  )}
                </Field>
                <Field label="Bio">
                  {loading ? <Skeleton h={96} r={10} /> : (
                    <BioTextarea value={profile.bio} onChange={(v) => setProfile({ ...profile, bio: v })} />
                  )}
                </Field>
              </div>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader icon={<Link2 style={{ width: 15, height: 15, color: C.indigo }} />} title="Social Links" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {loading ? (
                  [1,2,3].map((i) => <Skeleton key={i} h={40} r={10} />)
                ) : (
                  <>
                    <Field label="LinkedIn">
                      <IconInput
                        icon={<Link2 style={{ width: 14, height: 14, color: '#0077b5' }} />}
                        value={profile.social_links.linkedin}
                        onChange={(v) => set('social_links', 'linkedin', v)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </Field>
                    <Field label="GitHub">
                      <IconInput
                        icon={<GitBranch style={{ width: 14, height: 14, color: '#333' }} />}
                        value={profile.social_links.github}
                        onChange={(v) => set('social_links', 'github', v)}
                        placeholder="https://github.com/..."
                      />
                    </Field>
                    <Field label="Portfolio">
                      <IconInput
                        icon={<Globe style={{ width: 14, height: 14, color: '#059669' }} />}
                        value={profile.social_links.portfolio}
                        onChange={(v) => set('social_links', 'portfolio', v)}
                        placeholder="https://yoursite.com"
                      />
                    </Field>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Academic / Professional */}
            {isStudent ? (
              <Card>
                <CardHeader icon={<GraduationCap style={{ width: 15, height: 15, color: C.indigo }} />} title="Academic Information" />
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
                  <style>{`@media(max-width:500px){.form-grid{grid-template-columns:1fr!important}}`}</style>
                  {loading ? (
                    [1,2,3,4].map((i) => <div key={i}><Skeleton h={14} w="60%" r={5} /><div style={{marginTop:6}}><Skeleton h={40} r={10} /></div></div>)
                  ) : (
                    <>
                      <Field label="University"><TextInput value={profile.academic_info.college_name} onChange={(v) => set('academic_info','college_name',v)} placeholder="e.g. MIT" /></Field>
                      <Field label="Branch / Major"><TextInput value={profile.academic_info.branch} onChange={(v) => set('academic_info','branch',v)} placeholder="e.g. Computer Science" /></Field>
                      <Field label="CGPA"><TextInput value={profile.academic_info.cgpa} onChange={(v) => set('academic_info','cgpa',v)} placeholder="e.g. 8.5" type="number" /></Field>
                      <Field label="Current Year">
                        <SelectInput
                          value={profile.academic_info.current_year}
                          onChange={(v) => set('academic_info','current_year',v)}
                          options={[
                            { label: 'Select year', value: '' },
                            { label: '1st Year', value: '1st Year' },
                            { label: '2nd Year', value: '2nd Year' },
                            { label: '3rd Year', value: '3rd Year' },
                            { label: '4th Year', value: '4th Year' },
                          ]}
                        />
                      </Field>
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader icon={<Briefcase style={{ width: 15, height: 15, color: C.indigo }} />} title="Professional Information" />
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
                  {loading ? (
                    [1,2,3,4].map((i) => <div key={i}><Skeleton h={14} w="60%" r={5} /><div style={{marginTop:6}}><Skeleton h={40} r={10} /></div></div>)
                  ) : (
                    <>
                      <Field label="Company"><TextInput value={profile.professional_info.company_name} onChange={(v) => set('professional_info','company_name',v)} placeholder="e.g. Google" /></Field>
                      <Field label="Job Title"><TextInput value={profile.professional_info.job_title} onChange={(v) => set('professional_info','job_title',v)} placeholder="e.g. Senior Engineer" /></Field>
                      <Field label="Industry"><TextInput value={profile.professional_info.industry} onChange={(v) => set('professional_info','industry',v)} placeholder="e.g. FinTech" /></Field>
                      <Field label="Years of Experience"><TextInput value={profile.professional_info.years_experience} onChange={(v) => set('professional_info','years_experience',v)} placeholder="e.g. 5" type="number" /></Field>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Skills */}
            <Card>
              <CardHeader icon={<BookOpen style={{ width: 15, height: 15, color: C.indigo }} />} title="Skills & Technologies" />
              <div style={{ padding: 24 }}>
                {loading ? <Skeleton h={52} r={10} /> : (
                  <>
                    <TagsField
                      tags={profile.skills}
                      onChange={(t) => setProfile({ ...profile, skills: t })}
                      placeholder="Add a skill (e.g. React, Python)..."
                    />
                    <p style={{ fontSize: 11, color: C.subtle, fontWeight: 500, margin: '8px 0 0 2px' }}>Press Enter to add a tag</p>
                  </>
                )}
              </div>
            </Card>

            {/* Mentorship Prefs — alumni only */}
            {user?.role === 'Alumni' && (
              <Card>
                <CardHeader icon={<Users style={{ width: 15, height: 15, color: C.indigo }} />} title="Mentorship Preferences" />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {loading ? (
                    <Skeleton h={60} r={12} />
                  ) : (
                    <>
                      {/* Toggle row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#fafbff', borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>Available for Mentoring</p>
                          <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: 0 }}>Allow students to connect with you</p>
                        </div>
                        <Toggle
                          checked={profile.mentorship_prefs.is_available}
                          onChange={(v) => set('mentorship_prefs', 'is_available', v)}
                        />
                      </div>

                      <Field label="Availability">
                        <TextInput
                          value={profile.mentorship_prefs.availability}
                          onChange={(v) => set('mentorship_prefs', 'availability', v)}
                          placeholder="e.g. Weekends, 2 hours/week"
                        />
                      </Field>

                      <Field label="Mentorship Domains">
                        <TagsField
                          tags={profile.mentorship_prefs.domains}
                          onChange={(t) => set('mentorship_prefs', 'domains', t)}
                          placeholder="Add domain (e.g. Web Dev, ML)..."
                        />
                        <p style={{ fontSize: 11, color: C.subtle, fontWeight: 500, margin: '8px 0 0 2px' }}>Press Enter to add a tag</p>
                      </Field>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ── Sticky save bar (mobile) ── */}
        <div className="mobile-save-bar" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px', background: '#fff', borderTop: `1px solid ${C.border}`, zIndex: 30, boxShadow: '0 -4px 16px rgba(15,23,42,0.08)' }}>
          <style>{`@media(max-width:640px){.mobile-save-bar{display:block!important}}`}</style>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', height: 44, borderRadius: 12, border: 'none', background: saved ? '#16a34a' : C.indigo, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {saved ? <Check style={{ width: 16, height: 16 }} /> : <Save style={{ width: 16, height: 16 }} />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}

/* ─── bio textarea ───────────────────────────────────────────────────── */
function BioTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Tell the community about your expertise, goals, and interests..."
      rows={4}
      style={{
        width: '100%', borderRadius: 10, border: `1.5px solid ${focused ? '#4f46e5' : '#e2e8f0'}`,
        background: '#fff', padding: '10px 12px', fontSize: 13, fontWeight: 500, color: '#0f172a',
        outline: 'none', boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
        transition: 'all 150ms', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    />
  );
}
