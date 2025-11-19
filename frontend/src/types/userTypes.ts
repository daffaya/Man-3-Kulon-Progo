/**
 * Defines the possible roles a user can have within the system.
 */
export type UserRole =
  | "super_admin"
  | "jurnalis"
  | "arsiparis"
  | "guru_bk"
  | "pengelola_bmn"
  | "operator"
  | "kepala_sekolah";

/**
 * Represents a user in the system.
 */
export interface User {
  id: number;
  username: string;
  full_name: string;
  avatar: string | null;
  role: UserRole;
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
  password?: string;
  role: UserRole;
  full_name: string;
}
