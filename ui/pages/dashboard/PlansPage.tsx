import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Zap,
  Crown,
  Rocket,
  ArrowRight,
  CreditCard,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Clock,
  RefreshCcw,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import { Progress } from "@/ui/components/shadcn/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/shadcn/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/ui/components/shadcn/alert";
import { useSubscriptionStore } from "@/ui/stores/subscription.store";
import { useAuthStore } from "@/ui/stores/auth.store";
import type { Plan, PlanTier } from "@/ui/types";
import { cn } from "@/ui/lib/utils";

// Plan icons mapping
const PLAN_ICONS: Record<PlanTier, typeof Zap> = {
  basic: Zap,
  premium: Crown,
  ultra: Rocket,
};

// Plan colors mapping
const PLAN_COLORS: Record<PlanTier, string> = {
  basic: "bg-blue-500",
  premium: "bg-primary",
  ultra: "bg-gradient-to-r from-purple-600 to-pink-600",
};

// Plan features for display (fallback if DB doesn't have them)
const PLAN_FEATURES: Record<PlanTier, string[]> = {
  basic: [
    "2 sesiones de 1 hora incluidas",
    "Grabaciones por 7 días",
    "Chat con tutor post-sesión",
    "Soporte por email",
    "Materiales básicos",
  ],
  premium: [
    "5 sesiones de 1 hora incluidas",
    "Resúmenes generados por IA",
    "Chat prioritario 24/7",
    "Plan de estudio personalizado",
    "Materiales premium",
    "Prioridad en reservas",
  ],
  ultra: [
    "10 sesiones de 1 hora incluidas",
    "Todo lo de Premium",
    "Tutor dedicado asignado",
    "Corrección de tareas",
    "Seguimiento académico diario",
    "Eventos exclusivos mensuales",
    "Soporte VIP 24/7",
  ],
};

type PurchaseStep = "idle" | "confirming" | "processing" | "success" | "error";

