'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Zap, GraduationCap, Briefcase, CheckCircle, Users, MessageCircle, ShoppingBag, Hash } from 'lucide-react';
import api from '@/services/api';

const C = {
  indigo:  '#4f46e5',
  indigoDk:'#4338ca',
  indigoBg:'#eef2ff',
  indigoBdr:'#c7d2fe',
  border:  '#e2e8f0',
  text:    '#0f172a',
  muted:   '#64748b',
  subtle:  '#94a3b8',
  red:     '#ef4444',
  redBg:   '#fef2f2',
  redBdr:  '#fecaca',
  white:   '#ffffff',
  bg:      '#f8fafc',
};

function Field({ label, type, placeholder, value, onChange, autoComplete, icon: Icon, rightEl, error, autoFocus }: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
  icon: React.ElementType; rightEl?: React.ReactNode;
  error?: string; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 7 }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Icon style={{ position: 'absolute', left: 13, width: 16, height: 16, color: focused ? C.indigo : C.subtle, pointerEvents: 'none', transition: 'color 150ms', zIndex: 1 }} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', height: 46, borderRadius: 11,
            border: `1.5px solid ${error ? C.red : focused ? C.indigo : C.border}`,
            background: error ? C.redBg : focused ? C.white : '#f8fafc',
            padding: `0 ${rightEl ? '44px' : '14px'} 0 40px`,
            fontSize: 14, fontWeight: 500, color: C.text, outline: 'none',
            boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(79,70,229,0.12)'}` : 'none',
            transition: 'all 150ms', boxSizing: 'border-box',
          }}
        />
        {rightEl && <div style={{ position: 'absolute', right: 12 }}>{rightEl}</div>}
      </div>
      {error && <p style={{ fontSize: 12, color: C.red, fontWeight: 500, margin: '5px 0 0 2px' }}>{error}</p>}
    </div>
  );
}

const FEATURES = [
  { icon: Users,         label: 'AI Mentor Matching',   desc: 'Get matched with the right alumni' },
  { icon: MessageCircle, label: 'Real-time Messaging',  desc: 'Chat directly with mentors'        },
  { icon: ShoppingBag,   label: 'Project Marketplace',  desc: 'Find and post opportunities'       },
  { icon: Hash,          label: 'Community Forum',      desc: 'Discuss, learn, and grow together' },
];

export default function Register() {
  const router = useRouter();
  const [form,     setForm]     = useState({ name: '', email: '', password: '', role: 'Student' });
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [nameErr,  setNameErr]  = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwdErr,   setPwdErr]   = useState('');

  const validate = () => {
    let ok = true;
    if (!form.name.trim()) { setNameErr('Name is required.'); ok = false; } else setNameErr('');
    if (!form.email) { setEmailErr('Email is required.'); ok = false; }
    else if (!/\S+@\S+\.\S+/.test(form.email)) { setEmailErr('Enter a valid email.'); ok = false; }
    else setEmailErr('');
    if (!form.password || form.password.length < 8) { setPwdErr('Password must be at least 8 characters.'); ok = false; } else setPwdErr('');
    return ok;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: C.bg }}>

      {/* ── Left branding panel ── */}
      <div
        className="auth-left-panel"
        style={{ width: '55%', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#0f0c29 0%,#1e1b4b 30%,#312e81 65%,#4338ca 100%)' }}
      >
        <style>{`@media(max-width:900px){.auth-left-panel{display:none!important}}`}</style>

        {/* Blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Alumni Nexus</span>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 16px' }}>
            Your career network starts here.
          </h2>
          <p style={{ fontSize: 16, color: '#a5b4fc', fontWeight: 500, lineHeight: 1.65, margin: '0 0 40px', maxWidth: 400 }}>
            Join thousands of students and alumni building meaningful connections and advancing their careers.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, backdropFilter: 'blur(8px)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(129,140,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 17, height: 17, color: '#a5b4fc' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 500, margin: 0 }}>{desc}</p>
                </div>
                <CheckCircle style={{ width: 16, height: 16, color: '#6ee7b7', marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex' }}>
            {['A','B','C','D'].map((l, i) => (
              <div key={l} style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${230 + i * 15},70%,55%)`, border: '2px solid rgba(30,27,75,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, marginLeft: i === 0 ? 0 : -8 }}>
                {l}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600, margin: 0 }}>
            <span style={{ color: '#fff', fontWeight: 800 }}>2,400+</span> members already joined
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: C.bg, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <style>{`.auth-mobile-logo{display:none!important} @media(max-width:900px){.auth-mobile-logo{display:flex!important}}`}</style>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 17, height: 17, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>Alumni Nexus</span>
          </div>

          {/* Form card */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(15,23,42,0.08)', padding: '36px 36px 32px' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Create your account</h1>
              <p style={{ fontSize: 14, color: C.muted, fontWeight: 500, margin: 0 }}>Join the alumni ecosystem today — it&apos;s free</p>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 11, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: C.red, fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Role selector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 9 }}>I am a</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['Student', 'Alumni'] as const).map((role) => {
                    const Icon   = role === 'Student' ? GraduationCap : Briefcase;
                    const active = form.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm({ ...form, role })}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          padding: '14px 12px', borderRadius: 12, cursor: 'pointer', transition: 'all 150ms',
                          border: `2px solid ${active ? C.indigo : C.border}`,
                          background: active ? C.indigoBg : '#f8fafc',
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? C.indigo : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms' }}>
                          <Icon style={{ width: 17, height: 17, color: active ? '#fff' : C.subtle }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: active ? C.indigo : C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="Full Name" type="text" placeholder="Jane Doe" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" icon={User} error={nameErr} autoFocus />
              <Field label="Email Address" type="email" placeholder="jane@university.edu" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" icon={Mail} error={emailErr} />
              <Field
                label="Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                autoComplete="new-password"
                icon={Lock}
                error={pwdErr}
                rightEl={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.subtle, display: 'flex', padding: 2 }}>
                    {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                }
              />

              {/* Password strength */}
              {form.password.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: -8 }}>
                  {[1,2,3,4].map((i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: form.password.length >= i * 2 ? (form.password.length >= 8 ? '#22c55e' : '#f59e0b') : '#e2e8f0', transition: 'background 200ms' }} />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 48, borderRadius: 12, border: 'none',
                  background: loading ? '#818cf8' : `linear-gradient(135deg, ${C.indigo}, ${C.indigoDk})`,
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(79,70,229,0.35)', transition: 'all 200ms', marginTop: 4,
                }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(79,70,229,0.45)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(79,70,229,0.35)'; }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                    Creating account...
                  </>
                ) : (
                  <>Create Account <ArrowRight style={{ width: 17, height: 17 }} /></>
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, fontWeight: 500, marginTop: 20 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: C.indigo, fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
