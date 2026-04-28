/**
 * @fileoverview User profile page component for viewing and editing personal information.
 * This component provides an interface for users to view their profile details,
 * update their full name, change their avatar, and modify their password.
 * It includes form validation, loading states, and appropriate error handling.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Key } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import AvatarUpload from "../../../components/ui/AvatarUpload";
import ChangePasswordForm from "../../../components/forms/auth/ChangePasswordForm";
import userApi from "../../../api/userApi";

/**
 * Page component for viewing and editing user profile information.
 * Provides interface for updating profile details, avatar, and password.
 * Includes form validation, loading states, and user feedback via toast notifications.
 */
const UserProfilePage: React.FC = () => {
  const { user, isLoggedIn, updateUserProfile, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  /**
   * Handles form submission for updating user profile.
   * Validates input, calls API to update profile, and provides user feedback.
   * @param {React.FormEvent} e - The form submission event
   */
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
    [fullName, updateUserProfile, showSuccessToast, showErrorToast],
  );

  /**
   * Handles avatar change by calling the update function from AuthContext.
   * @param {string | null} avatar - The new avatar URL or null to remove avatar
   */
  const handleAvatarChange = useCallback(
    (avatar: string | null) => {
      if (user) {
        updateUserAvatar(avatar);
      }
    },
    [user, updateUserAvatar],
  );

  /**
   * Handles password change by calling the API and updating UI state.
   * Shows appropriate feedback and closes the password form on success.
   * @param {Object} data - Password change data
   * @param {string} data.currentPassword - The current password
   * @param {string} data.newPassword - The new password
   */
  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setIsChangingPassword(true);
    try {
      await userApi.changePassword(data);
      showSuccessToast("Password berhasil diubah");
      setShowPasswordForm(false);
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
              {/* Left Column: Avatar and Basic Info */}
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
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </span>
                </div>
              </div>

              {/* Right Column: Edit Profile Form */}
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

                  {/* Action Buttons */}
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

      {/* Password Change Modal */}
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
