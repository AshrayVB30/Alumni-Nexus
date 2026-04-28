\\"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { PageLoader as Loader } from "@/components/ui/Loader";
import { Search, MapPin, Building2, UserPlus, Check, Users } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface UserProfile {
  _id: string;
  name: string;
  usn: string;
  department: string;
  year_of_passing: string;
  profile?: {
    profile_photo?: string;
    designation?: string;
    current_company?: string;
    location?: string;
    followers_count?: number;
  };
  connectionStatus?: "none" | "pending" | "accepted";
}

export default function DirectoryPage() {
  const [alumni, setAlumni] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: "0",
        limit: "50"
      });
      
      if (debouncedSearch) params.append("search", debouncedSearch);

      const response = await axios.get(`http://localhost:8000/api/users/directory?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // We would ideally fetch connection statuses here too
      setAlumni(response.data.data.filter((a: any) => a._id !== user?.id));
    } catch (error) {
      console.error("Failed to fetch alumni:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAlumni();
    }
  }, [token, debouncedSearch]);

  const handleConnect = async (targetId: string) => {
    try {
      await axios.post(`http://localhost:8000/api/connections/request?target_user_id=${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistically update
      setAlumni(prev => prev.map(a => a._id === targetId ? { ...a, connectionStatus: "pending" } : a));
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Alumni Directory
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Connect with industry professionals, find mentors, and grow your network.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border-transparent shadow-lg rounded-full leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
          placeholder="Search by name, company, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : alumni.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Users className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No alumni found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {alumni.map((person) => (
            <div key={person._id} className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="px-6 pb-6 flex-1 flex flex-col relative">
                <div className="relative -mt-12 mb-4 flex justify-center">
                  {person.profile?.profile_photo ? (
                    <img 
                      className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white dark:bg-gray-800" 
                      src={person.profile.profile_photo} 
                      alt="" 
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-3xl">
                      {person.name ? person.name.charAt(0) : "U"}
                    </div>
                  )}
                </div>
                
                <div className="text-center flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{person.name || "Unknown User"}</h3>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 line-clamp-1">
                    {person.profile?.designation || "Professional"}
                  </p>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{person.profile?.current_company || "Independent"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{person.profile?.location || "Remote"}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
                    <div>
                      <span className="block font-bold text-gray-900 dark:text-white">{person.profile?.followers_count || 0}</span>
                      <span className="text-gray-500 dark:text-gray-400">Followers</span>
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900 dark:text-white">Batch of {person.year_of_passing || "N/A"}</span>
                      <span className="text-gray-500 dark:text-gray-400">{person.department || "Dept"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {person.connectionStatus === "pending" ? (
                    <button disabled className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-full text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 opacity-75 cursor-not-allowed">
                      <Check className="h-4 w-4 mr-2" /> Requested
                    </button>
                  ) : person.connectionStatus === "accepted" ? (
                    <button disabled className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50">
                      Connected
                    </button>
                  ) : (
                    <button onClick={() => handleConnect(person._id)} className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                      <UserPlus className="h-4 w-4 mr-2" /> Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
