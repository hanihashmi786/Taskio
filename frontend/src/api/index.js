import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

function getAccessToken() {
  let token = localStorage.getItem("access_token");
  if (!token) {
    token = sessionStorage.getItem("access_token");
  }
  return token;
}

API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
