import axios from "axios"

function getAccessToken() {
  let token = localStorage.getItem("access_token");
  if (!token) {
    token = sessionStorage.getItem("access_token");
  }
  return token;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    console.log("API request token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API request headers:", config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("access_token")
      localStorage.removeItem("trello-auth")
      sessionStorage.removeItem("trello-auth")
      localStorage.removeItem("trello-user")
      window.location.href = "/signin"
    }
    return Promise.reject(error)
  },
)

export default api
