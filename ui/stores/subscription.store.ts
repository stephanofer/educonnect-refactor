import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/ui/lib/supabase";
import type { Plan, SubscriptionWithPlan, PlanTier } from "@/ui/types";

interface SubscriptionState {
  subscription: SubscriptionWithPlan | null;
  plans: Plan[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSubscription: (userId: string) => Promise<void>;
  fetchPlans: () => Promise<void>;
  purchasePlan: (userId: string, planId: string) => Promise<boolean>;
  upgradePlan: (subscriptionId: string, newPlanId: string) => Promise<boolean>;
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<boolean>;
  clearError: () => void;
}

// Plan tier hierarchy for upgrade logic
const TIER_ORDER: Record<PlanTier, number> = {
  basic: 1,
  premium: 2,
  ultra: 3,
};

// Helper to transform Supabase response (plan comes as array from relation)
function transformSubscriptionData(data: unknown): SubscriptionWithPlan | null {
  if (!data) return null;
  
  const rawData = data as Record<string, unknown>;
  const planData = rawData.plan;
  
  // Supabase returns related data as array, we need the first element
  const plan = Array.isArray(planData) ? planData[0] : planData;
  
  if (!plan) return null;
  
  return {
    id: rawData.id as string,
    user_id: rawData.user_id as string,
    plan_id: rawData.plan_id as string,
    status: rawData.status as SubscriptionWithPlan["status"],
    current_period_start: rawData.current_period_start as string,
    current_period_end: rawData.current_period_end as string,
    sessions_remaining: rawData.sessions_remaining as number,
    cancelled_at: rawData.cancelled_at as string | undefined,
    cancel_reason: rawData.cancel_reason as string | undefined,
    plan: plan as Plan,
  };
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  plans: [],
  isLoading: false,
  error: null,

  fetchSubscription: async (userId: string) => {
    if (!isSupabaseConfigured()) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          id,
          user_id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          sessions_remaining,
          cancelled_at,
          cancel_reason,
          plan:plans(
            id,
            name,
            tier,
            price,
            sessions_included,
            features,
            recording_days,
            has_ai_summaries,
            has_priority_booking,
            is_active,
            is_popular
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine for users without subscription
        throw error;
      }

      set({ 
        subscription: transformSubscriptionData(data), 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Error fetching subscription",
        isLoading: false 
      });
    }
  },

  fetchPlans: async () => {
    if (!isSupabaseConfigured()) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;

      set({ plans: data as Plan[], isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Error fetching plans",
        isLoading: false 
      });
    }
  },

  purchasePlan: async (userId: string, planId: string) => {
    if (!isSupabaseConfigured()) return false;
    
    set({ isLoading: true, error: null });
    
    try {
      // Get plan details
      const plans = get().plans;
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        throw new Error("Plan no encontrado");
      }

      // Calculate period end (1 month from now)
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Create subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "active",
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          sessions_remaining: plan.sessions_included,
        })
        .select(`
          id,
          user_id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          sessions_remaining,
          cancelled_at,
          cancel_reason,
          plan:plans(
            id,
            name,
            tier,
            price,
            sessions_included,
            features,
            recording_days,
            has_ai_summaries,
            has_priority_booking,
            is_active,
            is_popular
          )
        `)
        .single();

      if (error) throw error;

      const subscription = transformSubscriptionData(data);
      if (!subscription) {
        throw new Error("Error al procesar la suscripción");
      }

      set({ 
        subscription, 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Error purchasing plan",
        isLoading: false 
      });
      return false;
    }
  },

  upgradePlan: async (subscriptionId: string, newPlanId: string) => {
    if (!isSupabaseConfigured()) return false;
    
    set({ isLoading: true, error: null });
    
    try {
      const { subscription, plans } = get();
      const newPlan = plans.find(p => p.id === newPlanId);
      
      if (!newPlan || !subscription) {
        throw new Error("Plan o suscripción no encontrada");
      }

      // Check if it's actually an upgrade
      const currentTierOrder = TIER_ORDER[subscription.plan.tier];
      const newTierOrder = TIER_ORDER[newPlan.tier];
      
      if (newTierOrder <= currentTierOrder) {
        throw new Error("Solo puedes hacer upgrade a un plan superior");
      }

      // Calculate additional sessions
      const additionalSessions = newPlan.sessions_included - subscription.plan.sessions_included;
      const newSessionsRemaining = subscription.sessions_remaining + additionalSessions;

      // Update subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .update({
          plan_id: newPlanId,
          sessions_remaining: newSessionsRemaining,
        })
        .eq("id", subscriptionId)
        .select(`
          id,
          user_id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          sessions_remaining,
          cancelled_at,
          cancel_reason,
          plan:plans(
            id,
            name,
            tier,
            price,
            sessions_included,
            features,
            recording_days,
            has_ai_summaries,
            has_priority_booking,
            is_active,
            is_popular
          )
        `)
        .single();

      if (error) throw error;

      const updatedSubscription = transformSubscriptionData(data);
      if (!updatedSubscription) {
        throw new Error("Error al procesar la suscripción");
      }

      set({ 
        subscription: updatedSubscription, 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Error upgrading plan",
        isLoading: false 
      });
      return false;
    }
  },

  cancelSubscription: async (subscriptionId: string, reason?: string) => {
    if (!isSupabaseConfigured()) return false;
    
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason || null,
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      set({ subscription: null, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Error cancelling subscription",
        isLoading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
