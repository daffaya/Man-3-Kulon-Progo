/**
 * @fileoverview AdminLayout — shell admin baru (sidebar + top bar), sesuai mockup v2.
 *
 * - <AdminShell> dipasang sekali di route /atmin (lihat App.tsx) sehingga sidebar tidak
 *   ter-mount ulang saat berpindah halaman.
 * - <AdminLayout> (default export) dipakai oleh semua halaman admin yang sudah ada.
 *   Jika sudah berada di dalam AdminShell ia hanya meneruskan children; jika tidak
 *   (mis. /archives) ia membungkus children dengan shell sendiri.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const ShellContext = createContext(false);

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ShellContext.Provider value={true}>
      <div className="adm">
        <div
          className={`a-ov${open ? " a-on" : ""}`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <AdminSidebar open={open} />
        <div className="a-mn">
          <AdminHeader onMenu={() => setOpen(true)} />
          <main id="admin-main">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  );
};

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const inShell = useContext(ShellContext);
  return inShell ? <>{children}</> : <AdminShell>{children}</AdminShell>;
};

export default AdminLayout;
