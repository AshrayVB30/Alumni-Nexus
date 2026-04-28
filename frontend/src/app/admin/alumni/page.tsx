"use client";

import UserTable from "@/components/admin/UserTable";

export default function AdminAlumniPage() {
  return (
    <UserTable 
      role="alumni" 
      title="Alumni Directory" 
      description="Manage all alumni accounts, verify their status, and control their access." 
    />
  );
}
