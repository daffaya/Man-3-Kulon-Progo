/**
 * @fileoverview Authentication context provider for managing user authentication state.
 * This context provides authentication state and methods for login, logout, and profile updates
 */

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
} from "react";
import { User } from "../types/userTypes";
import userApi from "../api/userApi";

interface AuthContextValue {
  isLoggedIn: boolean;
  user: User | null;
  /**
   * @deprecated AUDIT-011: the JWT is no longer exposed to JS (httpOnly
   * cookie instead) — this is always null now. Kept only so existing call
   * sites that destructure `token` for an `Authorization: Bearer ...`
   * header keep compiling; that header is harmless dead weight once null
   * (the backend authenticates via the cookie instead).
   */
  token: string | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: { full_name: string }) => Promise<void>;
  updateUserAvatar: (avatar: string | null) => void;
  refreshUserProfile: () => Promise<void>;
  isLoadingAuth: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

/**
 * Provider component that manages authentication state and provides it to child components.
 * @param {ReactNode} children - Child components that will have access to the auth context.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  /**
   * Ensures that the avatar URL is a complete URL with the backend URL prefix.
   * @param {User | null} user - The user object to process.
   * @returns {User | null} - User object with a complete avatar URL.
   */
  const ensureFullAvatarUrl = useCallback((user: User | null): User | null => {
    if (!user) return null;

    if (user.avatar && !user.avatar.startsWith("http")) {
      return {
        ...user,
        avatar: `${BACKEND_URL}${user.avatar}`,
      };
    }

    return user;
  }, []);

  /**
   * Logs in a user by setting authentication state.
   * The JWT itself is never handled here — the backend already set it as
   * an httpOnly cookie in the login response, which the browser stores and
   * sends automatically on future requests. (AUDIT-011)
   * @param {User} userData - The user data object.
   */
  const login = useCallback(
    (userData: User) => {
      const userWithFullUrl = ensureFullAvatarUrl(userData);
      setIsLoggedIn(true);
      setUser(userWithFullUrl);
      localStorage.setItem("user", JSON.stringify(userWithFullUrl));
    },
    [ensureFullAvatarUrl],
  );

  /**
   * Refreshes the user profile data from the API.
   * Updates the user state and localStorage with the latest data.
   */
  const refreshUserProfile = useCallback(async () => {
    try {
      const userData = await userApi.getUserProfile();
      const userWithFullUrl = ensureFullAvatarUrl(userData);
      setUser(userWithFullUrl);
      localStorage.setItem("user", JSON.stringify(userWithFullUrl));
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  }, [ensureFullAvatarUrl]);

  /**
   * Logs out the user. Since the auth cookie is httpOnly, JS can't delete
   * it directly — a real request to the backend is required to clear it.
   * Local state is cleared regardless of whether that request succeeds, so
   * the user is never stuck "logged in" client-side. (AUDIT-011)
   */
  const logout = useCallback(async () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // clean up any pre-migration leftover

    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to clear session on server:", error);
    }
  }, []);

  /**
   * Updates the user profile data via the API and updates the local state.
   * @param {{ full_name: string }} profileData - The profile data to update.
   */
  const updateUserProfile = useCallback(
    async (profileData: { full_name: string }) => {
      try {
        const updatedUser = await userApi.updateUserProfile(profileData);
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
    },
    [],
  );

  /**
   * Updates the user's avatar URL in the state and localStorage.
   * @param {string | null} avatar - The new avatar URL or null to remove.
   */
  const updateUserAvatar = useCallback(
    (avatar: string | null) => {
      if (user) {
        const updatedUser = { ...user, avatar };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
    [user],
  );

  // AUDIT-011: on app load, show any cached user immediately (fast paint,
  // avoids a flash of "logged out"), then confirm/refresh it with a real
  // cookie-authenticated request. A cached user is a UI convenience only —
  // GET /users/profile succeeding or failing is what actually determines
  // isLoggedIn now, not whatever happens to be sitting in localStorage.
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          const parsedUser = ensureFullAvatarUrl(
            JSON.parse(cachedUser) as User,
          );
          if (!cancelled) {
            setUser(parsedUser);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("Error parsing cached user data:", error);
          localStorage.removeItem("user");
        }
      }

      try {
        const userData = await userApi.getUserProfile();
        const userWithFullUrl = ensureFullAvatarUrl(userData);
        if (!cancelled) {
          setUser(userWithFullUrl);
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(userWithFullUrl));
        }
      } catch {
        // No valid session cookie (missing, expired, or never logged in).
        if (!cancelled) {
          setUser(null);
          setIsLoggedIn(false);
          localStorage.removeItem("user");
        }
      } finally {
        if (!cancelled) setIsLoadingAuth(false);
      }
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [ensureFullAvatarUrl]);

  // Effect to handle unauthorized events by logging out the user
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const value: AuthContextValue = {
    isLoggedIn,
    user,
    token: null, // AUDIT-011: see the deprecated note on the type above
    login,
    logout,
    updateUserProfile,
    updateUserAvatar,
    refreshUserProfile,
    isLoadingAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoadingAuth && children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextValue} - The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
