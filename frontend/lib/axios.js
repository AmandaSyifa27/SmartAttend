import axios from "axios";
// import config from "eslint-config-next/core-web-vitals"; // DIHAPUS: import ini menyebabkan build error karena Next.js mencoba bundle internal ESLint ke client bundle
import Cookies from "js-cookie";

const api = axios.create({
 baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
 const token = Cookies.get("token");
 if (token) {
  config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

api.interceptors.response.use(
 (response) => response,
 (error) => {
  if (error.response?.status === 401) {
   Cookies.remove("token");
   Cookies.remove("user");
   window.location.href = "/login";
  }
  return Promise.reject(error);
 },
);

export default api;
