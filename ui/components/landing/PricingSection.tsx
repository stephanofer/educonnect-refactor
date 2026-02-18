import { Link } from "react-router";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";

const plans = [
  {
    name: "Basico",
    price: 29.9,
    description: "Perfecto para empezar",
    features: [
      "2 sesiones incluidas",
      "Grabaciones por 7 dias",
      "Chat con tutor post-sesion",
      "Soporte por email",
    ],
    cta: "Empezar ahora",
    popular: false,
  },
  {
    name: "Premium",
    price: 59.9,
    description: "El mas popular",
    features: [
      "5 sesiones incluidas",
      "Resumenes por IA",
      "Chat prioritario",
      "Materiales de estudio",
    ],
    cta: "Elegir Premium",
    popular: true,
  },
  {
    name: "Ultra",
    price: 99.9,
    description: "Para los mas dedicados",
    features: [
      "10 sesiones incluidas",
      "Todo lo de Premium",
      "Prioridad en reservas",
      "Tutor dedicado",
      "Soporte 24/7",
    ],
    cta: "Elegir Ultra",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Planes flexibles para ti
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Sin compromisos,
            cancela cuando quieras.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-white text-sm font-medium px-4 py-1 rounded-full">
                    Mas popular
                  </span>
                </div>
              )}

              <div
                className={`h-full rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-primary text-white shadow-2xl shadow-primary/20"
                    : "bg-white border border-gray-200 hover:shadow-lg"
                } transition-shadow duration-300`}
              >
                {/* Plan Name & Price */}
                <div className="text-center mb-6">
                  <h3
                    className={`text-xl font-semibold mb-2 ${
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
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        plan.popular ? "text-white" : "text-foreground"
                      }`}
                    >
                      S/ {plan.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm ${
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
                    <li key={feature} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
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

                {/* CTA */}
                <Link to="/registro">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-white text-primary hover:bg-white/90"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Extra Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Tambien puedes comprar sesiones individuales desde{" "}
          <span className="font-semibold text-foreground">S/ 25</span> cada una
        </motion.p>
      </div>
    </section>
  );
}
