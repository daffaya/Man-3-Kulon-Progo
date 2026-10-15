/**
 * @fileoverview Halaman edit artikel — memuat artikel lalu menampilkan editor (mockup v2).
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import ArticleForm from "../../../components/forms/ArticleForm";
import { useArticles } from "../../../contexts/ArticleContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { invalidateAdminSummary } from "../../../hooks/useAdminSummary";
import articleApi from "../../../api/articleApi";
import type { Article, ArticleFormData } from "../../../types/articleTypes";

/** Roles that are permitted to edit articles. */
export const ALLOWED_ROLES = ["jurnalis", "super_admin"] as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateArticle } = useArticles();
  const { user } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | undefined>();

  const allowed = !!user && (ALLOWED_ROLES as readonly string[]).includes(user.role);

  useEffect(() => {
    if (!id || !UUID_RE.test(id)) {
      setLoadError("ID artikel tidak valid.");
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setLoadError(null);
    articleApi
      .getArticleById(id)
      .then((a) => alive && setArticle({ ...a, coverImage: a.coverImage || "" }))
      .catch(() => alive && setLoadError("Gagal memuat artikel."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (user && !allowed) navigate("/atmin", { replace: true });
  }, [user, allowed, navigate]);

  const handleSubmit = async (
    formData: ArticleFormData,
    file?: File,
  ): Promise<boolean> => {
    if (!id) return false;
    setSaving(true);
    try {
      await updateArticle(id, formData, file);
      invalidateAdminSummary();
      showSuccessToast(
        formData.published ? "Artikel berhasil diperbarui!" : "Draf berhasil disimpan!",
      );
      if (formData.published) navigate("/atmin/articles");
      return true;
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Gagal memperbarui artikel");
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadError || !article) {
    return (
      <AdminLayout>
        <div className="a-pg">
          <div className="a-cd">
            <div className="a-em">
              {loading ? <Loader2 className="animate-spin" /> : <AlertTriangle />}
              <b>{loading ? "Memuat artikel…" : loadError ?? "Artikel tidak ditemukan."}</b>
              {!loading && (
                <Link to="/atmin/articles" className="a-btn" style={{ marginTop: 12 }}>
                  Kembali ke daftar artikel
                </Link>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ArticleForm article={article} onSubmit={handleSubmit} isLoading={saving} />
    </AdminLayout>
  );
};

export default EditArticle;
