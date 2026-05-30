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
  adminUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  loginAdmin: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  logoutAdmin: () => void;
}

const ADMIN_ROLES = new Set(["admin", "super_admin"]);
const CUSTOMER_ACCESS_TOKEN_KEY = "accessToken";
const CUSTOMER_REFRESH_TOKEN_KEY = "refreshToken";
const CUSTOMER_AUTH_USER_KEY = "authUser";
const ADMIN_ACCESS_TOKEN_KEY = "adminAccessToken";
const ADMIN_REFRESH_TOKEN_KEY = "adminRefreshToken";
const ADMIN_AUTH_USER_KEY = "adminAuthUser";

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

const clearSession = (sessionType: "customer" | "admin") => {
  if (sessionType === "admin") {
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_AUTH_USER_KEY);
    return;
  }

  localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_AUTH_USER_KEY);
};

const saveSession = (
  accessToken: string,
  refreshToken: string | undefined,
  userData: User,
  sessionType: "customer" | "admin",
) => {
  const accessTokenKey = sessionType === "admin" ? ADMIN_ACCESS_TOKEN_KEY : CUSTOMER_ACCESS_TOKEN_KEY;
  const refreshTokenKey = sessionType === "admin" ? ADMIN_REFRESH_TOKEN_KEY : CUSTOMER_REFRESH_TOKEN_KEY;
  const authUserKey = sessionType === "admin" ? ADMIN_AUTH_USER_KEY : CUSTOMER_AUTH_USER_KEY;

  localStorage.setItem(accessTokenKey, accessToken);

  if (refreshToken) {
    localStorage.setItem(refreshTokenKey, refreshToken);
  } else {
    localStorage.removeItem(refreshTokenKey);
  }

  localStorage.setItem(authUserKey, JSON.stringify(userData));
};

const readStoredUser = (storageKey: string): User | null => {
  const rawUser = localStorage.getItem(storageKey);
  if (!rawUser) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(rawUser));
  } catch {
    localStorage.removeItem(storageKey);
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
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const customerToken = localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY);
      if (customerToken && customerToken !== "undefined" && customerToken !== "null") {
        const tokenUser = readUserFromToken(customerToken);

        if (!tokenUser) {
          clearSession("customer");
          setUser(null);
        } else {
          const storedUser = readStoredUser(CUSTOMER_AUTH_USER_KEY);
          const mergedUser = storedUser ? {
            ...tokenUser,
            ...storedUser,
            role: storedUser.role ?? tokenUser.role ?? null,
          } : tokenUser;

          setUser(mergedUser);
          localStorage.setItem(CUSTOMER_AUTH_USER_KEY, JSON.stringify(mergedUser));
        }
      } else {
        clearSession("customer");
        setUser(null);
      }

      const adminToken = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
      if (adminToken && adminToken !== "undefined" && adminToken !== "null") {
        const tokenUser = readUserFromToken(adminToken);

        if (!tokenUser || !isAdminRole(tokenUser.role)) {
          clearSession("admin");
          setAdminUser(null);
        } else {
          const storedUser = readStoredUser(ADMIN_AUTH_USER_KEY);
          const mergedUser = storedUser ? {
            ...tokenUser,
            ...storedUser,
            role: storedUser.role ?? tokenUser.role ?? null,
          } : tokenUser;

          setAdminUser(mergedUser);
          localStorage.setItem(ADMIN_AUTH_USER_KEY, JSON.stringify(mergedUser));
        }
      } else {
        clearSession("admin");
        setAdminUser(null);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const completeLogin = async (
    requestPromise: Promise<any>,
    redirectPath: string,
    requireAdminRole: boolean,
    sessionType: "customer" | "admin",
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

    saveSession(accessToken, refreshToken, normalizedUser, sessionType);
    if (sessionType === "admin") {
      setAdminUser(normalizedUser);
      setUser(null);
    } else {
      setUser(normalizedUser);
      setAdminUser(null);
    }
    router.push(redirectPath);
  };

  const login = async (data: any) => {
    try {
      await completeLogin(authApi.login(data), "/", false, "customer");
    } catch (error: any) {
      throw error.response?.data?.message || error.message || "Login failed";
    }
  };

  const loginAdmin = async (data: any) => {
    try {
      await completeLogin(authApi.loginAdmin(data), "/admin", true, "admin");
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
    clearSession("customer");
    setUser(null);
    router.push('/login');
  };

  const logoutAdmin = () => {
    clearSession("admin");
    setAdminUser(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        loading,
        isAuthenticated: !!user,
        isAdmin: isAdminRole(user?.role || adminUser?.role),
        isAdminAuthenticated: !!adminUser,
        login,
        loginAdmin,
        register,
        logout,
        logoutAdmin,
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
