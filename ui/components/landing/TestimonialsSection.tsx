import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: "1",
    name: "Camila Rodriguez",
    university: "UPC",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Camila",
    rating: 5,
    comment:
      "Necesitaba ayuda urgente con Estadistica y encontre un tutor disponible en 10 minutos. La grabacion me salvo para el examen final.",
  },
  {
    id: "2",
    name: "Diego Fernandez",
    university: "PUCP",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
    rating: 5,
    comment:
      "Los resumenes por IA son increibles. Ahora repaso mis sesiones en la mitad del tiempo y retengo mucho mas informacion.",
  },
  {
    id: "3",
    name: "Valentina Torres",
    university: "Universidad de Lima",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Valentina",
    rating: 5,
    comment:
      "Mi tutor de Calculo es excelente. Subi mi promedio de 12 a 17 en un ciclo. Super recomendado para cualquier curso de mate.",
  },
];

export function TestimonialsSection() {
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
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miles de estudiantes ya mejoraron su rendimiento academico con EduConnect
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-gray-50 rounded-2xl p-6 h-full hover:shadow-lg transition-shadow duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar_url}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full bg-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.university}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
