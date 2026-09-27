// src/api/http.ts

import axios from "axios";

export const http = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("HTTP Error:", error.message);
    return Promise.reject(error);
  }
);