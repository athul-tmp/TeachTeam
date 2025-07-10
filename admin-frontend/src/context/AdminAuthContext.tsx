import React, { createContext, useContext, useEffect, useState } from "react";
import { Admin, adminService } from "../services/api";

interface AdminAuthContextType {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  authLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem("currentAdmin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    try {
      const loggedInAdmin = await adminService.adminLogin(username, password);

      if (!loggedInAdmin) throw new Error("Invalid credentials");

      setAdmin(loggedInAdmin);
      sessionStorage.setItem("currentAdmin", JSON.stringify({
        adminID: loggedInAdmin.adminID,
        username: loggedInAdmin.username,
      }));

      return true;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setAdmin(null);
      sessionStorage.removeItem("currentAdmin");
      setAuthLoading(false);
    }, 300);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, authLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
