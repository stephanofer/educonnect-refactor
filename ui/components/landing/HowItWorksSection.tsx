import { motion } from "motion/react";
import { Search, UserCheck, CalendarCheck, Video } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Search,
    title: "Busca tu materia",
    description: "Encuentra tutores especializados en cualquier tema que necesites",
  },
  {
    number: 2,
    icon: UserCheck,
    title: "Elige tu tutor",
    description: "Revisa perfiles, calificaciones y elige al mejor para ti",
  },
  {
    number: 3,
    icon: CalendarCheck,
    title: "Reserva tu horario",
    description: "Selecciona fecha, hora y duracion que se adapte a ti",
  },
  {
    number: 4,
    icon: Video,
    title: "Aprende y repasa",
    description: "Recibe tu sesion por video y accede a la grabacion despues",
  },
];

export function HowItWorksSection() {
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
            Como funciona?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En solo 4 pasos estaras aprendiendo con el tutor perfecto para ti
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary via-accent to-success" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step Number & Icon */}
                  <div className="relative mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center relative z-10 border-2 border-primary/20"
                    >
                      <step.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold z-20">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
