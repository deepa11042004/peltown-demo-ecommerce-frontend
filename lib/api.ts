/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_BASE_URL = "/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
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

export const categoryApi = {
  getTree: (params?: { status?: "active" | "inactive" }) =>
    api.get("/v1/categories/tree", { params }),
};

export const uploadApi = {
  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/admin/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;
