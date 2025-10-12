// src/lib/api.ts ✅
import axios from "axios";
import { getAuth } from "firebase/auth";

export const api = axios.create({ 
  baseURL: "http://localhost:8000/api"  // 👈 added /api prefix
});

api.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;
  if (user) {
    const idToken = await user.getIdToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});
