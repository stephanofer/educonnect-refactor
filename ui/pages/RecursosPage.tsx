import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { resources } from "@/ui/features/resources/data/resources";

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function RecursosPage() {
  const featured = resources[0];
  const rest = resources.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-16 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-primary font-medium text-sm mb-4">
              <BookOpen className="w-4 h-4" />
              Contenido educativo gratuito
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Recursos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Articulos, guias y tips creados por expertos para ayudarte a
              mejorar tu rendimiento academico. Totalmente gratis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link
                to={`/recursos/${featured.slug}`}
                className="group block"
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Image */}
                  <div
                    className={`aspect-[16/10] rounded-3xl overflow-hidden ${featured.coverBgColor}`}
                  >
                    <img
                      src={featured.coverImage}
                      alt={featured.coverAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="py-4">
                    <span className="inline-block text-sm font-medium text-primary mb-3">
                      {featured.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-200 leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{featured.date}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {featured.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Articles List - Anthropic style table/list */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header row - desktop only */}
          {rest.length > 0 && (
            <div className="hidden md:grid md:grid-cols-[140px_180px_1fr_auto] gap-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Fecha</span>
              <span>Categoria</span>
              <span>Titulo</span>
              <span>Lectura</span>
            </div>
          )}

          {rest.length > 0 && (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {rest.map((resource) => (
                <motion.div key={resource.slug} variants={itemVariants}>
                  <Link
                    to={`/recursos/${resource.slug}`}
                    className="group block"
                  >
                    {/* Desktop row */}
                    <div className="hidden md:grid md:grid-cols-[140px_180px_1fr_auto] gap-6 py-5 border-b border-border/60 items-center hover:bg-muted/30 transition-colors duration-150 -mx-4 px-4 rounded-lg">
                      <span className="text-sm text-muted-foreground">
                        {resource.date}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {resource.category}
                      </span>
                      <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                        {resource.title}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {resource.readTime}
                      </span>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden py-5 border-b border-border/60">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 ${resource.coverBgColor}`}
                        >
                          <img
                            src={resource.coverImage}
                            alt={resource.coverAlt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-primary">
                            {resource.category}
                          </span>
                          <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {resource.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{resource.date}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {resource.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-accent rounded-3xl p-10 sm:p-12 text-center text-white"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Quieres ir mas alla?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Conecta con tutores verificados para sesiones 1 a 1 personalizadas
              y acelera tu aprendizaje.
            </p>
            <Link to="/registro">
              <button className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-base">
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
