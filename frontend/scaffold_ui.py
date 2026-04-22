import os

base_dir = r"e:\Alumini Project\Alumni Nexus\frontend\src"

folders = [
    os.path.join(base_dir, "components", "ui"),
    os.path.join(base_dir, "store"),
    os.path.join(base_dir, "services"),
    os.path.join(base_dir, "lib")
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)

# 1. lib/utils.ts
utils_ts = """import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
"""
with open(os.path.join(base_dir, "lib", "utils.ts"), "w") as f:
    f.write(utils_ts)

# 2. components/ui/Button.tsx
button_tsx = """import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      secondary: "bg-purple-100 text-purple-900 hover:bg-purple-200",
      outline: "border border-slate-200 hover:bg-slate-100 text-slate-900",
      ghost: "hover:bg-slate-100 text-slate-700"
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(baseClass, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
"""
with open(os.path.join(base_dir, "components", "ui", "Button.tsx"), "w") as f:
    f.write(button_tsx)

# 3. components/ui/Input.tsx
input_tsx = """import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
"""
with open(os.path.join(base_dir, "components", "ui", "Input.tsx"), "w") as f:
    f.write(input_tsx)

# 4. components/ui/Card.tsx
card_tsx = """import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white text-slate-950 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>;
}
"""
with open(os.path.join(base_dir, "components", "ui", "Card.tsx"), "w") as f:
    f.write(card_tsx)

# 5. store/useAuthStore.ts
auth_store = """import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));
"""
with open(os.path.join(base_dir, "store", "useAuthStore.ts"), "w") as f:
    f.write(auth_store)

# 6. services/api.ts
api_ts = """import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
"""
with open(os.path.join(base_dir, "services", "api.ts"), "w") as f:
    f.write(api_ts)

print("UI components and setup generated successfully.")
