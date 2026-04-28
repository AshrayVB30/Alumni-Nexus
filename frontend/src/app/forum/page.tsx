'use client';
import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import {
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal,
  Search, Send, TrendingUp, Users, Hash, Flame,
  ChevronDown, ChevronUp, X, Image, Link as LinkIcon,
} from 'lucide-react';
import type { ForumPost } from '@/types';

/* ─── tokens ─────────────────────────────────────────────────────────── */
const C = {
  white: '#ffffff', bg: '#f8fafc', border: '#e2e8f0',
  text: '#0f172a', muted: '#64748b', subtle: '#94a3b8',
  indigo: '#4f46e5', indigoBg: '#eef2ff', indigoBorder: '#c7d2fe',
  red: '#ef4444', redBg: '#fef2f2',
};

const CATEGORIES = ['All', 'Career', 'Tech', 'Research', 'Internships', 'General'];

const CAT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Career:     { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Tech:       { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  Research:   { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
  Internships:{ bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  General:    { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
};

/* ─── helpers ─────────────────────────────────────────────────────────── */
function timeAgo(ts?: string) {
  if (!ts) return 'Recently';
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60)   return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d < 30)   return `${d}d ago`;
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function avatarColor(name?: string) {
  const p = ['#4f46e5','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];
  return p[(name?.charCodeAt(0) ?? 0) % p.length];
}

/* ─── primitives ──────────────────────────────────────────────────────── */
function Avatar({ name, size = 40 }: { name?: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: avatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {name?.charAt(0).toUpperCase() ?? 'U'}
    </div>
  );
}

function Sk({ w = '100%', h = 12, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

function PostSkeleton() {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 20px 16px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <Sk w={40} h={40} r={11} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Sk w="35%" h={13} />
          <Sk w="20%" h={10} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <Sk h={13} />
        <Sk w="90%" h={13} />
        <Sk w="75%" h={13} />
      </div>
      <div style={{ display: 'flex', gap: 20, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Sk w={48} h={20} r={6} />
        <Sk w={48} h={20} r={6} />
        <Sk w={48} h={20} r={6} />
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms',
        border: `1.5px solid ${active ? C.indigo : hov ? C.indigoBorder : C.border}`,
        background: active ? C.indigo : hov ? C.indigoBg : C.white,
        color: active ? '#fff' : hov ? C.indigo : C.muted,
      }}
    >
      {label}
    </button>
  );
}

/* ─── post card ───────────────────────────────────────────────────────── */
function PostCard({ post, userId, onLike, onComment, onShare }: {
  post: ForumPost; userId: string;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onShare: (id: string) => void;
}) {
  const [hov,        setHov]        = useState(false);
  const [expanded,   setExpanded]   = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [commentTxt, setCommentTxt] = useState('');
  const [commentFoc, setCommentFoc] = useState(false);
  const [likeAnim,   setLikeAnim]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const liked      = post.likes?.includes(userId);
  const likeCount  = post.likes?.length ?? 0;
  const cmtCount   = post.comments?.length ?? 0;
  const cat        = (post as any).category as string | undefined;
  const catStyle   = cat ? CAT_COLORS[cat] ?? CAT_COLORS.General : null;

  const handleLike = () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike(post._id);
  };

  const submitComment = () => {
    if (!commentTxt.trim()) return;
    onComment(post._id, commentTxt.trim());
    setCommentTxt('');
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white, borderRadius: 16,
        border: `1px solid ${hov ? '#c7d2fe' : C.border}`,
        boxShadow: hov ? '0 4px 16px rgba(79,70,229,0.07)' : '0 1px 4px rgba(15,23,42,0.04)',
        transition: 'all 200ms ease', overflow: 'hidden',
      }}
    >
      <div style={{ padding: '18px 20px 14px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar name={post.author_name} size={40} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{post.author_name ?? 'Anonymous'}</span>
                {catStyle && cat && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: catStyle.color, background: catStyle.bg, border: `1px solid ${catStyle.border}`, borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cat}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500 }}>{timeAgo(post.timestamp)}</span>
            </div>
          </div>
          <button style={{ padding: 5, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: C.subtle, display: 'flex' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = C.muted; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.subtle; }}
          >
            <MoreHorizontal style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content */}
        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, fontWeight: 500, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 12, borderTop: `1px solid #f8fafc` }}>
          {/* Like */}
          <button
            onClick={handleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9,
              border: `1px solid ${liked ? '#fecaca' : C.border}`,
              background: liked ? C.redBg : 'transparent',
              color: liked ? C.red : C.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
              transform: likeAnim ? 'scale(1.15)' : 'scale(1)',
            }}
            onMouseEnter={(e) => { if (!liked) { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; (e.currentTarget as HTMLElement).style.color = C.red; } }}
            onMouseLeave={(e) => { if (!liked) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; } }}
          >
            <Heart style={{ width: 14, height: 14, fill: liked ? C.red : 'none' }} />
            {likeCount > 0 && likeCount}
          </button>

          {/* Comment */}
          <button
            onClick={() => { setExpanded(!expanded); if (!expanded) setTimeout(() => inputRef.current?.focus(), 100); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9,
              border: `1px solid ${expanded ? C.indigoBorder : C.border}`,
              background: expanded ? C.indigoBg : 'transparent',
              color: expanded ? C.indigo : C.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={(e) => { if (!expanded) { (e.currentTarget as HTMLElement).style.background = C.indigoBg; (e.currentTarget as HTMLElement).style.borderColor = C.indigoBorder; (e.currentTarget as HTMLElement).style.color = C.indigo; } }}
            onMouseLeave={(e) => { if (!expanded) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; } }}
          >
            <MessageSquare style={{ width: 14, height: 14 }} />
            {cmtCount > 0 ? cmtCount : 'Comment'}
            {cmtCount > 0 && <ChevronDown style={{ width: 12, height: 12, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />}
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(post._id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = C.text; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.muted; }}
          >
            <Share2 style={{ width: 14, height: 14 }} />
            Share
          </button>

          {/* Bookmark */}
          <button
            onClick={() => setSaved(!saved)}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 9, border: `1px solid ${saved ? C.indigoBorder : C.border}`, background: saved ? C.indigoBg : 'transparent', cursor: 'pointer', transition: 'all 150ms', color: saved ? C.indigo : C.subtle }}
          >
            <Bookmark style={{ width: 14, height: 14, fill: saved ? C.indigo : 'none' }} />
          </button>
        </div>
      </div>

      {/* Comments section */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, background: '#fafbff', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(post.comments ?? []).map((c: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <Avatar name={c.author_name} size={30} />
              <div style={{ flex: 1, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px 14px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>{c.author_name ?? 'User'}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{c.content}</p>
              </div>
            </div>
          ))}

          {/* Comment input */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar name={userId} size={30} />
            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center', background: C.white, borderRadius: 11, border: `1.5px solid ${commentFoc ? C.indigo : C.border}`, padding: '6px 8px 6px 14px', boxShadow: commentFoc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none', transition: 'all 150ms' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Write a comment..."
                value={commentTxt}
                onChange={(e) => setCommentTxt(e.target.value)}
                onFocus={() => setCommentFoc(true)}
                onBlur={() => setCommentFoc(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitComment(); } }}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontWeight: 500, color: C.text, background: 'transparent', fontFamily: 'inherit' }}
              />
              <button
                onClick={submitComment}
                disabled={!commentTxt.trim()}
                style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: commentTxt.trim() ? C.indigo : '#e2e8f0', color: commentTxt.trim() ? '#fff' : C.subtle, cursor: commentTxt.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms', flexShrink: 0 }}
              >
                <Send style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── composer ────────────────────────────────────────────────────────── */
