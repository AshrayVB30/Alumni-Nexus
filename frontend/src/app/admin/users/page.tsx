"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Mail,
  Hash,
  RefreshCw
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/Toast";

interface User {
  _id: string;
  name: string;
  email: string;
  usn: string;
  role: string;
  department: string;
  is_verified: boolean;
  year_of_passing: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== "all") params.role = roleFilter;
      if (deptFilter !== "all") params.department = deptFilter;
      if (search) params.search = search;

      const response = await axios.get("http://localhost:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, roleFilter, deptFilter]);

  const handleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.post(
        `http://localhost:8000/api/admin/users/${userId}/verify?verified=${!currentStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast(currentStatus ? "User unverified" : "User verified", "success");
      fetchUsers();
    } catch (error) {
      toast("Verification update failed", "error");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("User deleted successfully", "success");
      fetchUsers();
    } catch (error) {
      toast("Deletion failed", "error");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.usn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, margin: "0 0 4px" }}>System Administration</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            User <span style={{ color: "#4f46e5" }}>Management</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8" }} />
            <input 
              type="text"
              placeholder="Search USN, Name..."
              style={{ paddingLeft: 34, paddingRight: 16, height: 40, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#0f172a", outline: "none", width: 220 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchUsers}
            style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms" }}
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin text-indigo-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 10, padding: "0 12px", height: 38 }}>
          <Filter style={{ width: 14, height: 14, color: "#94a3b8" }} />
          <select 
            style={{ fontSize: 12, fontWeight: 600, color: "#475569", background: "transparent", border: "none", outline: "none", cursor: "pointer" }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 10, padding: "0 12px", height: 38 }}>
          <Users style={{ width: 14, height: 14, color: "#94a3b8" }} />
          <select 
            style={{ fontSize: 12, fontWeight: 600, color: "#475569", background: "transparent", border: "none", outline: "none", cursor: "pointer" }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ISE">ISE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Showing {filteredUsers.length} users
        </div>
      </div>

      {/* ── Table Container ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(15,23,42,0.04)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>User</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Identity</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "60px 0", textAlign: "center" }}>
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                    <p style={{ marginTop: 12, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Loading user database...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "60px 0", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>No users found matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: "1px solid #f8fafc", transition: "all 150ms" }} className="hover:bg-slate-50/50">
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{user.name}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                            <Mail style={{ width: 11, height: 11, color: "#94a3b8" }} />
                            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Hash style={{ width: 11, height: 11, color: "#94a3b8" }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{user.usn}</span>
                        </div>
                        <span style={{ 
                          alignSelf: "flex-start", 
                          padding: "2px 8px", 
                          borderRadius: 6, 
                          fontSize: 10, 
                          fontWeight: 700, 
                          textTransform: "uppercase", 
                          letterSpacing: "0.02em",
                          background: user.role.toLowerCase() === "alumni" ? "#eef2ff" : "#eff6ff",
                          color: user.role.toLowerCase() === "alumni" ? "#4f46e5" : "#2563eb",
                          border: user.role.toLowerCase() === "alumni" ? "1px solid #c7d2fe" : "1px solid #bfdbfe"
                        }}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", margin: 0 }}>{user.department}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: "2px 0 0" }}>Class of {user.year_of_passing}</p>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {user.is_verified ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669" }}>
                          <ShieldCheck style={{ width: 14, height: 14 }} />
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Verified</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#d97706" }}>
                          <ShieldAlert style={{ width: 14, height: 14 }} />
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Pending</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <button 
                          onClick={() => handleVerify(user._id, user.is_verified)}
                          style={{ 
                            width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms",
                            color: user.is_verified ? "#d97706" : "#059669"
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = user.is_verified ? "#fffbeb" : "#ecfdf5"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                        >
                          {user.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", cursor: "pointer", transition: "all 150ms" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
