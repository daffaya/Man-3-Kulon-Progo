/**
 * @fileoverview CmsLayout — pembungkus semua editor CMS (mockup v3). Memakai shell admin,
 * menyediakan CmsSaveProvider (satu tombol "Simpan Perubahan"), dan header cadangan jika sebuah
 * form belum memakai <CmsPageHeader>.
 */
import React, { useEffect } from "react";
import AdminLayout from "./AdminLayout";
import {
  CmsBackLink,
  CmsSaveBar,
  CmsSaveProvider,
  useCmsSave,
} from "../cms/CmsSave";

interface CmsLayoutProps {
  children: React.ReactNode;
  /** Judul dokumen (tab browser) dan judul header cadangan. */
  title?: string;
}

const FallbackHeader: React.FC<{ title?: string }> = ({ title }) => {
  const ctx = useCmsSave();
  if (!ctx || ctx.headerMounted) return null;
  return (
    <div className="a-hd">
      <div>
        <CmsBackLink />
        {title && <h1 className="a-h1">{title.replace(/^CMS\s*[—-]\s*/i, "")}</h1>}
      </div>
      <CmsSaveBar />
    </div>
  );
};

const CmsLayout: React.FC<CmsLayoutProps> = ({ children, title }) => {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} · Admin MAN 3 Kulon Progo`;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <AdminLayout>
      <CmsSaveProvider>
        <div className="a-pg">
          <FallbackHeader title={title} />
          {children}
        </div>
      </CmsSaveProvider>
    </AdminLayout>
  );
};

export default CmsLayout;
