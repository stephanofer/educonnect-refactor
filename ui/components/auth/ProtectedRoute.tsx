import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuthStore, type UserRole } from "@/ui/stores/auth.store";
import { getDashboardPath } from "@/ui/lib/utils";

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
  // Show a consistent loading state instead of null to prevent AnimatePresence issues
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0 && profile) {
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to appropriate dashboard based on user role
      return <Navigate to={getDashboardPath(profile.role)} replace />;
    }
  }

  // User is authenticated and has correct role
  return <>{children}</>;
}
