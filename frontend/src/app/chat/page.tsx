'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import {
  Send, MessageSquare, MoreVertical, Paperclip,
  Search, Phone, Video, ShieldCheck, Edit,
  ChevronLeft, CheckCheck, Smile,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import type { Message, Conversation } from '@/types';

const C = {
  white: '#ffffff', bg: '#f8fafc', border: '#e2e8f0',
  text: '#0f172a', muted: '#64748b', subtle: '#94a3b8',
  indigo: '#4f46e5', indigoBg: '#eef2ff', indigoBorder: '#c7d2fe',
  online: '#22c55e',
};

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(ts: string) {
  const days = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Avatar({ name, size = 40, online = false }: { name?: string; size?: number; online?: boolean }) {
  const palette = ['#4f46e5','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];
  const bg = palette[(name?.charCodeAt(0) ?? 0) % palette.length];
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38 }}>
        {name?.charAt(0).toUpperCase() ?? 'U'}
      </div>
      {online && <span style={{ position: 'absolute', bottom: -1, right: -1, width: size * 0.3, height: size * 0.3, borderRadius: '50%', background: C.online, border: `2px solid ${C.white}` }} />}
    </div>
  );
}

function Sk({ w = '100%', h = 12, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

function MsgSkeleton({ mine }: { mine: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
      {!mine && <Sk w={32} h={32} r={9} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: mine ? 'flex-end' : 'flex-start' }}>
        <Sk w={mine ? 180 : 220} h={38} r={16} />
        <Sk w={40} h={10} r={5} />
      </div>
    </div>
  );
}

function ConvItem({ conv, active, onClick }: { conv: Conversation; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? C.indigoBg : hov ? '#f8fafc' : C.white,
        borderLeft: `3px solid ${active ? C.indigo : 'transparent'}`,
        transition: 'all 150ms',
      }}
    >
      <Avatar name={conv.name} size={42} online />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 600, color: active ? C.indigo : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
            {conv.name ?? 'User'}
          </span>
          {conv.timestamp && (
            <span style={{ fontSize: 10, fontWeight: 500, color: active ? C.indigo : C.subtle, flexShrink: 0, marginLeft: 6 }}>
              {fmtTime(conv.timestamp)}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {conv.last_message ?? 'Start a conversation'}
        </p>
      </div>
    </button>
  );
}

function Bubble({ msg, isMine, showAvatar, senderName }: { msg: Message; isMine: boolean; showAvatar: boolean; senderName?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isMine ? 'row-reverse' : 'row' }}>
        <div style={{ width: 32, flexShrink: 0 }}>
          {!isMine && showAvatar && <Avatar name={senderName} size={32} />}
        </div>
        <div style={{
          maxWidth: '68%', padding: '10px 14px',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isMine ? C.indigo : '#f1f5f9',
          color: isMine ? '#fff' : C.text,
          boxShadow: isMine ? '0 2px 8px rgba(79,70,229,0.2)' : '0 1px 3px rgba(15,23,42,0.06)',
        }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, margin: 0, lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.message}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 4, marginTop: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: isMine ? 'rgba(255,255,255,0.6)' : C.subtle }}>{fmtTime(msg.timestamp)}</span>
            {isMine && <CheckCheck style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)' }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px' }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: C.subtle, background: C.bg, padding: '2px 10px', borderRadius: 20, border: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, title }: { icon: React.ElementType; onClick?: () => void; title?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: hov ? '#f1f5f9' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hov ? C.muted : C.subtle, transition: 'all 150ms' }}
    >
      <Icon style={{ width: 16, height: 16 }} />
    </button>
  );
}

