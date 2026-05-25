/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string | null;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: any) => Promise<void>;
  loginAdmin: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

const isAdminRole = (role?: string | null) => {
  if (!role) {
    return false;
  }

  return ADMIN_ROLES.has(role.toLowerCase());
};

const normalizeUser = (userData: any): User => {
  return {
    id: String(userData?.id ?? ""),
    email: userData?.email ?? "",
    firstName: userData?.firstName || userData?.first_name || "",
    lastName: userData?.lastName || userData?.last_name || "",
    role: userData?.role ?? null,
    permissions: Array.isArray(userData?.permissions) ? userData.permissions : [],
  };
};

const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
};

const saveSession = (
  accessToken: string,
  refreshToken: string | undefined,
  userData: User,
) => {
  localStorage.setItem("accessToken", accessToken);

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }

  localStorage.setItem("authUser", JSON.stringify(userData));
};

const readStoredUser = (): User | null => {
  const rawUser = localStorage.getItem("authUser");
  if (!rawUser) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(rawUser));
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
};

const decodeTokenPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    let payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    while (payloadBase64.length % 4 !== 0) {
      payloadBase64 += "=";
    }

    const payloadString = atob(payloadBase64);
    return JSON.parse(payloadString) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const readUserFromToken = (token: string): User | null => {
  const payload = decodeTokenPayload(token);
  if (!payload) {
    return null;
  }

  const exp = payload.exp;
  if (typeof exp === "number" && Date.now() >= exp * 1000) {
    return null;
  }

  const userId = payload.sub;
  if (!userId) {
    return null;
  }

  return normalizeUser({
    id: String(userId),
    role: typeof payload.role === "string" ? payload.role : null,
  });
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token && token !== "undefined" && token !== "null") {
        const tokenUser = readUserFromToken(token);

        if (!tokenUser) {
          clearSession();
          setUser(null);
          setLoading(false);
          return;
        }

        const storedUser = readStoredUser();
        if (storedUser) {
          setUser({
            ...tokenUser,
            ...storedUser,
            role: storedUser.role ?? tokenUser.role ?? null,
          });
        } else {
          setUser(tokenUser);
          localStorage.setItem("authUser", JSON.stringify(tokenUser));
        }
      } else {
        clearSession();
        setUser(null);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const completeLogin = async (
    requestPromise: Promise<any>,
    redirectPath: string,
    requireAdminRole: boolean,
  ) => {
    const response = await requestPromise;
    const payload = response.data?.data || response.data;
    const accessToken = payload?.accessToken;
    const refreshToken = payload?.refreshToken;
    const userData = payload?.user;

    if (!accessToken || !userData) {
      throw new Error("Invalid response from server");
    }

    const normalizedUser = normalizeUser(userData);

    if (requireAdminRole && !isAdminRole(normalizedUser.role)) {
      throw new Error("This account cannot access admin panel");
    }

    saveSession(accessToken, refreshToken, normalizedUser);
    setUser(normalizedUser);
    router.push(redirectPath);
  };

  const login = async (data: any) => {
    try {
      await completeLogin(authApi.login(data), "/", false);
    } catch (error: any) {
      throw error.response?.data?.message || error.message || "Login failed";
    }
  };

  const loginAdmin = async (data: any) => {
    try {
      await completeLogin(authApi.loginAdmin(data), "/admin", true);
    } catch (error: any) {
      throw (
        error.response?.data?.message ||
        error.message ||
        "Admin login failed"
      );
    }
  };

  const register = async (data: any) => {
    try {
      await authApi.register(data);
      router.push('/login');
    } catch (error: any) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: isAdminRole(user?.role),
        login,
        loginAdmin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
