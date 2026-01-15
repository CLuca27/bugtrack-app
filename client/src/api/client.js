import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // IMPORTANT pt session cookie
  headers: { "Content-Type": "application/json" },
});


