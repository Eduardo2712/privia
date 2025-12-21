import axios from "axios";

const axiosInstance = axios.create({
    baseURL: globalThis.window === undefined ? process.env.INTERNAL_URL_API : process.env.NEXT_PUBLIC_URL_API,
    withCredentials: true,
});

export default axiosInstance;
