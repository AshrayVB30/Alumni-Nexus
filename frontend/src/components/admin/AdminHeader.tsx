"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Settings, User, LogOut, ChevronDown, Clock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const AdminHeader = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search platform..."
            className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-transparent focus:border-indigo-500/50 rounded-full text-xs outline-none transition-all"
          />
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400">
          <Clock className="h-3.5 w-3.5 text-indigo-500" />
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="mx-2 text-gray-200">|</span>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-black">
            <span className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
            Live Analytics
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-indigo-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-[1px] bg-gray-100 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-gray-900 leading-none">{user?.name || "Admin"}</p>
            <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Platform Admin</p>
          </div>
          
          <div className="group relative">
            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all">
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                {user?.name?.charAt(0) || "A"}
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 transition-transform group-hover:rotate-180" />
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.1)] border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</p>
              </div>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <User className="h-3.5 w-3.5" /> My Profile
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Settings className="h-3.5 w-3.5" /> Admin Settings
              </button>
              <div className="h-[1px] bg-gray-50 my-1" />
              <button 
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
