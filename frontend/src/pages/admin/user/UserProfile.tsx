import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Key } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import AvatarUpload from "../../../components/ui/AvatarUpload";
import ChangePasswordForm from "../../../components/forms/auth/ChangePasswordForm";
import userApi from "../../../api/userApi";

const UserProfilePage: React.FC = () => {
  const { user, isLoggedIn, updateUserProfile, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // State untuk mengontrol modal dan loading form ubah password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!fullName.trim()) {
        showErrorToast("Nama lengkap tidak boleh kosong");
        return;
      }

      setIsSaving(true);
      try {
        await updateUserProfile({ full_name: fullName.trim() });
        showSuccessToast("Profil berhasil diperbarui");
      } catch (error: any) {
        showErrorToast(error.message || "Gagal menyimpan perubahan");
      } finally {
        setIsSaving(false);
      }
    },
    [fullName, updateUserProfile, showSuccessToast, showErrorToast]
  );

  const handleAvatarChange = useCallback(
    (avatar: string | null) => {
      if (user) {
        updateUserAvatar(avatar);
      }
    },
    [user, updateUserAvatar]
  );

  /**
   * Handler untuk mengubah password.
   * Memanggil API dan menangani status loading serta notifikasi.
   */
  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setIsChangingPassword(true);
    try {
      await userApi.changePassword(data);
      showSuccessToast("Password berhasil diubah");
      setShowPasswordForm(false); // Tutup modal setelah sukses
    } catch (error: any) {
      showErrorToast(error.message || "Gagal mengubah password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isLoggedIn || !user) {
    navigate("/login", { state: { redirectTo: "/atmin/userProfile" } });
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/atmin")}
            className="text-sm text-secondary hover:text-accent flex items-center mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Dashboard
          </button>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
            Profil Saya
          </h1>

          <div className="card p-6 md:p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Kolom Kiri: Avatar dan Info Dasar */}
              <div className="md:col-span-1 flex flex-col items-center text-center">
                <AvatarUpload
                  currentAvatar={user.avatar}
                  onAvatarChange={handleAvatarChange}
                />

                <div className="mt-5 space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {user.full_name || "Nama Lengkap"}
                  </h2>
                  <p className="text-secondary">@{user.username}</p>
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                    {user.role
                      .replace(/_/g, " ")
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                </div>
              </div>

              {/* Kolom Kanan: Form Edit Profil */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Nama Lengkap
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input w-full"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={user.username}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-secondary">
                      Username tidak dapat diubah
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Role
                    </label>
                    <input
                      id="role"
                      type="text"
                      value={user.role.replace(/_/g, " ")}
                      disabled
                      className="form-input w-full bg-semibackground text-secondary capitalize cursor-not-allowed"
                    />
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex justify-between items-center pt-4 border-t border-semibackground">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(true)}
                      className="btn btn-secondary flex items-center"
                    >
                      <Key size={18} className="mr-2" />
                      Ubah Password
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || !fullName.trim()}
                      className="btn btn-primary flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk Form Ubah Password */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <ChangePasswordForm
              onSubmit={handleChangePassword}
              onCancel={() => setShowPasswordForm(false)}
              isLoading={isChangingPassword}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserProfilePage;
