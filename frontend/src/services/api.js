import axios from "axios";

const API = axios.create({ baseURL: "https://your-backend-url.com" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const login = (credentials) => API.post("/auth/login", credentials);
export const register = (user) => API.post("/auth/register", user);
export const sendSOS = (data) => API.post("/sos", data);
export const getUserDetails = () => API.get("/auth/me");
export const addEmergencyContact = (userId, contact) =>
  API.post("/auth/add-contact", { userId, contact });
export const deleteEmergencyContact = (userId, contactId) =>
  API.post("/auth/delete-contact", { userId, contactId });
export const verifyEmergencyContact = (userId, phone, code) =>
  API.post("/auth/verify-contact", { userId, phone, code });
