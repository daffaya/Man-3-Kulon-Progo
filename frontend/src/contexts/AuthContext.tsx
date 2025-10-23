// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

export interface User {
  username: string;
  role: string;
}

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const login = (userData: User, authToken: string) => {
    console.log("[AuthContext] Login with user:", userData);
    setIsLoggedIn(true);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

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
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (error: any) {
      console.error("Error during registration:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat menghubungi server.",
      };
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("[AuthContext] Initializing auth state");
    console.log(
      "[AuthContext] Token from localStorage:",
      storedToken ? "Present" : "Missing"
    );
    console.log("[AuthContext] User from localStorage:", storedUser);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        console.log("[AuthContext] Parsed user:", parsedUser);

        setIsLoggedIn(true);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error(
          "[AuthContext] Error parsing user from localStorage:",
          error
        );
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
