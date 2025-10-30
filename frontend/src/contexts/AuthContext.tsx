// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

/**
 * Represents a user object in the authentication context.
 */
export interface User {
  username: string;
  role: string;
}

/**
 * Defines the shape of the AuthContext value.
 */
interface AuthContextValue {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  register: (userData: {
    username: string;
    password: string;
    role: string;
  }) => Promise<{ success: boolean; message?: string }>;
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
   * Registers a new user by calling the backend API.
   * @param userData - The registration details for the new user.
   * @returns An object indicating success and an optional message.
   */
  const register = async (userData: {
    username: string;
    password: string;
    role: string;
  }) => {
    const BACKEND_API_URL =
      import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
    } catch {
      return {
        success: false,
        message: "Terjadi kesalahan saat menghubungi server.",
      };
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
    register,
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
