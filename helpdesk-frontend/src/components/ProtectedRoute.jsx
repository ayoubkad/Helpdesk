import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, userRole } = useAuth();

    // ===== 1. PAS CONNECTÉ =====
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ===== 2. RÔLE NON AUTORISÉ =====
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Rediriger vers le dashboard approprié selon le rôle
        if (userRole === "ADMIN") {
            return <Navigate to="/admin" replace />;
        } else if (userRole === "TECHNICIEN") {
            return <Navigate to="/technician" replace />;
        } else {
            // USER ou rôle inconnu
            return <Navigate to="/dashboard" replace />;
        }
    }

    // ===== 3. ACCÈS AUTORISÉ =====
    return children;
};

export default ProtectedRoute;