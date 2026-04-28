"use client";

import React from "react";
import { ShieldCheck, Activity } from "lucide-react";

export default function AdminPostsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, margin: "0 0 4px" }}>Content Moderation</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Posts <span style={{ color: "#4f46e5" }}>Management</span>
          </h1>
        </div>
      </div>

      {/* ── Moderation Placeholder ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "60px 40px", textAlign: "center", boxShadow: "0 1px 4px rgba(15,23,42,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", marginBottom: 24 }}>
          <ShieldCheck style={{ width: 32, height: 32 }} />
        </div>
        
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Post Moderation System</h3>
        <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, maxWidth: 360, margin: "0 auto 28px", lineHeight: 1.6 }}>
          The Nexus AI Moderation engine is currently being optimized for platform discussions. Check back soon for live feed monitoring.
        </p>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "6px 12px", borderRadius: 8, border: "1px solid #f1f5f9" }}>
            <span style={{ width: 6, height: 6, background: "#4f46e5", borderRadius: "50%", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Ready</span>
          </div>
          <button style={{ padding: "8px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 150ms", boxShadow: "0 2px 8px rgba(79,70,229,0.25)" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#4338ca"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#4f46e5"; }}>
            Notify When Live
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
