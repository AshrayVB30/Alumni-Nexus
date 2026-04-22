import os

base_dir = r"e:\Alumini Project\Alumni Nexus\frontend\src"

folders = [
    os.path.join(base_dir, "app", "auth", "login"),
    os.path.join(base_dir, "app", "auth", "register"),
    os.path.join(base_dir, "components", "layout"),
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)

# Auth Services
auth_ts = """import api from './api';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (email: string, password: string, role: string) => {
  const res = await api.post('/auth/register', { email, password, role });
  return res.data;
};
"""
with open(os.path.join(base_dir, "services", "auth.ts"), "w") as f:
    f.write(auth_ts)

# Login Page
login_tsx = """'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { login } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login(email, password);
      // Dummy user detail since we just get id/role
      setAuth({ id: data.user_id, email, role: data.role }, data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center pb-2">
          <h1 className="text-2xl font-bold text-indigo-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Sign in to your Alumni Nexus account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" isLoading={loading} className="mt-2 w-full">
              Sign In
            </Button>
            <p className="text-center text-sm text-slate-500 mt-2">
              Don't have an account? <Link href="/auth/register" className="text-indigo-600 hover:underline">Sign up</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
"""
with open(os.path.join(base_dir, "app", "auth", "login", "page.tsx"), "w") as f:
    f.write(login_tsx)

# Register Page
register_tsx = """'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(email, password, role);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center pb-2">
          <h1 className="text-2xl font-bold text-indigo-900">Join Alumni Nexus</h1>
          <p className="text-slate-500 text-sm">Create an account to connect</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <select 
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              value={role} 
              onChange={e => setRole(e.target.value)}
            >
              <option value="Student">Student</option>
              <option value="Alumni">Alumni</option>
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" isLoading={loading} className="mt-2 w-full">Sign Up</Button>
            <p className="text-center text-sm text-slate-500 mt-2">
              Already have an account? <Link href="/auth/login" className="text-indigo-600 hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
"""
with open(os.path.join(base_dir, "app", "auth", "register", "page.tsx"), "w") as f:
    f.write(register_tsx)

print("Auth pages generated.")
