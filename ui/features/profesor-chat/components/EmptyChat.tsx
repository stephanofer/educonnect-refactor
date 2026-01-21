import { motion } from "motion/react";
import { GraduationCap, BookOpen, Calculator, FlaskConical, Code } from "lucide-react";

interface EmptyChatProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Calculator,
    text: "¿Me puedes explicar qué es una derivada?",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FlaskConical,
    text: "¿Cuál es la diferencia entre velocidad y aceleración?",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Code,
    text: "¿Cómo funciona un bucle for en Python?",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: BookOpen,
    text: "Dame consejos para estudiar mejor",
    color: "from-purple-500 to-violet-500",
  },
];

export function EmptyChat({ onSuggestionClick }: EmptyChatProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg"
        >
          <GraduationCap className="h-8 w-8 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-2xl font-semibold tracking-tight"
        >
          Profesor EduBot
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-2 text-muted-foreground"
        >
          Tu tutor virtual disponible 24/7
        </motion.p>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${suggestion.color} text-white shadow-sm`}
            >
              <suggestion.icon className="h-4 w-4" />
            </div>
            <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground">
              {suggestion.text}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        className="mt-8 text-center text-xs text-muted-foreground"
      >
        Puedo ayudarte con matemáticas, física, química, programación y más
      </motion.p>
    </div>
  );
}
