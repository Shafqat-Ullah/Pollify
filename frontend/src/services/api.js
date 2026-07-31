import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // sends the httpOnly refresh cookie
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Server unreachable / network failure: surface a readable message and let
    // the caller handle it instead of throwing a cryptic error.
    if (!error.response) {
      if (!error.message) {
        error.message = "Network error. Please check your connection and try again.";
      }
      return Promise.reject(error);
    }

    // Only the refresh endpoint itself is excluded from the retry logic,
    // preventing refresh loops. Everything else (including /auth/me with an
    // expired access token) can trigger a token refresh.
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    if (error.response.status === 401 && !isRefreshCall && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data?.data?.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/register") && !path.startsWith("/verify")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
