/**
 * @fileoverview CmsOverviewPage — "Halaman Website" (mockup v2): daftar halaman yang bisa diedit,
 * dikelompokkan per bagian, dengan filter "Perlu dicek". Hanya untuk super_admin.
 *
 * Route: /atmin/cms
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import {
  CMS_GROUPS,
  CMS_NEEDS_CHECK,
  CMS_PAGES,
  type CmsBadge,
} from "./cmsPages";

const BADGE_CLASS: Record<CmsBadge, string> = {
  "Sering berubah": "a-ok",
  "Perlu update": "a-wn",
  "Tiap tahun ajaran": "a-in",
};

const CmsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showErrorToast } = useToastMessage();
  const [filter, setFilter] = useState<"all" | "check">("all");

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms" } });
      return;
    }
    if (user?.role !== "super_admin") {
      showErrorToast("Hanya Super Admin yang dapat mengakses halaman ini.");
      navigate("/atmin");
    }
  }, [isLoadingAuth, isLoggedIn, user, navigate, showErrorToast]);

  if (isLoadingAuth) {
    return (
      <AdminLayout>
        <div className="a-pg">
          <div className="a-cd">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="a-cr"><div className="a-sk" style={{ width: "50%" }} /></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="a-pg">
        <div className="a-hd">
          <div>
            <h1 className="a-h1">Halaman Website</h1>
            <p className="a-sub">
              Pilih halaman yang ingin diedit. Perubahan langsung tampil di website publik setelah disimpan.
            </p>
          </div>
          <div className="a-sg" role="group" aria-label="Filter halaman">
            <button
              type="button"
              className={filter === "all" ? "a-on" : ""}
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              Semua ({CMS_PAGES.length})
            </button>
            <button
              type="button"
              className={filter === "check" ? "a-on" : ""}
              aria-pressed={filter === "check"}
              onClick={() => setFilter("check")}
            >
              Perlu dicek ({CMS_NEEDS_CHECK.length})
            </button>
          </div>
        </div>

        {CMS_GROUPS.map((group) => {
          const rows = CMS_PAGES.filter(
            (p) =>
              p.group === group &&
              (filter === "all" || p.badge === "Perlu update" || p.badge === "Tiap tahun ajaran"),
          );
          if (rows.length === 0) return null;
          return (
            <section key={group} className="a-cd a-z" style={{ marginTop: 0, marginBottom: 16 }}>
              <div className="a-gh"><h2 className="a-h2">{group}</h2></div>
              {rows.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.to} className="a-cr">
                    <span className="a-th"><Icon size={18} /></span>
                    <p>
                      <b>{p.label}</b>
                      <span>{p.description}</span>
                    </p>
                    {p.badge && (
                      <span className={`a-b ${BADGE_CLASS[p.badge]} a-hm`}>{p.badge}</span>
                    )}
                    <Link to={p.to} className="a-btn a-sm">Edit</Link>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default CmsOverviewPage;
