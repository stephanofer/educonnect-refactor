import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Search, ArrowRight, Star, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";

const popularSubjects = ["Calculo I", "Calculo II", "Algebra Lineal", "Estadistica"];

// Placeholder avatars for tutor display
const tutorAvatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar-tutores?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/buscar-tutores");
    }
  };

  const handleSubjectClick = (subject: string) => {
    navigate(`/buscar-tutores?q=${encodeURIComponent(subject)}`);
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              +5,000 estudiantes ya mejoraron sus notas
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Tu exito academico{" "}
              <span className="text-primary">comienza aqui</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Conecta con tutores universitarios verificados. Sesiones
              personalizadas 24/7 desde la comodidad de tu casa.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative max-w-xl mx-auto lg:mx-0">
                {/* Mobile: Stacked layout */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 bg-white rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center px-2 sm:px-4 text-muted-foreground">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Que materia necesitas?"
                      className="flex-1 py-2 sm:py-3 text-base bg-transparent focus:outline-none placeholder:text-muted-foreground min-w-0"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl px-6 gap-2"
                  >
                    <span className="sm:inline">Buscar</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Popular Subjects */}
            <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start mb-10">
              <span className="text-sm text-muted-foreground">Populares:</span>
              {popularSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectClick(subject)}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              {/* Tutor Avatars */}
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {tutorAvatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt="Tutor"
                      className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                    />
                  ))}
                </div>
                <div className="ml-2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-xs font-bold border-2 border-white">
                  +500
                </div>
                <span className="ml-3 text-sm text-muted-foreground">tutores activos</span>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-bold text-foreground">4.9</span>
                <span className="text-sm text-muted-foreground">(12k+ resenas)</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mt-10 lg:mt-0"
          >
            <div className="relative">
              {/* Main Video Card */}
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                {/* Image */}
                <img 
                  src="/call.webp" 
                  alt="Sesión de tutoria en vivo" 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay gradient for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Live Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-white text-sm font-medium">En vivo</span>
                </div>
              </div>

              {/* Session Completed Card - Top Left (hidden on mobile) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-4 z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sesion completada!</p>
                    <p className="text-xs text-muted-foreground">Califica a tu Tutor</p>
                  </div>
                </div>
              </motion.div>

              {/* AI Processing Card - Bottom Right (hidden on mobile) */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-2 -right-4 bg-white rounded-2xl shadow-xl p-4 z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">IA Chat</p>
                    <p className="text-xs text-muted-foreground">Responde en todo momento</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
