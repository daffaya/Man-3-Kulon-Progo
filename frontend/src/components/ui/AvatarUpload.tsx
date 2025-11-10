// frontend/src/components/ui/AvatarUpload.tsx
import React, { useState, useRef } from "react";
import { Camera, X, Loader2, User } from "lucide-react";
import userApi from "../../api/userApi";

interface AvatarUploadProps {
  currentAvatar: string | null;
  onAvatarChange: (avatar: string | null) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      console.error("Please select an image file");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      console.error("File size must be less than 15MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const response = await userApi.uploadAvatar(file);
      // Pastikan URL avatar lengkap
      const backendUrl =
        import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";
      const fullAvatarUrl = response.avatar.startsWith("http")
        ? response.avatar
        : `${backendUrl}${response.avatar}`;
      onAvatarChange(fullAvatarUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setPreviewUrl(currentAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setPreviewUrl(null);
    try {
      await userApi.updateAvatarByUrl("");
      onAvatarChange(null);
    } catch (error) {
      console.error("Error removing avatar:", error);
      setPreviewUrl(currentAvatar);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <div
        className="w-32 h-32 rounded-full overflow-hidden border-4 border-[rgb(var(--color-background))] shadow-lg group cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-[rgb(var(--color-semi-background))] flex items-center justify-center transition-colors duration-300 group-hover:bg-[rgb(var(--color-secondary-hover))]">
            <User
              size={48}
              className="text-[rgb(var(--color-secondary))] transition-colors duration-300 group-hover:text-[rgb(var(--color-foreground))]"
            />
          </div>
        )}

        <div
          className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <Camera
            size={32}
            className="text-white transform scale-0 group-hover:scale-100 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="absolute bottom-0 right-0 flex space-x-1">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="bg-[rgb(var(--color-accent))] text-white rounded-full p-2.5 shadow-lg hover:bg-[rgb(var(--color-hover))] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent),0.5)] focus:ring-offset-2 disabled:opacity-50 transform hover:scale-110"
          aria-label="Upload avatar"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Camera size={16} />
          )}
        </button>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="bg-[rgb(var(--color-error))] text-white rounded-full p-2.5 shadow-lg hover:bg-[rgb(var(--color-error)),0.9] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-error)),0.5] focus:ring-offset-2 disabled:opacity-50 transform hover:scale-110"
            aria-label="Remove avatar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center text-white">
            <Loader2 size={32} className="animate-spin mb-2" />
            <div className="text-sm font-medium">Uploading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
