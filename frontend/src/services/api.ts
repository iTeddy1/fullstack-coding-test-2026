import { BACKEND_BASE_URL } from "@/common/config";
import axios from "axios";

const api = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
