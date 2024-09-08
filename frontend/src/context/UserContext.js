import React, { createContext, useState, useEffect } from 'react';
import useAuth from "../hooks/useAuth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { authState } = useAuth();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData && userData.id) {
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setUser(null);
            }
        };

        fetchUser();
    }, [authState]);

    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
};
