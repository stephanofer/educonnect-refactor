import { Link } from "react-router";
import { motion } from "motion/react";
import { BookOpen, Users, Award, ArrowRight, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";

const benefits = [
  {
    icon: DollarSign,
    title: "Genera ingresos extra",
    description: "Gana entre S/ 25 - S/ 50 por hora ensenando lo que ya sabes. Tu defines tus tarifas.",
  },
  {
    icon: Clock,
    title: "Horarios flexibles",
    description: "Tu decides cuando y cuanto trabajar. Compatible con tus estudios y otras actividades.",
  },
  {
    icon: Users,
    title: "Crece profesionalmente",
    description: "Desarrolla habilidades de comunicacion, liderazgo y ensenanza valoradas por empleadores.",
  },
  {
    icon: Award,
    title: "Construye tu reputacion",
    description: "Acumula resenas positivas y destaca como experto en tu campo academico.",
  },
];

const steps = [
  {
    number: 1,
    title: "Registrate como tutor",
    description: "Crea tu perfil con tus datos academicos y especialidades.",
  },
  {
    number: 2,
    title: "Verifica tu identidad",
    description: "Sube tus documentos universitarios para ser tutor verificado.",
  },
  {
    number: 3,
    title: "Configura tu disponibilidad",
    description: "Define tus horarios y tarifa por hora.",
  },
  {
    number: 4,
    title: "Empieza a ensenar",
    description: "Recibe solicitudes de estudiantes y comienza a dar clases.",
  },
];

const requirements = [
  "Ser estudiante universitario activo o egresado reciente (max 2 anos)",
  "Promedio ponderado minimo de 14/20 en tu carrera",
  "Disponibilidad minima de 4 horas semanales",
  "Computadora con camara y buena conexion a internet",
  "Paciencia y pasion por ensenar",
];

const stats = [
  { value: "S/ 800+", label: "Ingreso promedio mensual" },
  { value: "15 hrs", label: "Dedicacion promedio semanal" },
  { value: "4.8/5", label: "Satisfaccion de tutores" },
];

export default function ParaTutoresPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-accent/10 via-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
                Unete a +500 tutores
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                Ensena lo que sabes,{" "}
                <span className="text-gradient">gana mientras estudias</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Conviertete en tutor de EduConnect y ayuda a otros estudiantes
                mientras generas ingresos flexibles que se adaptan a tu vida universitaria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/registro-tutor">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8">
                    Aplicar como tutor
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="#como-funciona">
                  <Button size="lg" variant="outline" className="h-14 px-8">
                    Como funciona
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Maria Garcia</p>
                      <p className="text-sm text-muted-foreground">Tutora de Calculo - PUCP</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "EduConnect me permite pagar mis gastos universitarios sin descuidar mis estudios.
                    En 3 meses ya he ayudado a 45 estudiantes!"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Por que ser tutor en EduConnect?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beneficios disenados para estudiantes universitarios como tu
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Como funciona?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comenzar es facil y rapido
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary/20" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Requisitos para ser tutor
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-lg"
          >
            <ul className="space-y-4">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Listo para empezar a ensenar?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
              El proceso de aplicacion toma menos de 10 minutos.
              Te respondemos en 24-48 horas.
            </p>
            <Link to="/registro-tutor">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg">
                Aplicar ahora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
