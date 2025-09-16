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
  // tambahkan properti lain sesuai kebutuhan
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
  }) => Promise<{ success: boolean; message?: string }>; // Added register function
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

  // Added register function
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
        // Remove automatic login after registration
        // Just return success status
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
    if (storedToken && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser) as User);
      setToken(storedToken);
    }
    setIsLoadingAuth(false);
  }, []);

  const value: AuthContextValue = {
    isLoggedIn,
    user,
    token,
    login,
    logout,
    register, // Added register to context value
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
