import axios from "axios";

const base = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const api = axios.create({
  baseURL: `${base}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

export default api;
