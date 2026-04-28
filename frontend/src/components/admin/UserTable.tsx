"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { PageLoader as Loader } from "@/components/ui/Loader";
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { motion } from "framer-motion";

interface User {
  _id: string;
  name: string;
  email: string;
  usn: string;
  department: string;
  year_of_passing: string;
  is_verified: boolean;
  is_active: boolean;
  profile?: {
    profile_photo?: string;
    current_company?: string;
  };
}

interface UserTableProps {
  role: "student" | "alumni";
  title: string;
  description: string;
}

export default function UserTable({ role, title, description }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const token = useAuthStore((s) => s.token);
  
  // Filters
  const [department, setDepartment] = useState("");
  const [yearOfPassing, setYearOfPassing] = useState("");
  const [isVerified, setIsVerified] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: role,
        skip: "0",
        limit: "50",
      });
      
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (department) params.append("department", department);
      if (yearOfPassing) params.append("year_of_passing", yearOfPassing);
      if (isVerified === "true") params.append("is_verified", "true");
      if (isVerified === "false") params.append("is_verified", "false");

      const response = await axios.get(`http://localhost:8000/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, debouncedSearch, department, yearOfPassing, isVerified]);

  const handleAction = async (userId: string, action: string, value: any) => {
    if (!confirm(`Are you sure you want to change this user's ${action}?`)) return;
    
    try {
      await axios.put(`http://localhost:8000/api/admin/users/${userId}`, 
        { [action]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1 w-8 bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">User Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{description}</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            placeholder="Search by name, email, or USN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="CS">Computer Science</option>
          <option value="IT">Information Tech</option>
          <option value="EC">Electronics</option>
          <option value="ME">Mechanical</option>
        </select>

        {role === "alumni" && (
          <select
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer"
            value={isVerified}
            onChange={(e) => setIsVerified(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-50 overflow-hidden">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credentials</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Filter className="h-6 w-6 text-slate-200" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No users found matching filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {user.profile?.profile_photo ? (
                              <img className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white shadow-sm" src={user.profile.profile_photo} alt="" />
                            ) : (
                              <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                              </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-black text-slate-900 truncate">{user.name || "Anonymous User"}</p>
                            <p className="text-[11px] font-bold text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{user.usn || "NOT SET"}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Batch of {user.year_of_passing || "---"}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-slate-100 text-slate-600">
                          {user.department || "GEN"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-tight ${user.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {user.is_active ? 'Online' : 'Disabled'}
                            </span>
                          </div>
                          {role === "alumni" && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md w-fit ${user.is_verified ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                              {user.is_verified ? 'Verified Prof' : 'Pending Verification'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {role === "alumni" && !user.is_verified && (
                            <button onClick={() => handleAction(user._id, "is_verified", true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Verify User">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleAction(user._id, "is_active", !user.is_active)} 
                            className={`p-2 rounded-xl transition-all shadow-sm ${user.is_active ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"}`}
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            {user.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="bg-slate-50/30 px-8 py-5 flex items-center justify-between border-t border-slate-50">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{users.length}</span> of <span className="text-slate-900">{total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
