import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRoles }) => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role"); // Get user role from storage

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If the user's role is not in the list of allowed roles, redirect to home
    if (!requiredRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

