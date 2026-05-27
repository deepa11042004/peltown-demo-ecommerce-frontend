/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_BASE_URL = "/api";
const GUEST_ID_STORAGE_KEY = "guestId";
const GUEST_ID_PATTERN = /^guest_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NON_CUSTOMER_ROLES = new Set(["admin", "super_admin", "developer"]);

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

const readRoleFromToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("accessToken");
  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.role !== "string") {
    return null;
  }

  return payload.role.toLowerCase();
};

const readStoredRole = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("authUser");
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { role?: string | null };
    if (typeof parsed.role === "string") {
      return parsed.role.toLowerCase();
    }

    return readRoleFromToken();
  } catch {
    return readRoleFromToken();
  }
};

const isShopperStateRoute = (url?: string) => {
  if (!url) {
    return false;
  }

  const normalized = url.toLowerCase();

  return normalized.startsWith("/v1/wishlist") || normalized.startsWith("/v1/cart");
};

const isShopperMergeRoute = (url?: string) => {
  if (!url) {
    return false;
  }

  const normalized = url.toLowerCase();
  return normalized === "/v1/cart/merge" || normalized === "/v1/wishlist/merge";
};

const buildGuestId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `guest_${crypto.randomUUID()}`;
  }

  const fallback = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

  return `guest_${fallback}`;
};

const getOrCreateGuestId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedGuestId = localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (storedGuestId && GUEST_ID_PATTERN.test(storedGuestId)) {
    return storedGuestId;
  }

  const nextGuestId = buildGuestId();
  localStorage.setItem(GUEST_ID_STORAGE_KEY, nextGuestId);
  return nextGuestId;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  (config) => {
    const guestId = getOrCreateGuestId();
    if (guestId) {
      config.headers["x-guest-id"] = guestId;
    }

    const role = readStoredRole();
    const shouldForceGuestMode =
      isShopperStateRoute(config.url)
      && !isShopperMergeRoute(config.url)
      && role !== "customer";
    const skipAuthorizationForShopperRequest =
      Boolean(
        isShopperStateRoute(config.url)
        && !isShopperMergeRoute(config.url)
        && (shouldForceGuestMode || (role !== null && NON_CUSTOMER_ROLES.has(role))),
      );

    if (shouldForceGuestMode || skipAuthorizationForShopperRequest) {
      config.headers["x-shopping-guest-mode"] = "true";
    } else if (config.headers["x-shopping-guest-mode"]) {
      delete config.headers["x-shopping-guest-mode"];
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (
      !shouldForceGuestMode
      && token
      && token !== "undefined"
      && token !== "null"
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (shouldForceGuestMode && config.headers.Authorization) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken && refreshToken !== "undefined" && refreshToken !== "null") {
          const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh-token`, {
            refreshToken,
          });
          const accessToken = res.data?.data?.accessToken || res.data?.accessToken;

          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
        throw new Error("Refresh token missing or invalid");
      } catch {
        // Refresh token failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
        if (typeof window !== "undefined") {
          const isAdminRoute = window.location.pathname.startsWith("/admin");
          window.location.href = isAdminRoute ? "/admin/login" : "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: any) => api.post("/v1/auth/register", data),
  login: (data: any) => api.post("/v1/auth/login", data),
  loginAdmin: (data: any) => api.post("/v1/auth/admin", data),
  logout: () => api.post("/v1/auth/logout"),
  getMe: () => api.get("/v1/auth/me"),
  changePassword: (data: any) => api.post("/v1/auth/change-password", data),
};

export const productApi = {
  create: (data: any) => api.post("/v1/products", data),
  list: (params?: Record<string, string | number | boolean>) => api.get("/v1/products", { params }),
  getById: (id: string | number) => api.get(`/v1/products/${id}`),
  remove: (id: string | number) => api.delete(`/v1/products/${id}`),
};

export const cartApi = {
  get: () => api.get("/v1/cart"),
  addItem: (data: { productId: number; variantId?: number | null; quantity: number }) =>
    api.post("/v1/cart/items", data),
  updateItem: (id: number, data: { quantity: number }) => api.patch(`/v1/cart/items/${id}`, data),
  removeItem: (id: number) => api.delete(`/v1/cart/items/${id}`),
  clear: () => api.delete("/v1/cart/clear"),
  merge: () => api.post("/v1/cart/merge"),
};

export const wishlistApi = {
  get: () => api.get("/v1/wishlist"),
  addItem: (data: { productId: number; variantId?: number | null }) => api.post("/v1/wishlist/items", data),
  removeItem: (id: number) => api.delete(`/v1/wishlist/items/${id}`),
  merge: () => api.post("/v1/wishlist/merge"),
};

export const categoryApi = {
  getTree: (params?: { status?: "active" | "inactive" }) =>
    api.get("/v1/categories/tree", { params }),
};

type MediaSection = "products" | "variants" | "categories" | "brands" | "users" | "temp";

export const uploadApi = {
  uploadMedia: (section: MediaSection, file: File, baseName?: string) => {
    const formData = new FormData();
    formData.append("file", file);

    if (baseName?.trim()) {
      formData.append("baseName", baseName.trim());
    }

    return api.post(`/v1/media/upload/${section}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadProductImage: (file: File, baseName?: string) => {
    return uploadApi.uploadMedia("products", file, baseName);
  },
};

export default api;
