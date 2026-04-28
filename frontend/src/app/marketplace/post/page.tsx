'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import {
  ArrowLeft, Briefcase, DollarSign, Clock, Users,
  Tag, FileText, Zap, CheckCircle, MapPin,
  ChevronDown, X, Eye,
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
};

const SKILL_SUGGESTIONS = ['React', 'Next.js', 'Node.js', 'Python', 'FastAPI', 'TypeScript', 'AI/ML', 'Flutter', 'Django', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Figma', 'TailwindCSS'];
const EFFORT_OPTIONS    = ['Part-time (10–20 hrs/week)', 'Full-time (40 hrs/week)', 'Flexible', 'As needed'];
const LOCATION_OPTIONS  = ['Remote', 'On-site', 'Hybrid'];

/* ─── field wrapper ───────────────────────────────────────────────────── */
function FieldGroup({ icon: Icon, label, hint, children, required }: {
  icon: React.ElementType; label: string; hint?: string;
  children: React.ReactNode; required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon style={{ width: 13, height: 13, color: C.indigo }} />
        </div>
        <label style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
          {label}{required && <span style={{ color: C.indigo, marginLeft: 3 }}>*</span>}
        </label>
      </div>
      {hint && <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: '0 0 2px 34px' }}>{hint}</p>}
      <div style={{ marginLeft: 0 }}>{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      style={{
        width: '100%', height: 44, borderRadius: 11,
        border: `1.5px solid ${foc ? C.indigo : C.border}`,
        background: foc ? C.white : C.bg,
        padding: '0 14px', fontSize: 14, fontWeight: 500, color: C.text,
        outline: 'none', boxShadow: foc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
        transition: 'all 150ms', boxSizing: 'border-box',
      }}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        style={{
          width: '100%', height: 44, borderRadius: 11, appearance: 'none',
          border: `1.5px solid ${foc ? C.indigo : C.border}`,
          background: foc ? C.white : C.bg,
          padding: '0 36px 0 14px', fontSize: 14, fontWeight: 500,
          color: value ? C.text : C.subtle,
          outline: 'none', boxShadow: foc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
          transition: 'all 150ms', cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: C.subtle, pointerEvents: 'none' }} />
    </div>
  );
}

