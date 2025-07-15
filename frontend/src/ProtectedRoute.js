import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AccessDenied from "./Components/AccessDenied/AccessDenied";

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
    const { isAuthenticated, role } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return <AccessDenied />;
    }

    return <Component />;
};

export default ProtectedRoute;
