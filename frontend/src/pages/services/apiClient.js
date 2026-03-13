import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000", // backend URL
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// attach token automatically
apiClient.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("userToken");
  const superAdminToken = localStorage.getItem("superAdminToken");
  const adminToken = localStorage.getItem("adminToken")

  const token = userToken || superAdminToken || adminToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// global error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default apiClient;
