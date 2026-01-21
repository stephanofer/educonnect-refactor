import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/ui/stores/auth.store";
import { useSubscriptionStore } from "@/ui/stores/subscription.store";
import { ChatContainer, useProfesorChat } from "@/ui/features/profesor-chat";
import { NoPlanAccess } from "@/ui/features/library";

export default function ProfesorChatPage() {
  const { user } = useAuthStore();
  const { subscription, isLoading: isLoadingSubscription, fetchSubscription } = useSubscriptionStore();
  
  const {
    messages,
    isLoading: isChatLoading,
    error,
    sendMessage,
    cancelRequest,
    clearMessages,
  } = useProfesorChat();

  // Fetch subscription on mount if not already loaded
  useEffect(() => {
    if (user?.id && !subscription) {
      fetchSubscription(user.id);
    }
  }, [user?.id, subscription, fetchSubscription]);

  // Loading state
  if (isLoadingSubscription) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Check for active plan
  const hasActivePlan = subscription?.status === "active";

  if (!hasActivePlan) {
    return (
      <NoPlanAccess
        title="Profesor EduBot - Solo para Suscriptores"
        description="Accede a nuestro asistente de IA para resolver tus dudas académicas, obtener explicaciones detalladas y mejorar tu aprendizaje."
      />
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)]">
      <ChatContainer
        messages={messages}
        isLoading={isChatLoading}
        error={error}
        onSendMessage={sendMessage}
        onCancelRequest={cancelRequest}
        onClearMessages={clearMessages}
      />
    </div>
  );
}
