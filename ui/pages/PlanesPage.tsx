import { Link } from "react-router";
import { motion } from "motion/react";
import { Check, Zap, Crown, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";

const plans = [
  {
    id: "basic",
    name: "Basico",
    price: 29.9,
    description: "Perfecto para empezar",
    icon: Zap,
    color: "bg-blue-500",
    features: [
      "2 sesiones de 1 hora incluidas",
      "Grabaciones por 7 dias",
      "Chat con tutor post-sesion",
      "Soporte por email",
      "Materiales basicos",
    ],
    extraSessionPrice: 17,
    cta: "Empezar con Basico",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 59.9,
    description: "El mas popular",
    icon: Crown,
    color: "bg-primary",
    features: [
      "5 sesiones de 1 hora incluidas",
      "Grabaciones ilimitadas",
      "Resumenes generados por IA",
      "Chat prioritario 24/7",
      "Plan de estudio personalizado",
      "Materiales premium",
      "Prioridad en reservas",
    ],
    extraSessionPrice: 15,
    cta: "Elegir Premium",
    popular: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: 99.9,
    description: "Para los mas dedicados",
    icon: Rocket,
    color: "bg-gradient-to-r from-purple-600 to-pink-600",
    features: [
      "10 sesiones de 1 hora incluidas",
      "Todo lo de Premium",
      "Tutor dedicado asignado",
      "Correccion de tareas",
      "Seguimiento academico diario",
      "Eventos exclusivos mensuales",
      "Soporte VIP 24/7",
    ],
    extraSessionPrice: 10,
    cta: "Ir Ultra",
    popular: false,
  },
];

const faqs = [
  {
    question: "Puedo cambiar de plan en cualquier momento?",
    answer: "Si, puedes subir o bajar de plan cuando quieras. El cambio se aplica en tu proxima facturacion.",
  },
  {
    question: "Las sesiones no usadas se acumulan?",
    answer: "No, las sesiones no usadas no se acumulan al siguiente mes. Te recomendamos usarlas todas.",
  },
  {
    question: "Puedo cancelar mi suscripcion?",
    answer: "Si, puedes cancelar en cualquier momento sin penalidad. Seguiras teniendo acceso hasta el fin de tu periodo pagado.",
  },
  {
    question: "Que metodos de pago aceptan?",
    answer: "Aceptamos Yape, Plin, tarjetas Visa y Mastercard, y transferencias bancarias.",
  },
];

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Planes flexibles para tu exito
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades academicas.
              Sin compromisos, cancela cuando quieras.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-primary text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg">
                      Mas popular
                    </span>
                  </div>
                )}

                <div
                  className={`h-full rounded-3xl p-8 ${
                    plan.popular
                      ? "bg-primary text-white shadow-2xl shadow-primary/25 ring-4 ring-primary/20"
                      : "bg-white border border-gray-200 shadow-lg"
                  } transition-all duration-300 hover:scale-[1.02]`}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${
                      plan.popular ? "bg-white/20" : plan.color
                    } flex items-center justify-center mb-6`}
                  >
                    <plan.icon
                      className={`w-7 h-7 ${plan.popular ? "text-white" : "text-white"}`}
                    />
                  </div>

                  {/* Plan Name & Price */}
                  <div className="mb-6">
                    <h3
                      className={`text-2xl font-bold mb-1 ${
                        plan.popular ? "text-white" : "text-foreground"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${
                        plan.popular ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm">S/</span>
                      <span
                        className={`text-5xl font-bold ${
                          plan.popular ? "text-white" : "text-foreground"
                        }`}
                      >
                        {plan.price.toFixed(2).split(".")[0]}
                      </span>
                      <span className="text-lg">.{plan.price.toFixed(2).split(".")[1]}</span>
                      <span
                        className={`text-sm ml-1 ${
                          plan.popular ? "text-white/80" : "text-muted-foreground"
                        }`}
                      >
                        /mes
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular ? "bg-white/20" : "bg-primary/10"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              plan.popular ? "text-white" : "text-primary"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm ${
                            plan.popular ? "text-white/90" : "text-muted-foreground"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Extra sessions */}
                  <p
                    className={`text-xs mb-6 ${
                      plan.popular ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    Sesiones adicionales: S/ {plan.extraSessionPrice} c/u
                  </p>

                  {/* CTA */}
                  <Link to="/registro">
                    <Button
                      className={`w-full h-12 rounded-xl font-medium ${
                        plan.popular
                          ? "bg-white text-primary hover:bg-white/90"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            Todos los planes incluyen: grabaciones automaticas, acceso a la plataforma 24/7,
            y soporte tecnico. <span className="font-medium text-foreground">Primera sesion con 50% de descuento.</span>
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Preguntas frecuentes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              Listo para mejorar tu rendimiento?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Unete a miles de estudiantes que ya estan aprendiendo con EduConnect.
              Comienza hoy con nuestra garantia de satisfaccion.
            </p>
            <Link to="/registro">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg">
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
