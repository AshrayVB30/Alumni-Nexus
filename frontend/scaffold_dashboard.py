import os

base_dir = r"e:\Alumini Project\Alumni Nexus\frontend\src"

folders = [
    os.path.join(base_dir, "app", "dashboard"),
    os.path.join(base_dir, "app", "mentors"),
    os.path.join(base_dir, "app", "chat"),
    os.path.join(base_dir, "app", "marketplace"),
    os.path.join(base_dir, "app", "profile"),
    os.path.join(base_dir, "components", "layout"),
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)

layout_tsx = """import Link from 'next/link';
import { Home, Users, MessageSquare, Briefcase, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-indigo-700 tracking-tight">Alumni Nexus</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-xl hover:bg-slate-100 font-medium">
          <Home className="w-5 h-5 text-indigo-500" /> Dashboard
        </Link>
        <Link href="/mentors" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-xl hover:bg-slate-100 font-medium">
          <Users className="w-5 h-5 text-indigo-500" /> Mentor Match
        </Link>
        <Link href="/chat" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-xl hover:bg-slate-100 font-medium">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> Chat
        </Link>
        <Link href="/marketplace" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-xl hover:bg-slate-100 font-medium">
          <Briefcase className="w-5 h-5 text-indigo-500" /> Marketplace
        </Link>
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-xl hover:bg-slate-100 font-medium">
          <UserIcon className="w-5 h-5 text-indigo-500" /> Profile
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-xl hover:bg-red-50 hover:text-red-600 font-medium w-full">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
"""
with open(os.path.join(base_dir, "components", "layout", "DashboardLayout.tsx"), "w") as f:
    f.write(layout_tsx)

dashboard_page = """'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';

export default function Dashboard() {
  const user = useAuthStore(state => state.user);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Welcome Back</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Feed</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 text-slate-500">
              <p>No recent activity. Start engaging with Mentors or check the Marketplace!</p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Profile Status</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Logged in as: {user?.email || 'Loading...'}</p>
              <p className="text-sm text-indigo-600 mt-2 font-semibold">Role: {user?.role}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Notifications</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">You're all caught up!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
"""
with open(os.path.join(base_dir, "app", "dashboard", "page.tsx"), "w") as f:
    f.write(dashboard_page)

mentors_page = """'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Mentors() {
  const user = useAuthStore(state => state.user);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      api.get(`/users/${user.id}/mentors`)
        .then(res => setMentors(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Mentor Matches</h1>
      <p className="text-slate-500 mb-6">Based on your skills and interests, FAISS found these top matches.</p>
      
      {loading ? (
        <p>Loading AI Matches...</p>
      ) : mentors.length === 0 ? (
        <Card><CardContent className="pt-6"><p>No mentors found. Please update your profile skills.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m: any) => (
            <Card key={m._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <h3 className="font-semibold text-lg">{m.email}</h3>
                <p className="text-sm text-indigo-600 font-medium">{m.profile?.role || 'Alumni'} @ {m.profile?.company || 'Company'}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {m.profile?.skills?.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{s}</span>
                  ))}
                </div>
                <Button className="w-full" variant="outline">Connect</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
"""
with open(os.path.join(base_dir, "app", "mentors", "page.tsx"), "w") as f:
    f.write(mentors_page)

chat_page = """'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';

export default function Chat() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Messages</h1>
      <Card className="h-[70vh]">
        <CardContent className="p-0 flex h-full">
          <div className="w-1/3 border-r border-slate-100 p-4 overflow-y-auto bg-slate-50 rounded-l-2xl">
            <h3 className="font-semibold text-slate-500 mb-4 uppercase text-xs tracking-wider">Connections</h3>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 cursor-pointer">
              <p className="font-medium">Mentor Example</p>
              <p className="text-xs text-slate-500 truncate">Let me know if you need help with React...</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-white rounded-r-2xl">
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                <div className="self-start bg-slate-100 text-slate-800 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">Hi! How can I help you today?</div>
            </div>
            <div className="p-4 border-t border-slate-100">
              <input type="text" placeholder="Type a message..." className="w-full h-11 bg-slate-50 rounded-full px-4 border border-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
"""
with open(os.path.join(base_dir, "app", "chat", "page.tsx"), "w") as f:
    f.write(chat_page)

print("Dashboard scaffolding complete.")
