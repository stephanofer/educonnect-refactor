import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session, Subscription } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/ui/lib/supabase";
import { queryClient } from "@/ui/lib/query-client";

export type UserRole = "student" | "tutor" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  onboarding_completed: boolean;
  phone?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

// Store subscription outside of Zustand to prevent multiple listeners
let authSubscription: Subscription | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      initialize: async () => {
        // Prevent multiple initializations (React Strict Mode calls this twice)
        if (get().isInitialized) {
          return;
        }

        if (!isSupabaseConfigured()) {
          set({ isLoading: false, isInitialized: true });
          return;
        }

        try {
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;

          if (session) {
            set({ user: session.user, session });
            await get().fetchProfile();
          }

          // Cleanup existing subscription if any (safety check)
          if (authSubscription) {
            authSubscription.unsubscribe();
            authSubscription = null;
          }

          // Listen for auth changes - only process meaningful events
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Ignore TOKEN_REFRESHED and other non-meaningful events to prevent
            // unnecessary re-renders when switching browser tabs
            if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
              return;
            }
            
            // Only process actual auth state changes
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
              set({ user: session?.user ?? null, session });
              
              if (session) {
                await get().fetchProfile();
              } else {
                set({ profile: null });
              }
            }
          });

          // Store subscription for potential cleanup
          authSubscription = subscription;

          set({ isLoading: false, isInitialized: true });
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ isLoading: false, isInitialized: true, error: "Error initializing auth" });
        }
      },

      signUp: async (email, password, fullName, role) => {
        if (!isSupabaseConfigured()) {
          return { success: false, error: "Supabase not configured" };
        }

        set({ error: null });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: role,
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            set({ user: data.user, session: data.session });
            await get().fetchProfile();
          }

          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error creating account";
          set({ error: message });
          return { success: false, error: message };
        }
      },

      signIn: async (email, password) => {
        if (!isSupabaseConfigured()) {
          return { success: false, error: "Supabase not configured" };
        }

        set({ error: null });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({ user: data.user, session: data.session });
          await get().fetchProfile();

          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error signing in";
          set({ error: message });
        return { success: false, error: message };
      }
    },

    signOut: async () => {
        set({ isLoading: true });

        try {
          if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
          }
          // Clear TanStack Query cache to prevent stale data
          queryClient.clear();
          set({ user: null, session: null, profile: null, isLoading: false });
        } catch (error) {
          console.error("Sign out error:", error);
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        const { user } = get();
        if (!user || !isSupabaseConfigured()) return;

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          set({ profile: data as Profile });
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "educonnect-auth",
      partialize: (_state) => ({
        // Only persist minimal data, session will be refreshed on init
      }),
    }
  )
);
