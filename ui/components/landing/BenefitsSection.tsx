import { motion } from "motion/react";
import { Clock, ShieldCheck, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Flexibilidad Total",
    description:
      "Reserva cuando tu puedas: horarios desde las 6am hasta las 12am, todos los dias",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Tutores Verificados",
    description:
      "Todos los tutores tienen perfiles completos con universidad, especialidad y resenas reales",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Sparkles,
    title: "Tecnologia que Ayuda",
    description:
      "Grabaciones automaticas y resumenes por IA de cada sesion para repasar cuando quieras",
    color: "bg-purple-100 text-purple-600",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 bg-white">
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
            Por que elegir EduConnect?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Disenamos cada aspecto de la plataforma pensando en tu exito academico
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gray-50 rounded-2xl p-8 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
