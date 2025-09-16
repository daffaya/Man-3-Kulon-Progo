// src/components/layout/AdminLayout.tsx
import React from "react";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <main className="flex-grow pt-20">{children}</main>
    </div>
  );
};

export default AdminLayout;
