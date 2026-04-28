"use client";

import React from "react";
import { Network, Share2, Activity, ChevronRight, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";

export default function AdminConnectionsPage() {
  const stats = [
    { name: "Total Connections", value: "1,245", icon: Network, change: "+12%", trend: "up", color: "indigo" },
    { name: "Pending Requests", value: "342", icon: Activity, change: "+5%", trend: "up", color: "purple" },
    { name: "Avg. Connections", value: "12.4", icon: Share2, change: "+2%", trend: "up", color: "emerald" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, margin: "0 0 4px" }}>Network Intelligence</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Connection <span style={{ color: "#4f46e5" }}>Analytics</span>
          </h1>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {stats.map((stat, i) => (
          <MetricCard key={stat.name} {...stat as any} index={i} />
        ))}
      </div>

      {/* ── Influence List ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "24px", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
            <Sparkles style={{ width: 15, height: 15, color: "#4f46e5" }} /> Most Connected Alumni
          </h2>
          <button style={{ fontSize: 12, fontWeight: 600, color: "#4f46e5", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            View all <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, transition: "all 150ms" }} className="hover:bg-white hover:shadow-sm hover:border-indigo-100">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  {String.fromCharCode(64 + item)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>Alumni User {item}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: "1px 0 0" }}>Software Engineer</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#4f46e5", margin: 0 }}>{150 - (item * 10)}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Links</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