function TagsField({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const [foc,   setFoc]   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const add = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };

  const suggestions = SKILL_SUGGESTIONS.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          minHeight: 48, borderRadius: 11, border: `1.5px solid ${foc ? C.indigo : C.border}`,
          background: foc ? C.white : C.bg, padding: '8px 10px',
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          boxShadow: foc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none', transition: 'all 150ms',
        }}
      >
        {tags.map((tag) => (
          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, fontSize: 12, fontWeight: 600, color: C.indigo }}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.indigo, padding: 0, display: 'flex', lineHeight: 1 }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => { setFoc(true); setShowSuggestions(true); }}
          onBlur={() => { setFoc(false); setTimeout(() => setShowSuggestions(false), 150); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
          placeholder={tags.length === 0 ? 'Add skills (e.g. React, Python)...' : ''}
          style={{ flex: 1, minWidth: 140, border: 'none', outline: 'none', fontSize: 13, fontWeight: 500, color: C.text, background: 'transparent', padding: '2px 4px' }}
        />
      </div>
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, boxShadow: '0 8px 24px rgba(15,23,42,0.1)', marginTop: 4, overflow: 'hidden' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 14px 4px' }}>Suggestions</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 14px 12px' }}>
            {suggestions.slice(0, 8).map((s) => (
              <button key={s} type="button" onMouseDown={() => add(s)}
                style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${C.border}`, background: C.bg, fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer', transition: 'all 150ms' }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = C.indigoBg; el.style.borderColor = C.indigoBorder; el.style.color = C.indigo; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = C.bg; el.style.borderColor = C.border; el.style.color = C.muted; }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <p style={{ fontSize: 11, color: C.subtle, fontWeight: 500, margin: '6px 0 0 2px' }}>Press Enter to add · Click suggestions to add quickly</p>
    </div>
  );
}

/* ─── live preview card ───────────────────────────────────────────────── */
function PreviewCard({ form }: { form: any }) {
  const hasContent = form.title || form.description || form.skills_required.length > 0;

  if (!hasContent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', height: '100%', minHeight: 300 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Eye style={{ width: 22, height: 22, color: C.indigo }} />
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.muted, margin: '0 0 6px' }}>Live Preview</p>
        <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: 0, maxWidth: 200 }}>
          Start filling in the form to see how your project post will look.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Preview label */}
      <div style={{ padding: '10px 16px', background: C.indigoBg, borderBottom: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Eye style={{ width: 13, height: 13, color: C.indigo }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.indigo, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Preview</span>
      </div>

      {/* Card preview */}
      <div style={{ padding: '20px 20px 16px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase style={{ width: 18, height: 18, color: C.indigo }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            {form.stipend && (
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <DollarSign style={{ width: 10, height: 10 }} />{form.stipend}
              </span>
            )}
            {form.duration && (
              <span style={{ fontSize: 10, fontWeight: 600, color: C.subtle, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock style={{ width: 10, height: 10 }} />{form.duration}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: form.title ? C.text : C.subtle, margin: '0 0 6px', letterSpacing: '-0.2px', lineHeight: 1.3, fontStyle: form.title ? 'normal' : 'italic' }}>
          {form.title || 'Your project title will appear here...'}
        </h3>

        {/* Tagline */}
        {form.tagline && (
          <p style={{ fontSize: 12, fontWeight: 600, color: C.indigo, margin: '0 0 8px' }}>{form.tagline}</p>
        )}

        {/* Description */}
        <p style={{ fontSize: 13, color: form.description ? C.muted : C.subtle, fontWeight: 500, lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: form.description ? 'normal' : 'italic' }}>
          {form.description || 'Your project description will appear here...'}
        </p>

        {/* Skills */}
        {form.skills_required.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {form.skills_required.slice(0, 5).map((s: string) => (
              <span key={s} style={{ fontSize: 10, fontWeight: 600, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</span>
            ))}
            {form.skills_required.length > 5 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: C.subtle, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px' }}>+{form.skills_required.length - 5}</span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          {form.effort && (
            <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users style={{ width: 11, height: 11 }} />{form.effort}
            </span>
          )}
          {form.location && (
            <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin style={{ width: 11, height: 11 }} />{form.location}
            </span>
          )}
          {form.slots && (
            <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users style={{ width: 11, height: 11 }} />{form.slots} student{Number(form.slots) !== 1 ? 's' : ''} needed
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, background: '#fafbff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '2px 8px' }}>Alumni Verified</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: C.indigo, borderRadius: 8, padding: '5px 14px' }}>Apply Now</span>
      </div>
    </div>
  );
}

/* ─── section divider ─────────────────────────────────────────────────── */
function SectionDivider({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
        {number}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.2px' }}>{title}</p>
        <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── page ────────────────────────────────────────────────────────────── */
export default function PostProject() {
  const router    = useRouter();
  const { toast } = useToast();
  const user      = useAuthStore((s) => s.user);

  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({
    title:           '',
    tagline:         '',
    description:     '',
    skills_required: [] as string[],
    stipend:         '',
    duration:        '',
    effort:          '',
    location:        '',
    slots:           '',
    deadline:        '',
  });

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const descMax = 600;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Project title is required.', 'error'); return; }
    if (!form.description.trim()) { toast('Description is required.', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/projects/', {
        title:           form.title,
        tagline:         form.tagline,
        description:     form.description,
        skills_required: form.skills_required,
        stipend:         form.stipend,
        duration:        form.duration,
        effort_level:    form.effort,
        location_type:   form.location,
        students_needed: parseInt(form.slots) || 1,
        deadline:        form.deadline,
      });
      toast('Project published successfully.', 'success');
      router.push('/marketplace');
    } catch {
      toast('Failed to publish. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = () => {
    toast('Draft saved locally.', 'info');
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Back + header */}
        <div>
          <button
            onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, transition: 'color 150ms' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.indigo; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.muted; }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Marketplace
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.3)', flexShrink: 0 }}>
              <Briefcase style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 3px', letterSpacing: '-0.4px' }}>Post a Project</h1>
              <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: 0 }}>Create an opportunity for students in the Alumni Nexus network.</p>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="post-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          <style>{`@media(max-width:900px){.post-grid{grid-template-columns:1fr!important}}`}</style>

          {/* ── LEFT: Form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Section 1: Basic Info */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 24px 28px', marginBottom: 16, boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <SectionDivider number="1" title="Basic Information" subtitle="Give your project a clear, compelling identity" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <FieldGroup icon={Briefcase} label="Project Title" required hint="Be specific — good titles attract better applicants">
                  <TextInput
                    value={form.title}
                    onChange={(v) => set('title', v)}
                    placeholder="e.g. Build an AI Resume Screener for HR Platform"
                  />
                </FieldGroup>
                <FieldGroup icon={Zap} label="Short Tagline" hint="One sentence that captures the essence of the project">
                  <TextInput
                    value={form.tagline}
                    onChange={(v) => set('tagline', v)}
                    placeholder="e.g. Design a backend system that ranks resumes using NLP"
                  />
                </FieldGroup>
              </div>
            </div>

            {/* Section 2: Description */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 24px 28px', marginBottom: 16, boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <SectionDivider number="2" title="Project Details" subtitle="Help students understand what they'll be building" />
              <FieldGroup icon={FileText} label="Description" required hint="Include goals, deliverables, tech stack context, and expectations">
                <div style={{ position: 'relative' }}>
                  <DescTextarea
                    value={form.description}
                    onChange={(v) => set('description', v)}
                    max={descMax}
                  />
                </div>
              </FieldGroup>
            </div>

            {/* Section 3: Logistics */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 24px 28px', marginBottom: 16, boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <SectionDivider number="3" title="Logistics" subtitle="Set expectations around time, pay, and commitment" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="logistics-grid">
                <style>{`@media(max-width:600px){.logistics-grid{grid-template-columns:1fr!important}}`}</style>
                <FieldGroup icon={DollarSign} label="Stipend / Compensation" hint="e.g. $500, ₹10,000, or Unpaid">
                  <TextInput value={form.stipend} onChange={(v) => set('stipend', v)} placeholder="e.g. $500 / Unpaid" />
                </FieldGroup>
                <FieldGroup icon={Clock} label="Duration" hint="How long will this project run?">
                  <TextInput value={form.duration} onChange={(v) => set('duration', v)} placeholder="e.g. 4 weeks" />
                </FieldGroup>
                <FieldGroup icon={Users} label="Effort Required">
                  <SelectInput value={form.effort} onChange={(v) => set('effort', v)} options={EFFORT_OPTIONS} placeholder="Select effort level" />
                </FieldGroup>
                <FieldGroup icon={MapPin} label="Work Location">
                  <SelectInput value={form.location} onChange={(v) => set('location', v)} options={LOCATION_OPTIONS} placeholder="Select location type" />
                </FieldGroup>
                <FieldGroup icon={Users} label="Students Needed" hint="How many students can apply?">
                  <TextInput value={form.slots} onChange={(v) => set('slots', v)} placeholder="e.g. 1, 2, or 3" type="number" />
                </FieldGroup>
                <FieldGroup icon={Clock} label="Application Deadline">
                  <TextInput value={form.deadline} onChange={(v) => set('deadline', v)} placeholder="e.g. Dec 31, 2025" />
                </FieldGroup>
              </div>
            </div>

            {/* Section 4: Skills */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 24px 28px', marginBottom: 24, boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <SectionDivider number="4" title="Required Skills" subtitle="Tag the technologies and skills students should know" />
              <FieldGroup icon={Tag} label="Skills & Technologies">
                <TagsField tags={form.skills_required} onChange={(t) => set('skills_required', t)} />
              </FieldGroup>
            </div>

            {/* CTA row */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 24px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>Ready to publish?</p>
                  <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: 0 }}>You can edit this post anytime after publishing.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    style={{ padding: '10px 18px', borderRadius: 11, border: `1px solid ${C.border}`, background: C.white, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer', transition: 'all 150ms' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.text; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.muted; }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDraft}
                    style={{ padding: '10px 18px', borderRadius: 11, border: `1px solid ${C.indigoBorder}`, background: C.indigoBg, fontSize: 13, fontWeight: 600, color: C.indigo, cursor: 'pointer', transition: 'all 150ms' }}
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 24px', borderRadius: 11, border: 'none',
                      background: loading ? '#818cf8' : `linear-gradient(135deg,${C.indigo},${C.indigoDk})`,
                      color: '#fff', fontSize: 13, fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(79,70,229,0.4)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(79,70,229,0.3)'; }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                        Publishing...
                      </>
                    ) : (
                      <><CheckCircle style={{ width: 15, height: 15 }} /> Publish Project</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* ── RIGHT: Preview ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
              <PreviewCard form={form} />
            </div>
            {/* Tips */}
            <div style={{ marginTop: 14, background: C.indigoBg, borderRadius: 14, border: `1px solid ${C.indigoBorder}`, padding: '16px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.indigo, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap style={{ width: 13, height: 13 }} /> Tips for a great post
              </p>
              {[
                'Be specific about deliverables',
                'Mention the tech stack clearly',
                'Set realistic timelines',
                'Specify if it\'s paid or unpaid',
              ].map((tip) => (
                <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
                  <CheckCircle style={{ width: 12, height: 12, color: C.indigo, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}

/* ─── description textarea with counter ──────────────────────────────── */
function DescTextarea({ value, onChange, max }: { value: string; onChange: (v: string) => void; max: number }) {
  const [foc, setFoc] = useState(false);
  const pct = Math.min((value.length / max) * 100, 100);
  const overLimit = value.length > max;
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        placeholder="Describe the project in detail. Include:&#10;• What the student will build&#10;• Key deliverables and milestones&#10;• Technologies they'll use&#10;• What they'll learn from this experience"
        rows={7}
        style={{
          width: '100%', borderRadius: 11, resize: 'vertical',
          border: `1.5px solid ${overLimit ? '#ef4444' : foc ? C.indigo : C.border}`,
          background: foc ? C.white : C.bg,
          padding: '12px 14px', fontSize: 14, fontWeight: 500, color: C.text,
          outline: 'none', lineHeight: 1.65, fontFamily: 'inherit',
          boxShadow: foc ? `0 0 0 3px ${overLimit ? 'rgba(239,68,68,0.1)' : 'rgba(79,70,229,0.1)'}` : 'none',
          transition: 'all 150ms', boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#e2e8f0', marginRight: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: overLimit ? '#ef4444' : pct > 80 ? '#f59e0b' : C.indigo, transition: 'all 200ms' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: overLimit ? '#ef4444' : C.subtle, flexShrink: 0 }}>
          {value.length}/{max}
        </span>
      </div>
    </div>
  );
}
