// frontend/src/contexts/AuthContext.tsx
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Fungsi untuk memastikan URL avatar lengkap
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

  // Fungsi untuk memuat data pengguna dari API
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

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const updateUserProfile = useCallback(
    async (profileData: { full_name: string }) => {
      try {
        console.log(
          "AuthContext: Updating user profile with data:",
          profileData
        );
        const updatedUser = await userApi.updateUserProfile(profileData);
        console.log("AuthContext: Received updated user:", updatedUser);

        // Perbarui state user
        setUser(updatedUser);

        // Perbarui localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        console.log("AuthContext: User profile updated successfully");
      } catch (error) {
        console.error("AuthContext: Error updating user profile:", error);
        throw error;
      }
    },
    []
  );

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

  // Efek untuk memuat data dari localStorage saat aplikasi dimulai
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        // Pastikan URL avatar lengkap
        const userWithFullUrl = ensureFullAvatarUrl(parsedUser);
        setIsLoggedIn(true);
        setUser(userWithFullUrl);
        setToken(storedToken);
        // Perbarui localStorage dengan URL yang lengkap
        localStorage.setItem("user", JSON.stringify(userWithFullUrl));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setIsLoadingAuth(false);
  }, [ensureFullAvatarUrl]);

  // Efek untuk memuat data pengguna saat login
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
