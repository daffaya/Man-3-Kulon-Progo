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
 * Defines the shape of the AuthContext value.
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
 * Provides authentication state and methods to its children.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  /**
   * Logs in a user by saving credentials in state and localStorage.
   */
  const login = (userData: User, authToken: string) => {
    setIsLoggedIn(true);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /**
   * Logs out the current user and clears state and localStorage.
   */
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  /**
   * Updates user profile
   */
  const updateUserProfile = async (profileData: { full_name: string }) => {
    try {
      const updatedUser = await userApi.updateUserProfile(profileData);
      setUser(updatedUser);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  /**
   * Updates user avatar
   */
  const updateUserAvatar = (avatar: string | null) => {
    if (user) {
      const updatedUser = { ...user, avatar };
      setUser(updatedUser);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  /**
   * Refreshes user profile from API
   */
  const refreshUserProfile = async () => {
    try {
      const userData = await userApi.getUserProfile();
      setUser(userData);
      setIsLoggedIn(true);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      // If token is invalid, logout
      logout();
    }
  };

  /**
   * Initializes authentication state from localStorage on mount.
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

        // Refresh user profile to get latest data
        refreshUserProfile();
      } catch {
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
      {!isLoadingAuth && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 * @throws If used outside of AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
