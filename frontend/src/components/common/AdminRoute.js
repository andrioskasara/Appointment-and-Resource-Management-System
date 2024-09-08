import React from 'react';
import { Navigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';

const AdminRoute = ({ children }) => {
    const { user } = useUser();

    return user && user.role === 'admin' ? (
        children
    ) : (
        <Navigate to="/" replace />
    );
};

export default AdminRoute;