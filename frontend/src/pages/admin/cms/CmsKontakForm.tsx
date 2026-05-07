/**
 * @fileoverview CmsKontakForm — CMS editor for contact page.
 *
 * Section editable:
 * - content: address, phone, email, whatsapp, maps_embed_url
 *
 * Route: /atmin/cms/kontak
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, Mail, MessageCircle, Map } from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";
import {
  SectionCard,
  Field,
  saveSection,
  PageLoadingSpinner,
  CmsPageHeader,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface KontakContent {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  maps_embed_url: string;
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * CmsKontakForm — CMS editor for contact page.
 * Accessible only to super_admin.
 */
const CmsKontakForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [content, setContent] = useState<KontakContent>({
    address: "",
    phone: "",
    email: "",
    whatsapp: "",
    maps_embed_url: "",
  });

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/kontak" } });
      return;
    }
    if (user?.role !== "super_admin") {
      showErrorToast("Hanya Super Admin yang dapat mengakses halaman ini.");
      navigate("/atmin");
    }
  }, [isLoadingAuth, isLoggedIn, user, navigate, showErrorToast]);

  // ── Fetch current data ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch("/cms/kontak/content");
        if (data) setContent(data);
      } catch {
        showErrorToast("Gagal memuat data kontak.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (!isLoadingAuth && isLoggedIn && user?.role === "super_admin") {
      fetchData();
    }
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("kontak", "content", content);
      showSuccessToast("Informasi kontak berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan informasi kontak.");
      throw new Error("failed");
    } finally {
      setSaving(false);
    }
  }, [content, showSuccessToast, showErrorToast]);

  const update = (field: keyof KontakContent, value: string) =>
    setContent((prev) => ({ ...prev, [field]: value }));

  // ── Loading ──
  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Kontak">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Kontak">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Halaman Kontak"
          description="Informasi kontak yang ditampilkan di halaman Kontak dan footer website."
        />

        <SectionCard
          title="Informasi Kontak"
          icon={<Phone size={18} />}
          description="Semua field di bawah akan tampil di halaman Kontak dan beberapa di footer."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <MapPin size={14} className="text-secondary" />
                Alamat Lengkap
              </label>
              <textarea
                value={content.address}
                onChange={(e) => update("address", e.target.value)}
                rows={3}
                className="form-input w-full resize-none"
                placeholder="Jl. Sentolo-Muntilan No.Km. 28, Pantok Wetan..."
              />
            </div>

            {/* Phone */}
            <Field
              label="Nomor Telepon"
              value={content.phone}
              onChange={(v) => update("phone", v)}
              placeholder="0274-2821138"
              hint="Format bebas — ditampilkan apa adanya."
            />

            {/* Email */}
            <Field
              label="Email"
              value={content.email}
              onChange={(v) => update("email", v)}
              type="email"
              placeholder="man3kulonprogo@gmail.com"
            />

            {/* WhatsApp */}
            <Field
              label="WhatsApp (tampilan)"
              value={content.whatsapp}
              onChange={(v) => update("whatsapp", v)}
              placeholder="+62-878-5810-2393"
              hint="Format tampilan untuk publik. Contoh: +62-878-5810-2393"
            />

            {/* Maps embed */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <Map size={14} className="text-secondary" />
                Google Maps Embed URL
              </label>
              <textarea
                value={content.maps_embed_url}
                onChange={(e) => update("maps_embed_url", e.target.value)}
                rows={3}
                className="form-input w-full resize-none font-mono text-xs"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-secondary mt-1">
                Cara ambil URL: Google Maps → Share → Embed a map → salin URL
                dari src="..."
              </p>
            </div>

            {/* Preview maps */}
            {content.maps_embed_url && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Preview Peta:
                </p>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <iframe
                    src={content.maps_embed_url}
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                    title="Preview peta lokasi"
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsKontakForm;
