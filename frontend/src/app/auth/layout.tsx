import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni Nexus - Authentication",
  description: "Sign in or create an account to join the Alumni Nexus community",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
