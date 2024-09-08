import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import useAuth from "../../hooks/useAuth";

const PrivateRoute = ({ children }) => {
    const { authState } = useAuth();
    const location = useLocation();

    return authState.token ? (
        children
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );

};

export default PrivateRoute;
