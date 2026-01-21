import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/ui/stores/auth.store";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider initializes auth state globally on app mount.
 * This ensures isInitialized becomes true BEFORE any ProtectedRoute renders.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
