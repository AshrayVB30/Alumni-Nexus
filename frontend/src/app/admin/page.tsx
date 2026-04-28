"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/admin/MetricCard";
import { 
  Users, 
  GraduationCap, 
  Network, 
  MessageSquare, 
  TrendingUp,
  Activity,
  RefreshCw,
  Download,
  MoreHorizontal
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { PageLoader as Loader } from "@/components/ui/Loader";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("Monthly");
  const token = useAuthStore((s) => s.token);

  const fetchAnalytics = async () => {
    try {
      if (!data) setLoading(true);
      else setRefreshing(true);
      
      const response = await axios.get("http://localhost:8000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const chartData = data?.growthData || [];

  const cards = [
    { name: "Total Students", value: data?.totalStudents || 0, icon: GraduationCap, change: "+12%", trend: "up", color: "indigo" },
    { name: "Total Alumni", value: data?.totalAlumni || 0, icon: Users, change: "+18%", trend: "up", color: "purple" },
    { name: "Verified Alumni", value: data?.verifiedAlumni || 0, icon: Activity, change: "+5%", trend: "up", color: "emerald" },
    { name: "Active Users", value: data?.activeUsers || 0, icon: TrendingUp, change: "-2%", trend: "down", color: "blue" },
    { name: "Connections", value: data?.totalConnections || 0, icon: Network, change: "+40%", trend: "up", color: "pink" },
    { name: "Total Posts", value: data?.totalPosts || 0, icon: MessageSquare, change: "+10%", trend: "up", color: "orange" },
  ];

  const timeRanges = ["Weekly", "Monthly", "Yearly"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, margin: "0 0 4px" }}>Platform Management</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Admin <span style={{ color: "#4f46e5" }}>Analytics</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={fetchAnalytics}
            style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer", transition: "all 150ms", display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
            Sync
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, border: "none", background: "#4f46e5", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.25)", transition: "all 150ms" }}>
            <Download className="h-4 w-4" />
            Report
          </button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {cards.map((card, i) => (
          <MetricCard key={card.name} {...card as any} index={i} />
        ))}
      </div>

      {/* ── Visualizations ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 7fr) 3fr", gap: 24 }} className="admin-bottom-grid">
        <style>{`@media(max-width:1024px){.admin-bottom-grid{grid-template-columns:1fr!important}}`}</style>
        
        {/* Main Chart */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "24px", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Growth Trends</h2>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: "2px 0 0" }}>User registration analytics</p>
            </div>
            <div style={{ display: "flex", gap: 4, background: "#f8fafc", padding: 3, borderRadius: 10, border: "1px solid #f1f5f9" }}>
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 150ms",
                    background: timeRange === range ? "#fff" : "transparent",
                    color: timeRange === range ? "#4f46e5" : "#64748b",
                    boxShadow: timeRange === range ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: "8px 12px" }}
                  itemStyle={{ color: "#4f46e5", fontWeight: "700", fontSize: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "600", fontSize: "10px", marginBottom: "2px" }}
                />
                <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "24px", boxShadow: "0 1px 4px rgba(15,23,42,0.04)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
              <Activity style={{ width: 14, height: 14, color: "#94a3b8" }} /> Platform Log
            </h2>
            <MoreHorizontal style={{ width: 14, height: 14, color: "#cbd5e1" }} />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", maxHeight: 300 }} className="custom-scrollbar">
            {(data?.recentActivity || []).map((activity: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{activity.message?.charAt(0) || "U"}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#334155", margin: 0, lineHeight: 1.4 }}>{activity.message}</p>
                  <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, margin: "2px 0 0" }}>
                    {activity.time ? new Date(activity.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                  </p>
                </div>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <div style={{ textAlign: "center", py: 20 }}>
                <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>No recent logs.</p>
              </div>
            )}
          </div>
          
          <button style={{ marginTop: 20, width: "100%", padding: "8px 0", borderRadius: 10, border: "1px solid #f1f5f9", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#64748b", cursor: "pointer", transition: "all 150ms" }}>
            View Full Logs
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
