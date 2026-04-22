'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap, Star } from 'lucide-react';
import api from '@/services/api';

/* ─── tokens ─────────────────────────────────────────────────────────── */
const C = {
  indigo:  '#4f46e5',
  indigoDk:'#4338ca',
  indigoBg:'#eef2ff',
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

/* ─── field component ─────────────────────────────────────────────────── */
function Field({ label, type, placeholder, value, onChange, autoComplete, icon: Icon, rightEl, error, autoFocus }: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
  icon: React.ElementType; rightEl?: React.ReactNode;
  error?: string; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 7, letterSpacing: '0.01em' }}>{label}</label>
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
        {rightEl && <div style={{ position: 'absolute', right: 12, display: 'flex', alignItems: 'center' }}>{rightEl}</div>}
      </div>
      {error && <p style={{ fontSize: 12, color: C.red, fontWeight: 500, margin: '5px 0 0 2px' }}>{error}</p>}
    </div>
  );
}

/* ─── testimonials ────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Software Engineer @ Google', text: 'Found my mentor through Alumni Nexus within a week. Landed my dream job 3 months later.' },
  { name: 'Rahul M.', role: 'Product Manager @ Flipkart', text: 'The AI matching is incredibly accurate. My mentor had the exact experience I needed.' },
];

/* ─── page ────────────────────────────────────────────────────────────── */
export default function Login() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwdErr,   setPwdErr]   = useState('');
  const [tIdx,     setTIdx]     = useState(0);

  /* rotate testimonials */
  useEffect(() => {
    const t = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const validate = () => {
    let ok = true;
    if (!email) { setEmailErr('Email is required.'); ok = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr('Enter a valid email.'); ok = false; }
    else setEmailErr('');
    if (!password) { setPwdErr('Password is required.'); ok = false; }
    else setPwdErr('');
    return ok;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth({ id: res.data.user_id, role: res.data.role, email, name: res.data.name }, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const t = TESTIMONIALS[tIdx];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: C.bg }}>

      {/* ── Left branding panel ── */}
      <div
        className="auth-left-panel"
        style={{ width: '55%', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#0f0c29 0%,#1e1b4b 30%,#312e81 65%,#4338ca 100%)' }}
      >
        <style>{`@media(max-width:900px){.auth-left-panel{display:none!important}}`}</style>

        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '45%', left: '50%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,70,229,0.08)', filter: 'blur(40px)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <Zap style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Alumni Nexus</span>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 18px' }}>
              Connect with alumni who&apos;ve been where you want to go.
            </h2>
            <p style={{ fontSize: 16, color: '#a5b4fc', fontWeight: 500, lineHeight: 1.65, margin: 0, maxWidth: 420 }}>
              AI-powered mentorship, real-time collaboration, and career opportunities — all in one platform.
            </p>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
            <div style={{ display: 'flex' }}>
              {['A','B','C','D','E'].map((l, i) => (
                <div key={l} style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${230 + i * 15},70%,55%)`, border: '2.5px solid rgba(30,27,75,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i }}>
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                {[1,2,3,4,5].map((s) => <Star key={s} style={{ width: 13, height: 13, color: '#fbbf24', fill: '#fbbf24' }} />)}
              </div>
              <p style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600, margin: 0 }}>
                <span style={{ color: '#fff', fontWeight: 800 }}>2,400+</span> students and alumni connected
              </p>
            </div>
          </div>

          {/* Rotating testimonial */}
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px 24px', backdropFilter: 'blur(8px)', transition: 'all 400ms' }}>
            <p style={{ fontSize: 14, color: '#e0e7ff', fontWeight: 500, lineHeight: 1.65, margin: '0 0 14px', fontStyle: 'italic' }}>
              &ldquo;{t.text}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {t.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 500, margin: 0 }}>{t.role}</p>
              </div>
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              {TESTIMONIALS.map((_, i) => (
                <div key={i} style={{ width: i === tIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === tIdx ? '#818cf8' : 'rgba(255,255,255,0.2)', transition: 'all 300ms' }} />
              ))}
            </div>
          </div>
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
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Welcome back</h1>
              <p style={{ fontSize: 14, color: C.muted, fontWeight: 500, margin: 0 }}>Sign in to your account to continue</p>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 11, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: C.red, fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Email address" type="email" placeholder="you@university.edu" value={email} onChange={setEmail} autoComplete="email" icon={Mail} error={emailErr} autoFocus />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Password</label>
                  <Link href="#" style={{ fontSize: 12, fontWeight: 600, color: C.indigo, textDecoration: 'none' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Field
                  label=""
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="current-password"
                  icon={Lock}
                  error={pwdErr}
                  rightEl={
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.subtle, display: 'flex', padding: 2 }}>
                      {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  }
                />
              </div>

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
                    Signing in...
                  </>
                ) : (
                  <>Sign In <ArrowRight style={{ width: 17, height: 17 }} /></>
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, fontWeight: 500, marginTop: 20 }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: C.indigo, fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
