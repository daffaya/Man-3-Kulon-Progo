// frontend/src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { User } from "../types/userTypes";
import userApi from "../api/userApi";

/**
 * Represents the structure of the authentication context.
 * Provides user authentication state, token management, and profile operations.
 */
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
 * AuthProvider component
 *
 * Provides authentication-related state and actions to the entire React app via Context API.
 * Handles login, logout, user profile updates, and automatic rehydration from localStorage.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  /**
   * Logs in the user.
   * Stores the user and token in both state and localStorage.
   */
  const login = (userData: User, authToken: string) => {
    setIsLoggedIn(true);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /**
   * Logs out the user.
   * Clears user data and token from both state and localStorage.
   */
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  /**
   * Updates the user's profile information (e.g., full name).
   * Saves the updated user data to state and localStorage.
   */
  const updateUserProfile = async (profileData: { full_name: string }) => {
    try {
      const updatedUser = await userApi.updateUserProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  /**
   * Updates the user's avatar in both state and localStorage.
   * This function does not make an API call — it only updates the local data.
   */
  const updateUserAvatar = (avatar: string | null) => {
    if (user) {
      const updatedUser = { ...user, avatar };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  /**
   * Refreshes the user's profile data by fetching the latest information from the API.
   * If this fails (e.g., due to expired token), we do NOT automatically log out.
   * ProtectedRoute or other components should handle such cases.
   */
  const refreshUserProfile = async () => {
    try {
      const userData = await userApi.getUserProfile();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      // Do not auto-logout here. Let ProtectedRoute handle authentication errors.
    }
  };

  /**
   * Initializes authentication state from localStorage when the app starts.
   * Attempts to rehydrate user and token from previous session.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setIsLoggedIn(true);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setIsLoadingAuth(false);
  }, []);

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
      {/* Wait until authentication state is initialized before rendering children */}
      {!isLoadingAuth && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 * Must be used within an <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