export default function PlansPage() {
  const { user } = useAuthStore();
  const {
    subscription,
    plans,
    isLoading,
    error,
    fetchSubscription,
    fetchPlans,
    purchasePlan,
    upgradePlan,
    cancelSubscription,
    clearError,
  } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("idle");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
      fetchPlans();
    }
  }, [user?.id, fetchSubscription, fetchPlans]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setPurchaseStep("confirming");
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan || !user?.id) return;

    setPurchaseStep("processing");
    clearError();

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let success: boolean;
    
    if (subscription) {
      // Upgrade existing subscription
      success = await upgradePlan(subscription.id, selectedPlan.id);
    } else {
      // New subscription
      success = await purchasePlan(user.id, selectedPlan.id);
    }

    setPurchaseStep(success ? "success" : "error");
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const success = await cancelSubscription(subscription.id, "Cancelación voluntaria");
    if (success) {
      setShowCancelDialog(false);
    }
  };

  const closeDialog = () => {
    setPurchaseStep("idle");
    setSelectedPlan(null);
  };

  const isUpgrade = (plan: Plan): boolean => {
    if (!subscription) return false;
    const tierOrder: Record<PlanTier, number> = { basic: 1, premium: 2, ultra: 3 };
    return tierOrder[plan.tier] > tierOrder[subscription.plan.tier];
  };

  const isCurrentPlan = (plan: Plan): boolean => {
    return subscription?.plan.tier === plan.tier;
  };

  const isDowngrade = (plan: Plan): boolean => {
    if (!subscription) return false;
    const tierOrder: Record<PlanTier, number> = { basic: 1, premium: 2, ultra: 3 };
    return tierOrder[plan.tier] < tierOrder[subscription.plan.tier];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading && !subscription && plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis Planes</h1>
        <p className="text-muted-foreground mt-1">
          {subscription
            ? "Gestiona tu suscripción actual o mejora tu plan"
            : "Elige el plan que mejor se adapte a tus necesidades"}
        </p>
      </div>

      {/* Current Subscription Card */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center",
                      PLAN_COLORS[subscription.plan.tier]
                    )}
                  >
                    {(() => {
                      const Icon = PLAN_ICONS[subscription.plan.tier];
                      return <Icon className="size-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Plan {subscription.plan.name}
                    </CardTitle>
                    <CardDescription>Tu suscripción actual</CardDescription>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Activo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-background rounded-xl p-4">
                  <Calendar className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima renovación</p>
                    <p className="font-medium">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-background rounded-xl p-4">
                  <CreditCard className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Precio mensual</p>
                    <p className="font-medium">S/ {subscription.plan.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-background rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">Sesiones restantes</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        (subscription.sessions_remaining /
                          subscription.plan.sessions_included) *
                        100
                      }
                      className="h-2 flex-1"
                    />
                    <span className="font-medium text-sm">
                      {subscription.sessions_remaining}/{subscription.plan.sessions_included}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancelar suscripción
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const Icon = PLAN_ICONS[plan.tier];
          const features = plan.features?.length
            ? plan.features
            : PLAN_FEATURES[plan.tier];
          const isCurrent = isCurrentPlan(plan);
          const isUpgradeOption = isUpgrade(plan);
          const isDowngradeOption = isDowngrade(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn("relative", plan.is_popular && "md:-mt-4 md:mb-4")}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white px-4 py-1">
                    Más popular
                  </Badge>
                </div>
              )}

              <Card
                className={cn(
                  "h-full transition-all duration-300 hover:shadow-lg",
                  plan.is_popular && "ring-2 ring-primary shadow-xl",
                  isCurrent && "ring-2 ring-green-500 bg-green-50/50"
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center mb-4",
                      PLAN_COLORS[plan.tier]
                    )}
                  >
                    <Icon className="size-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-sm">S/</span>
                    <span className="text-4xl font-bold">
                      {plan.price.toFixed(2).split(".")[0]}
                    </span>
                    <span className="text-lg">
                      .{plan.price.toFixed(2).split(".")[1]}
                    </span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="size-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled
                    >
                      <CheckCircle2 className="size-4 mr-2" />
                      Plan actual
                    </Button>
                  ) : isDowngradeOption ? (
                    <Button className="w-full" variant="outline" disabled>
                      No disponible
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.is_popular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {isUpgradeOption ? "Hacer upgrade" : "Elegir plan"}
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Refund Guarantee */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-background to-teal-50 border-emerald-200/60">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/30 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100/20 rounded-full translate-y-1/2 -translate-x-1/4" />

          <CardHeader className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <ShieldCheck className="size-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Garantia de satisfaccion</CardTitle>
                <CardDescription>Tu tranquilidad es nuestra prioridad</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              Creemos en la calidad de nuestros tutores. Si despues de tu sesion
              sientes que el tutor no cumplio tus expectativas, te devolvemos el
              100% de tu sesion. Sin preguntas, sin complicaciones.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-emerald-100">
                <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="size-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-xs">Solicita en 24 horas</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Despues de la sesion para pedir tu devolucion
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-emerald-100">
                <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <RefreshCcw className="size-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-xs">Devolucion completa</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reembolso a tu saldo o metodo de pago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-emerald-100">
                <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="size-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-xs">Sin complicaciones</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Contactanos por chat o email al instante
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>+500 devoluciones procesadas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>Tiempo promedio: menos de 2 horas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>98% de satisfaccion post-resolucion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Purchase Dialog */}
      <Dialog open={purchaseStep !== "idle"} onOpenChange={() => closeDialog()}>
        <DialogContent className="sm:max-w-md" showCloseButton={purchaseStep === "confirming"}>
          <AnimatePresence mode="wait">
            {purchaseStep === "confirming" && selectedPlan && (
              <motion.div
                key="confirming"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DialogHeader>
                  <DialogTitle>
                    {subscription ? "Confirmar upgrade" : "Confirmar compra"}
                  </DialogTitle>
                  <DialogDescription>
                    Estás a punto de {subscription ? "mejorar a" : "adquirir"} el plan{" "}
                    <span className="font-semibold text-foreground">
                      {selectedPlan.name}
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = PLAN_ICONS[selectedPlan.tier];
                        return (
                          <div
                            className={cn(
                              "size-10 rounded-lg flex items-center justify-center",
                              PLAN_COLORS[selectedPlan.tier]
                            )}
                          >
                            <Icon className="size-5 text-white" />
                          </div>
                        );
                      })()}
                      <div>
                        <p className="font-medium">Plan {selectedPlan.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPlan.sessions_included} sesiones/mes
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold">
                      S/ {selectedPlan.price.toFixed(2)}
                    </p>
                  </div>

                  {subscription && (
                    <Alert>
                      <AlertTriangle className="size-4" />
                      <AlertTitle>Información del upgrade</AlertTitle>
                      <AlertDescription>
                        Se te agregarán{" "}
                        {selectedPlan.sessions_included -
                          subscription.plan.sessions_included}{" "}
                        sesiones adicionales a tu saldo actual.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Pago simulado (sin cargo real)</p>
                    <p>• Puedes cancelar en cualquier momento</p>
                    <p>• Acceso inmediato a todas las funciones</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmPurchase}>
                    <CreditCard className="size-4 mr-2" />
                    Confirmar pago
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {purchaseStep === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 text-center"
              >
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="size-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Procesando pago...</h3>
                <p className="text-sm text-muted-foreground">
                  Por favor espera mientras confirmamos tu transacción
                </p>
              </motion.div>
            )}

            {purchaseStep === "success" && selectedPlan && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="size-8 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">¡Pago exitoso!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Tu plan {selectedPlan.name} ha sido activado correctamente.
                  Ya puedes disfrutar de todas las funciones.
                </p>
                <Button onClick={closeDialog} className="w-full">
                  Continuar
                </Button>
              </motion.div>
            )}

            {purchaseStep === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center"
              >
                <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="size-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error en el pago</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {error || "No pudimos procesar tu pago. Por favor intenta nuevamente."}
                </p>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={closeDialog} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmPurchase} className="flex-1">
                    Reintentar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cancelar suscripción?</DialogTitle>
            <DialogDescription>
              Tu suscripción se cancelará y perderás acceso a las funciones
              premium al final del período actual.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription>
                Las sesiones restantes no se reembolsarán. Podrás usarlas hasta
                el {subscription && formatDate(subscription.current_period_end)}.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Mantener plan
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : null}
              Cancelar suscripción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
