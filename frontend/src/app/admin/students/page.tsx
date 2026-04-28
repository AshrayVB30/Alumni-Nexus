"use client";

import UserTable from "@/components/admin/UserTable";

export default function AdminStudentsPage() {
  return (
    <UserTable 
      role="student" 
      title="Students Directory" 
      description="Manage all student accounts, view their details, and control their access." 
    />
  );
}
