import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const api = axios.create({ baseURL });

api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('@Payroll:Token');
    if (accessToken) {

      config.headers["Authorization"] = `Bearer ${accessToken}`;

      if (config.method && ["post"].includes(config.method)) {
        config.headers["Content-Type"] =
          config.headers["Content-Type"] ?? "application/json";
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.status === 401) {
      localStorage.removeItem("@Payroll:Token");
      window.location.href = "/";
    }
    
    return response
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
