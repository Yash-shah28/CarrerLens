import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSnackbar } from "./SnackbarContext";

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();

    const api = useMemo(() => axios.create({
        baseURL: "/api/v1/users",
        withCredentials: true,
    }), []);

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => {
                if (response.data?.message && (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'delete')) {
                    showSnackbar(response.data.message, 'success');
                }
                return response;
            },
            (error) => {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
                // Don't show snackbar for 401 errors on current-user check as it's expected if not logged in
                if (!(error.response?.status === 401 && error.config.url.includes('/current-user'))) {
                    showSnackbar(errorMessage, 'error');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [showSnackbar, api]);

    const register = async (userData) => {
        try {
            const response = await api.post("/register", userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    };

    const login = async (credentials) => {
        try {
            const response = await api.post("/login", credentials);
            setUser(response.data.data.user);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    };

    const logout = async () => {
        try {
            await api.post("/logout");
            setUser(null);
            showSnackbar("Logged out successfully", "success");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const refreshCurrentUser = async () => {
        try {
            setLoading(true);
            const response = await api.get("/current-user");
            setUser(response.data.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCurrentUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, register, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};
