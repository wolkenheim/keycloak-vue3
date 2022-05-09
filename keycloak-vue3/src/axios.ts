import axios from 'axios';
import {useUserStore} from "@/keycloak/user";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_BACKEND_URL
});

axiosInstance.interceptors.request.use(
    config => {
        const userStore = useUserStore();
        const token = userStore.accessToken
        if (token) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    });

export { axiosInstance };
