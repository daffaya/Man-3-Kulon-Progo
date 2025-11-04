// frontend/src/types/userTypes.ts

/**
 * Represents a user in the system.
 */
export interface User {
  id: number;
  username: string;
  full_name: string;
  avatar: string | null;
  role: string;
  created_at: string;
}

/**
 * Data structure for updating user profile.
 */
export interface UserProfileData {
  full_name: string;
}

/**
 * Data structure for updating user avatar.
 */
export interface UserAvatarData {
  avatar: string;
}

/**
 * Data structure for creating or updating a user.
 */
export interface UserFormData {
  username: string;
  password?: string; // Optional for update
  role: string;
  full_name: string;
}
