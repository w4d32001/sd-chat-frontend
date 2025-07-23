import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://sd-chat-backend.onrender.com/api",
  withCredentials: true,
});
