import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "https://sd-chat-backend.onrender.com" : "/api",
  withCredentials: true,
});
