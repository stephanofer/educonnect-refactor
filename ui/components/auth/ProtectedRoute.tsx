import { Navigate, useLocation } from "react-router";
import { useAuthStore, type UserRole } from "@/ui/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const location = useLocation();
  const { user, profile, isLoading } = useAuthStore();

  // AuthProvider guarantees isInitialized is true when this renders.
  // If there's no user and we're not loading, redirect immediately.
  // No more infinite loading state!
  if (!user && !isLoading) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Still loading profile after sign-in (brief moment)
  // This is a very short state, user exists but profile is loading
  if (isLoading) {
    return null; // Or a minimal spinner if preferred
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0 && profile) {
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to appropriate dashboard based on user role
      const roleDashboard = profile.role === "tutor" ? "/tutor/dashboard" : "/dashboard";
      return <Navigate to={roleDashboard} replace />;
    }
  }

  // User is authenticated and has correct role
  return <>{children}</>;
}
