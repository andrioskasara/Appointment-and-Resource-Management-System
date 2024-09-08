import React, { createContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {getUser, login} from '../api/services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
    });

    const loginUser = async (credentials) => {
        try {
            const { access_token } = await login(credentials);
            if (access_token) {
                localStorage.setItem('token', access_token);
                const decodedToken = jwtDecode(access_token);
                const userId = decodedToken.sub;
                const user = await getUser(userId);
                localStorage.setItem('user', JSON.stringify(user));
                console.log(user)
                setAuthState({ token: access_token, user });
            } else {
                console.error("Login failed: Token is undefined.");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ token: null, user: null });
    };

    return (
        <AuthContext.Provider value={{ authState, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