function ChatContent() {
  const user      = useAuthStore((s) => s.user);
  const token     = useAuthStore((s) => s.token);
  const params    = useSearchParams();
  const withId    = params.get('with');
  const { toast } = useToast();

  const [convs,       setConvs]       = useState<Conversation[]>([]);
  const [active,      setActive]      = useState<Conversation | null>(null);
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchQ,     setSearchQ]     = useState('');
  const [searchFoc,   setSearchFoc]   = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDesktop,   setIsDesktop]   = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const activeRef = useRef<Conversation | null>(null);
  const endRef    = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!active?.id || !token) { setMessages([]); return; }
    setLoadingMsgs(true);
    api.get(`/chat/history/${active.id}?token=${token}`)
      .then((r) => setMessages(r.data))
      .catch(() => toast('Failed to load messages.', 'error'))
      .finally(() => setLoadingMsgs(false));
  }, [active?.id, token]);

  const fetchConvs = async () => {
    if (!token) return;
    try {
      const r = await api.get(`/chat/conversations?token=${token}`);
      setConvs(r.data);
    } catch { /* silent */ }
  };

  useEffect(() => { if (token) fetchConvs(); }, [token]);

  useEffect(() => {
    if (!withId || !token) return;
    api.get(`/users/${withId}`)
      .then((r) => {
        const cp: Conversation = { id: r.data._id, name: r.data.name ?? r.data.email, email: r.data.email };
        setActive(cp);
        setConvs((prev) => prev.find((c) => c.id === cp.id) ? prev : [cp, ...prev]);
        if (window.innerWidth < 768) setShowSidebar(false);
      })
      .catch(() => toast('User not found.', 'error'));
  }, [withId, token]);

  useEffect(() => {
    if (!token || socketRef.current) return;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws    = new WebSocket(`${proto}//${window.location.hostname}:8000/api/chat/ws/${token}`);
    socketRef.current = ws;
    ws.onmessage = (e) => {
      try {
        const msg: Message = JSON.parse(e.data);
        const cur = activeRef.current;
        if (
          (msg.sender_id === cur?.id && msg.receiver_id === user?.id) ||
          (msg.sender_id === user?.id && msg.receiver_id === cur?.id)
        ) {
          setMessages((p) => [...p, msg]);
        }
        fetchConvs();
      } catch { /* ignore */ }
    };
    ws.onclose = () => { socketRef.current = null; };
    return () => { ws.close(); };
  }, [token, user?.id]);

  const sendMessage = () => {
    if (!input.trim() || !active || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({ receiver_id: active.id, message: input.trim() }));
    setInput('');
    inputRef.current?.focus();
  };

  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach((m) => {
    const d    = fmtDate(m.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else grouped.push({ date: d, msgs: [m] });
  });

  const filteredConvs = convs.filter((c) =>
    !searchQ || c.name?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const showList = isDesktop || showSidebar;
  const showChat = isDesktop || !showSidebar;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes bounce  { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
      `}</style>

      <div style={{ height: 'calc(100vh - 120px)', minHeight: 500, display: 'flex', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', background: C.white }}>

        {/* ── Sidebar ── */}
        {showList && (
          <div style={{ width: isDesktop ? 300 : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: isDesktop ? `1px solid ${C.border}` : 'none', background: C.white }}>
            <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>Messages</h2>
                <button
                  style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, transition: 'all 150ms' }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = C.indigoBg; el.style.borderColor = C.indigoBorder; el.style.color = C.indigo; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = C.white; el.style.borderColor = C.border; el.style.color = C.muted; }}
                >
                  <Edit style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: searchFoc ? C.indigo : C.subtle, pointerEvents: 'none', transition: 'color 150ms' }} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onFocus={() => setSearchFoc(true)}
                  onBlur={() => setSearchFoc(false)}
                  style={{ width: '100%', height: 36, borderRadius: 10, border: `1.5px solid ${searchFoc ? C.indigo : C.border}`, background: searchFoc ? C.white : '#f8fafc', padding: '0 12px 0 32px', fontSize: 13, fontWeight: 500, color: C.text, outline: 'none', boxShadow: searchFoc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none', transition: 'all 150ms', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConvs.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f8fafc', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <MessageSquare style={{ width: 22, height: 22, color: '#cbd5e1' }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: '0 0 4px' }}>No conversations yet</p>
                  <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: 0 }}>Connect with a mentor to start chatting</p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    active={active?.id === conv.id}
                    onClick={() => { setActive(conv); if (!isDesktop) setShowSidebar(false); }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Chat window ── */}
        {showChat && (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: C.bg }}>
            {active ? (
              <>
                {/* Header */}
                <div style={{ height: 64, padding: '0 20px', background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {!isDesktop && (
                      <button onClick={() => setShowSidebar(true)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted, display: 'flex', marginRight: 4 }}>
                        <ChevronLeft style={{ width: 20, height: 20 }} />
                      </button>
                    )}
                    <Avatar name={active.name} size={38} online />
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 2px', letterSpacing: '-0.1px' }}>{active.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.online, display: 'inline-block' }} />
                        <span style={{ fontSize: 11, fontWeight: 500, color: C.muted }}>Active now</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isDesktop && (
                      <>
                        <IconBtn icon={Phone} title="Voice call" />
                        <IconBtn icon={Video} title="Video call" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, margin: '0 6px' }}>
                          <ShieldCheck style={{ width: 12, height: 12, color: '#16a34a' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Encrypted</span>
                        </div>
                      </>
                    )}
                    <IconBtn icon={MoreVertical} />
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column' }}>
                  {loadingMsgs ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                      <MsgSkeleton mine={false} />
                      <MsgSkeleton mine={true} />
                      <MsgSkeleton mine={false} />
                      <MsgSkeleton mine={true} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 20, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <MessageSquare style={{ width: 26, height: 26, color: C.indigo }} />
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>Start the conversation</h3>
                      <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: 0, maxWidth: 220 }}>
                        Send a message to {active.name} to begin your mentorship journey.
                      </p>
                    </div>
                  ) : (
                    grouped.map((group) => (
                      <div key={group.date}>
                        <DateDivider label={group.date} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {group.msgs.map((msg, idx) => {
                            const isMine     = msg.sender_id === user?.id;
                            const nextMsg    = group.msgs[idx + 1];
                            const showAvatar = !isMine && (!nextMsg || nextMsg.sender_id !== msg.sender_id);
                            return <Bubble key={idx} msg={msg} isMine={isMine} showAvatar={showAvatar} senderName={active.name} />;
                          })}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={endRef} style={{ height: 4 }} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 16px 14px', background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: '#f8fafc', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '8px 8px 8px 14px', transition: 'all 150ms' }}>
                    <button style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: C.subtle, display: 'flex', flexShrink: 0, marginBottom: 2 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.muted; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.subtle; }}
                    >
                      <Paperclip style={{ width: 17, height: 17 }} />
                    </button>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder={`Message ${active.name}...`}
                      rows={1}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, color: C.text, resize: 'none', maxHeight: 120, lineHeight: 1.5, padding: '4px 0', fontFamily: 'inherit' }}
                    />
                    <button style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: C.subtle, display: 'flex', flexShrink: 0, marginBottom: 2 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.muted; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.subtle; }}
                    >
                      <Smile style={{ width: 17, height: 17 }} />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      style={{ width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0, background: input.trim() ? C.indigo : '#e2e8f0', color: input.trim() ? '#fff' : C.subtle, cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: input.trim() ? '0 2px 8px rgba(79,70,229,0.25)' : 'none', transition: 'all 200ms' }}
                    >
                      <Send style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                  <p style={{ fontSize: 10, color: C.subtle, fontWeight: 500, margin: '6px 0 0 4px' }}>Enter to send &nbsp;·&nbsp; Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 16px rgba(79,70,229,0.12)' }}>
                  <MessageSquare style={{ width: 32, height: 32, color: C.indigo }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 8px', letterSpacing: '-0.3px' }}>Your messages</h3>
                <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: '0 0 24px', maxWidth: 260, lineHeight: 1.6 }}>
                  Select a conversation or connect with a mentor to start chatting.
                </p>
                {!isDesktop && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    style={{ padding: '10px 22px', borderRadius: 11, border: 'none', background: C.indigo, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}
                  >
                    View Conversations
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function Chat() {
  return (
    <DashboardLayout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
        </div>
      }>
        <ChatContent />
      </Suspense>
    </DashboardLayout>
  );
}
