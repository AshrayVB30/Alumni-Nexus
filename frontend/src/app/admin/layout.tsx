"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { PageLoader as Loader } from "@/components/ui/Loader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (!loading && (!user || user.role.toLowerCase() !== "admin")) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role.toLowerCase() !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <Loader />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default AdminLayout;
