import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/authService";
import { setAccessToken } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const { data } = await authService.refresh();
      setAccessToken(data.accessToken);
      const me = await authService.getMe();
      setUser(me.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const accessToken = res.accessToken || res.data?.accessToken;
    const user = res.user || res.data?.user;
    if (accessToken) setAccessToken(accessToken);
    if (user) setUser(user);
    toast.success("Welcome back!");
    return user;
  };

  const register = async (payload) => {
    await authService.register(payload);
    toast.success("Account created! Check your email for the verification code.");
  };

  const logout = async () => {
    await authService.logout().catch(() => {});
    setAccessToken(null);
    setUser(null);
    toast.success("Logged out.");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
