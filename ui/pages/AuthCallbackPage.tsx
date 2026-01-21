import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/ui/lib/supabase";
import { useAuthStore } from "@/ui/stores/auth.store";
import { getDashboardPath } from "@/ui/lib/utils";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured");
        return;
      }

      try {
        // Get the session from the URL hash
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          throw authError;
        }

        if (data.session) {
          // Fetch user profile to determine redirect
          await fetchProfile();
          
          const profile = useAuthStore.getState().profile;
          navigate(getDashboardPath(profile?.role), { replace: true });
        } else {
          // No session found, redirect to login
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleAuthCallback();
  }, [navigate, fetchProfile]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-destructive text-center">
          <p className="text-lg font-medium">Error de autenticacion</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-primary hover:underline"
        >
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Completando autenticacion...</p>
    </div>
  );
}
