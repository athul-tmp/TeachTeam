import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/types"; 
import { userService } from "../services/api";
/*
Reference: The Provided Week 3 Tutorial Activity 3 Code 
*/
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // New async login method that authenticates using credentials from database
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    try {
      const loggedInUser = await userService.loginUser(email, password);
      // Check if account blocked
      if (loggedInUser.isBlocked) {
        throw new Error("blocked");
      }

      setUser(loggedInUser);
      
      // Store only essential user data in sessionStorage for session
      sessionStorage.setItem("currentUser", JSON.stringify({
        userID: loggedInUser.userID,
        email: loggedInUser.email,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        role: loggedInUser.role,
        createdAt: loggedInUser.createdAt
      }));

      return true;

    } catch (error) {
      if (error instanceof Error) {
        console.error("Login failed:", error.message);
      } else {
        console.error("Login failed:", error);
      }

      throw error;
      
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setAuthLoading(true);
    setUser(null);
    setTimeout(() => {
      setUser(null);
      sessionStorage.removeItem("currentUser");
      setAuthLoading(false);
    }, 300);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
