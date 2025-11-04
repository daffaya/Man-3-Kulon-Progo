// frontend/src/pages/admin/user/UserProfile.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ChevronLeft } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import AvatarUpload from "../../../components/ui/AvatarUpload";

const UserProfilePage: React.FC = () => {
  const { user, isLoggedIn, updateUserProfile, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [fullName, setFullName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log("UserProfilePage: User changed:", user);
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!fullName.trim()) return;

      setIsSaving(true);
      try {
        console.log(
          "UserProfilePage: Submitting form with fullName:",
          fullName
        );
        await updateUserProfile({
          full_name: fullName.trim(),
        });
        showSuccessToast("Profil berhasil diperbarui");
        console.log("UserProfilePage: Profile update successful");
      } catch (error) {
        console.error("UserProfilePage: Error updating profile:", error);
        showErrorToast((error as Error).message || "Terjadi kesalahan");
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

  if (!isLoggedIn || !user) return null;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/atmin")}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronLeft className="h-5 w-5 mr-1.5" />
            Kembali ke admin dashboard
          </button>
          <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900 dark:text-white">
            Profil Saya
          </h1>

          <div className="bg-background dark:bg-semibackground rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="md:w-1/3 flex flex-col items-center">
                <AvatarUpload
                  currentAvatar={user.avatar}
                  onAvatarChange={handleAvatarChange}
                />
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user.full_name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    @{user.username}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-accent/10 text-accent">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="md:w-2/3">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value || "")}
                      className="form-input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={user.username || ""}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Username tidak dapat diubah
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={user.role || ""}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                      disabled={isSaving}
                    >
                      <Save size={16} className="mr-2" />
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserProfilePage;
