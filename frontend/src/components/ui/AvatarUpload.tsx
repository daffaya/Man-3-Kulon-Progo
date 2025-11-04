import React, { useState, useRef } from "react";
import { Camera, Link as LinkIcon, X, RefreshCw } from "lucide-react";
import userApi from "../../api/userApi";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "./Toast";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (avatar: string | null) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
}) => {
  const { updateUserAvatar, user } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        setToast({
          message: "Only JPG, JPEG, PNG, and SVG files are allowed",
          type: "error",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setToast({
          message: "File size must be less than 10MB",
          type: "error",
        });
        return;
      }

      setIsUploading(true);
      try {
        const response = await userApi.uploadAvatar(file);
        setAvatar(response.avatar);
        onAvatarChange(response.avatar);
        updateUserAvatar(response.avatar);
        setToast({ message: "Avatar updated successfully", type: "success" });
      } catch (error) {
        setToast({ message: (error as Error).message, type: "error" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl.trim()) return;

    setIsUploading(true);
    try {
      const response = await userApi.updateAvatarByUrl(avatarUrl);
      setAvatar(response.avatar);
      onAvatarChange(response.avatar);
      updateUserAvatar(response.avatar);
      setToast({ message: "Avatar updated successfully", type: "success" });
      setShowUrlInput(false);
      setAvatarUrl("");
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    try {
      const defaultAvatar = null;
      setAvatar(defaultAvatar);
      onAvatarChange(defaultAvatar);
      updateUserAvatar(defaultAvatar);
      setToast({ message: "Avatar removed", type: "success" });
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-semibackground rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-auto">
      <div className="relative mb-4">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
          {avatar ? (
            <img
              src={
                avatar.startsWith("http")
                  ? avatar
                  : `${import.meta.env.VITE_BACKEND_API_URL}${avatar}`
              }
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-4xl text-gray-500 dark:text-gray-400">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-full p-2 shadow transition-colors"
          disabled={isUploading}
          title="Upload new avatar"
        >
          {isUploading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Camera size={16} />
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg, image/jpg, image/png, image/svg+xml"
        />
      </div>

      <div className="flex space gap-2">
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading}
        >
          <LinkIcon size={16} className="mr-1.5" />
          Use URL
        </button>

        {avatar && (
          <button
            onClick={handleRemoveAvatar}
            className="px-4 py-2 text-sm font-medium bg-red-500 dark:bg-red-600 text-white dark:text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            <X size={16} className="mr-1.5" />
            Remove
          </button>
        )}
      </div>

      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="mt-4 w-full">
          <div className="flex">
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Enter avatar URL"
              className="flex-grow px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-medium rounded-r-md transition-colors"
              disabled={isUploading}
            >
              {isUploading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AvatarUpload;
