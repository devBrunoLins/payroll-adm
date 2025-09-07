import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const api = axios.create({ baseURL });

api.interceptors.response.use(
  (res) => {
    console.log('[API OK]', res.config.method?.toUpperCase(), res.status, res.config.url)
    return res
  },
  (err) => {
    const status = err.response?.status
    console.log('[API ERROR]', status, err.config?.url, err.message, err.response?.data)

    // 401 vem aqui, não no success
    if (status === 401) {
      localStorage.removeItem('@Payroll:Token')
      if (window.location.pathname !== '/') window.location.assign('/')
    }

    // CORS/network errors não têm response:
    // err.response === undefined → trate se precisar

    return Promise.reject(err)
  }
);

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

export default api;
