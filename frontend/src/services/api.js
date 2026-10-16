import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT only when an access token exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");

        // Don't attach token to authentication requests
        const isAuthRequest =
            config.url?.includes("/auth/login/") ||
            config.url?.includes("/auth/register/") ||
            config.url?.includes("/auth/token/refresh/");

        if (token && !isAuthRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// Handle expired access tokens
api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        // Don't refresh tokens for login/register requests
        const isAuthRequest =
            originalRequest?.url?.includes("/auth/login/") ||
            originalRequest?.url?.includes("/auth/register/") ||
            originalRequest?.url?.includes("/auth/token/refresh/");

        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            !isAuthRequest
        ) {

            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refresh");

            if (!refreshToken) {

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("username");
                localStorage.removeItem("role");

                window.location.href = "/";

                return Promise.reject(error);
            }

            try {

                const response = await axios.post(
                    "http://127.0.0.1:8000/api/auth/token/refresh/",
                    {
                        refresh: refreshToken,
                    }
                );

                const newAccessToken =
                    response.data.access;

                localStorage.setItem(
                    "access",
                    newAccessToken
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {

                console.error(
                    "Token refresh failed:",
                    refreshError
                );

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("username");
                localStorage.removeItem("role");

                window.location.href = "/";

                return Promise.reject(refreshError);
            }
        }

        // IMPORTANT:
        // Return the original error so Login/Register
        // can display the actual backend message.
        return Promise.reject(error);
    }
);

export default api;