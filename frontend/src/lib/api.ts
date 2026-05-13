"use client";

import axios from "axios";

export const api = axios.create({
  // Railway backend base URL (set NEXT_PUBLIC_API_URL in prod). Fallback keeps local dev working.
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ?? "https://promanage-production-4d68.up.railway.app/api",


  withCredentials: true
});


let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("tasknest_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);

    const url = original.url || "";
    const isRefreshEndpoint = url.includes("/auth/refresh");

    if (error.response?.status !== 401 || original._retry || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = api
        .post("/auth/refresh")
        .then((res) => {
          const token = res.data.accessToken as string;
          sessionStorage.setItem("tasknest_access_token", token);
          return token;
        })
        .catch(() => {
          sessionStorage.removeItem("tasknest_access_token");
          sessionStorage.removeItem("tasknest_user");
          return Promise.reject(error);
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    if (!refreshPromise) return Promise.reject(error);

    try {
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      return Promise.reject(error);
    }
  }
);
