/**
 * @fileoverview Authentication context provider for managing user authentication state.
 * This context provides authentication state and methods for login, logout, and profile updates.
 * It persists authentication data in localStorage and handles token management.
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
  token: string | null;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUserProfile: (profileData: { full_name: string }) => Promise<void>;
  updateUserAvatar: (avatar: string | null) => void;
  refreshUserProfile: () => Promise<void>;
  isLoadingAuth: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages authentication state and provides it to child components.
 * Handles user authentication, token management, and profile updates with localStorage persistence.
 * @param {ReactNode} children - Child components that will have access to the auth context.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  /**
   * Ensures that the avatar URL is a complete URL with the backend URL prefix.
   * @param {User | null} user - The user object to process.
   * @returns {User | null} - User object with a complete avatar URL.
   */
  const ensureFullAvatarUrl = useCallback((user: User | null): User | null => {
    if (!user) return null;

    if (user.avatar && !user.avatar.startsWith("http")) {
      const backendUrl =
        import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";
      return {
        ...user,
        avatar: `${backendUrl}${user.avatar}`,
      };
    }

    return user;
  }, []);

  /**
   * Loads user data from the API using the stored token.
   * Updates the user state and localStorage with the fetched data.
   */
  const loadUserData = useCallback(async () => {
    if (token) {
      try {
        const userData = await userApi.getUserProfile();
        const userWithFullUrl = ensureFullAvatarUrl(userData);
        setUser(userWithFullUrl);
        localStorage.setItem("user", JSON.stringify(userWithFullUrl));
      } catch (error) {
        console.error("Failed to load user data:", error);
        logout();
      }
    }
  }, [token, ensureFullAvatarUrl]);

  /**
   * Logs in a user by setting authentication state and storing data in localStorage.
   * @param {User} userData - The user data object.
   * @param {string} authToken - The authentication token.
   */
  const login = useCallback(
    (userData: User, authToken: string) => {
      const userWithFullUrl = ensureFullAvatarUrl(userData);
      setIsLoggedIn(true);
      setUser(userWithFullUrl);
      setToken(authToken);
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userWithFullUrl));
    },
    [ensureFullAvatarUrl]
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
   * Logs out the user by clearing authentication state and localStorage.
   */
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
    []
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
    [user]
  );

  // Effect to load authentication data from localStorage on app initialization
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        const userWithFullUrl = ensureFullAvatarUrl(parsedUser);
        setIsLoggedIn(true);
        setUser(userWithFullUrl);
        setToken(storedToken);
        localStorage.setItem("user", JSON.stringify(userWithFullUrl));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setIsLoadingAuth(false);
  }, [ensureFullAvatarUrl]);

  // Effect to handle unauthorized events by logging out the user
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("Unauthorized event received, logging out...");
      logout();
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [logout]);

  // Effect to load user data when the user is logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      loadUserData();
    }
  }, [isLoggedIn, token, loadUserData]);

  const value: AuthContextValue = {
    isLoggedIn,
    user,
    token,
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