function Composer({ user, activeCat, onPost }: {
  user: any; activeCat: string;
  onPost: (content: string, category: string) => Promise<void>;
}) {
  const [content,   setContent]   = useState('');
  const [expanded,  setExpanded]  = useState(false);
  const [category,  setCategory]  = useState(activeCat === 'All' ? 'General' : activeCat);
  const [posting,   setPosting]   = useState(false);
  const [focused,   setFocused]   = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeCat !== 'All') setCategory(activeCat);
  }, [activeCat]);

  const submit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    await onPost(content.trim(), category);
    setContent('');
    setExpanded(false);
    setPosting(false);
  };

  const catStyle = CAT_COLORS[category] ?? CAT_COLORS.General;

  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${focused ? C.indigoBorder : C.border}`, boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.08)' : '0 1px 4px rgba(15,23,42,0.04)', transition: 'all 200ms', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={user?.name} size={40} />
        <div style={{ flex: 1 }}>
          <textarea
            ref={textRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => { setFocused(true); setExpanded(true); }}
            onBlur={() => setFocused(false)}
            placeholder="Share an insight, question, or update with the community..."
            rows={expanded ? 4 : 2}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: C.text, background: 'transparent', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', transition: 'all 200ms' }}
          />
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 18px 14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer' }}>
            <Image style={{ width: 14, height: 14 }} /> Photo
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer' }}>
            <LinkIcon style={{ width: 14, height: 14 }} /> Link
          </button>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${catStyle.border}`, background: catStyle.bg, fontSize: 12, fontWeight: 700, color: catStyle.color, outline: 'none', cursor: 'pointer' }}
          >
            {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.border}`, background: '#fafbff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Hash style={{ width: 13, height: 13, color: C.subtle }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.subtle }}>{category}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {expanded && (
            <button
              onClick={() => { setContent(''); setExpanded(false); }}
              style={{ padding: '7px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={submit}
            disabled={!content.trim() || posting}
            style={{
              padding: '7px 20px', borderRadius: 9, border: 'none',
              background: content.trim() && !posting ? C.indigo : '#e2e8f0',
              color: content.trim() && !posting ? '#fff' : C.subtle,
              fontSize: 12, fontWeight: 700, cursor: content.trim() && !posting ? 'pointer' : 'not-allowed',
              boxShadow: content.trim() ? '0 2px 8px rgba(79,70,229,0.2)' : 'none',
              transition: 'all 150ms',
            }}
          >
            {posting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── right sidebar ───────────────────────────────────────────────────── */
function RightSidebar({ posts }: { posts: ForumPost[] }) {
  const trending = CATEGORIES.filter((c) => c !== 'All').map((cat) => ({
    cat,
    count: Math.floor(Math.random() * 40) + 5,
    style: CAT_COLORS[cat] ?? CAT_COLORS.General,
  }));

  const topPosts = [...posts]
    .sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0))
    .slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Trending topics */}
      <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame style={{ width: 15, height: 15, color: '#f97316' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Trending Topics</span>
        </div>
        <div style={{ padding: '8px 0' }}>
          {trending.map(({ cat, count, style }) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 18px', cursor: 'pointer', transition: 'background 150ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: style.color, background: style.bg, border: `1px solid ${style.border}`, borderRadius: 20, padding: '2px 9px' }}>{cat}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.subtle }}>{count} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp style={{ width: 15, height: 15, color: C.indigo }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Popular Posts</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {topPosts.map((p, i) => (
              <div key={p._id} style={{ padding: '10px 18px', borderBottom: i < topPosts.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: '0 0 5px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500 }}>{p.author_name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: C.red, fontWeight: 600 }}>
                    <Heart style={{ width: 10, height: 10, fill: C.red }} />{p.likes?.length ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community stats */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)', borderRadius: 16, padding: '20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Users style={{ width: 15, height: 15, color: '#a5b4fc' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Community</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Members', value: '2.4k' },
            { label: 'Posts', value: `${posts.length}` },
            { label: 'Active Today', value: '142' },
            { label: 'Topics', value: '6' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.3px' }}>{value}</p>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#a5b4fc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── page ────────────────────────────────────────────────────────────── */
export default function Forum() {
  const user      = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [posts,      setPosts]      = useState<ForumPost[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeCat,  setActiveCat]  = useState('All');
  const [search,     setSearch]     = useState('');
  const [searchFoc,  setSearchFoc]  = useState(false);

  const fetchPosts = async () => {
    try {
      const r = await api.get('/posts/');
      setPosts(r.data);
    } catch {
      toast('Failed to load posts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async (content: string, category: string) => {
    if (!user) return;
    try {
      await api.post('/posts/', { content, author: user.id, category });
      toast('Post published.', 'success');
      fetchPosts();
    } catch {
      toast('Failed to publish post.', 'error');
    }
  };

  const handleLike = async (id: string) => {
    if (!user) return;
    try {
      await api.post(`/posts/${id}/like?user_id=${user.id}`);
      fetchPosts();
    } catch {
      toast('Action failed.', 'error');
    }
  };

  const handleComment = async (id: string, text: string) => {
    if (!user) return;
    try {
      await api.post(`/posts/${id}/comments`, { content: text, author: user.id });
      toast('Comment added.', 'success');
      fetchPosts();
    } catch {
      toast('Failed to add comment.', 'error');
    }
  };

  const handleShare = (id: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/forum#${id}`).then(() => {
      toast('Link copied to clipboard.', 'success');
    });
  };

  const filtered = posts.filter((p) => {
    if (activeCat !== 'All' && (p as any).category !== activeCat) return false;
    if (search && !p.content?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: '0 0 5px', letterSpacing: '-0.5px' }}>Community Forum</h1>
            <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: 0 }}>
              Discussions, insights, and questions across the alumni ecosystem.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: searchFoc ? C.indigo : C.subtle, pointerEvents: 'none', transition: 'color 150ms' }} />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFoc(true)}
              onBlur={() => setSearchFoc(false)}
              style={{ height: 40, width: 260, borderRadius: 11, border: `1.5px solid ${searchFoc ? C.indigo : C.border}`, background: C.white, padding: '0 36px 0 38px', fontSize: 13, fontWeight: 500, color: C.text, outline: 'none', boxShadow: searchFoc ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none', transition: 'all 150ms' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.subtle, display: 'flex', padding: 2 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>

        {/* ── Category tabs ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {CATEGORIES.map((cat) => (
            <CategoryPill key={cat} label={cat} active={activeCat === cat} onClick={() => setActiveCat(cat)} />
          ))}
        </div>

        {/* ── Main grid: feed + sidebar ── */}
        <div className="forum-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          <style>{`@media(max-width:900px){.forum-grid{grid-template-columns:1fr!important}}`}</style>

          {/* Feed column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Composer */}
            <Composer user={user} activeCat={activeCat} onPost={handlePost} />

            {/* Posts */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ background: C.white, borderRadius: 20, border: `2px dashed ${C.border}`, padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: C.indigoBg, border: `1px solid ${C.indigoBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <MessageSquare style={{ width: 26, height: 26, color: C.indigo }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
                  {search || activeCat !== 'All' ? 'No posts match your filters' : 'No discussions yet'}
                </h3>
                <p style={{ fontSize: 13, color: C.muted, fontWeight: 500, margin: '0 0 20px', maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
                  {search || activeCat !== 'All' ? 'Try a different search or category.' : 'Be the first to start a conversation in this community.'}
                </p>
                {(search || activeCat !== 'All') && (
                  <button
                    onClick={() => { setSearch(''); setActiveCat('All'); }}
                    style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer' }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, margin: 0 }}>
                  <strong style={{ color: C.text }}>{filtered.length}</strong> post{filtered.length !== 1 ? 's' : ''}
                  {activeCat !== 'All' && <> in <strong style={{ color: C.indigo }}>{activeCat}</strong></>}
                </p>
                {filtered.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    userId={user?.id ?? ''}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                  />
                ))}
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className="forum-sidebar">
            <style>{`@media(max-width:900px){.forum-sidebar{display:none!important}}`}</style>
            <RightSidebar posts={posts} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
