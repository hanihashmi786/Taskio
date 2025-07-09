import API from "./index";

// Login
export const login = (data) => API.post("accounts/login/", data);

// Signup
export const signup = (data) => API.post("accounts/signup/", data);

// Profile
export const getProfile = () => API.get("accounts/profile/");
export const updateProfile = (data) => API.patch("accounts/profile/", data);

// Logout
export const logout = () => API.post("accounts/logout/");