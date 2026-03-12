import { useAuth } from "@/contexts/AuthContext";
import { Permission } from "@/types/auth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  allowedRoles?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  allowedRoles = [],
  fallbackPath = "/" 
}: ProtectedRouteProps) {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermissions) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}