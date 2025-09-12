import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

export interface User {
  username: string;
  // tambahkan properti lain sesuai kebutuhan
}

interface AuthContextValue {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null; // Tambahkan properti token
  login: (userData: User, authToken: string) => void;
  logout: () => void;
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
  const [token, setToken] = useState<string | null>(null); // State untuk token
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const login = (userData: User, authToken: string) => {
    setIsLoggedIn(true);
    setUser(userData);
    setToken(authToken); // Set token saat login
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null); // Hapus token saat logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser) as User);
      setToken(storedToken); // Ambil token dari localStorage saat inisialisasi
    }

    setIsLoadingAuth(false);
  }, []);

  const value: AuthContextValue = {
    isLoggedIn,
    user,
    token, // Sertakan token dalam value context
    login,
    logout,
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
