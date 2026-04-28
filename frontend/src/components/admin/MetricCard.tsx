"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down";
  color: string;
  index: number;
}

export const MetricCard = ({ name, value, icon: Icon, change, trend, color, index }: MetricCardProps) => {
  // Map color names to design system values
  const colorMap: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: "#eef2ff", icon: "#4f46e5" },
    purple: { bg: "#f5f3ff", icon: "#7c3aed" },
    emerald: { bg: "#ecfdf5", icon: "#059669" },
    blue: { bg: "#eff6ff", icon: "#2563eb" },
    pink: { bg: "#fdf2f8", icon: "#db2777" },
    orange: { bg: "#fffbeb", icon: "#d97706" },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 20px 18px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: scheme.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: 18, height: 18, color: scheme.icon }} />
        </div>
        {change && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              fontWeight: 700,
              color: trend === "up" ? "#16a34a" : "#ef4444",
              background: trend === "up" ? "#f0fdf4" : "#fef2f2",
              border: trend === "up" ? "1px solid #bbf7d0" : "1px solid #fecaca",
              borderRadius: 6,
              padding: "2px 7px",
            }}
          >
            {trend === "up" ? <ArrowUp style={{ width: 10, height: 10 }} /> : <ArrowDown style={{ width: 10, height: 10 }} />}
            {change}
          </span>
        )}
      </div>
      <div>
        <p
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            lineHeight: 1,
            letterSpacing: "-0.5px",
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8", margin: "4px 0 0" }}>{name}</p>
      </div>
    </motion.div>
  );
};
