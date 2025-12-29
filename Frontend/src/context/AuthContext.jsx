import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider: initAuth starting, token:", token);
        const initAuth = async () => {
            console.log("AuthProvider: initAuth starting, token:", token);
            if (token) {
                try {
                    // Verify token or get user profile if endpoint exists
                    // For now, assuming token is valid if present, or backend will reject 401 on calls
                    // Ideally: const res = await api.get('/me'); setUser(res.data.user);

                    // Placeholder user data if no /me endpoint
                    // In a real app, decode JWT or fetch user
                    if (!user) {
                        // Try to decode or just set a basic user object from storage if you saved it
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) setUser(JSON.parse(storedUser));
                    }
                } catch (err) {
                    console.error("Auth check failed", err);
                    logout();
                }
            }
            console.log("AuthProvider: setting loading to false");
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const { token: newToken, user: userData } = response.data; // Adjust based on backend response structure

        // Fallback if backend only returns token
        const userToSave = userData || { username: email.split('@')[0], email };

        setToken(newToken);
        setUser(userToSave);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userToSave));
        return response.data;
    };

    const register = async (username, email, password) => {
        const response = await api.post('/register', { username, email, password });
        return response.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
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
