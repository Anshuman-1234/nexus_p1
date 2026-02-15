import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        // credentials: { role, regNo, password, librarianPassword, adminPassword }
        const response = await api.post('/login', credentials);
        const { user: userData, success } = response.data;

        if (success && userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            // No token handling as backend doesn't use JWT
        }
        return response.data;
    };

    const register = async (username, email, password) => {
        const response = await api.post('/register', { username, email, password });
        return response.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // localStorage.removeItem('token'); // Not used
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
