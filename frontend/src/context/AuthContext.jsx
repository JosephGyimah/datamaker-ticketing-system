import { createContext, useContext, useMemo, useState } from "react";
import {
  clearCurrentUser,
  getCurrentUser,
  removeAuthToken,
  setAuthToken,
  setCurrentUser,
} from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  const login = (token, userInfo) => {
    setAuthToken(token);
    setCurrentUser(userInfo);
    setUser(userInfo);
  };

  const logout = () => {
    removeAuthToken();
    clearCurrentUser();
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
