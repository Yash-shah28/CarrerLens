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
                showSnackbar(errorMessage, 'error');
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

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, register, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};
