import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  BookOpen,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Label } from "@/ui/components/shadcn/label";
import { Textarea } from "@/ui/components/shadcn/textarea";
import { useAuthStore } from "@/ui/stores/auth.store";

const benefits = [
  "Horarios flexibles - tu decides cuando trabajar",
  "Ganancias competitivas - hasta S/ 50/hora",
  "Plataforma con tecnologia moderna",
  "Soporte continuo del equipo EduConnect",
  "Crece profesionalmente compartiendo conocimiento",
];

export default function RegisterTutorPage() {
  const navigate = useNavigate();
  const { signUp, user, profile } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    career: "",
    semester: "",
    bio: "",
  });
  const [error, setError] = useState("");

  // Redirect if already logged in (AuthProvider handles initialization)
  useEffect(() => {
    if (user && profile) {
      const redirectPath = profile.role === "tutor" ? "/tutor/dashboard" : "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile, navigate]);

  const handleNext = () => {
    setError("");

    // Validate step 1
    if (step === 1) {
      if (!formData.fullName || !formData.email) {
        setError("Por favor completa todos los campos");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contrasenas no coinciden");
        return;
      }
      if (formData.password.length < 8) {
        setError("La contrasena debe tener al menos 8 caracteres");
        return;
      }
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate step 2
    if (!formData.university || !formData.career || !formData.semester) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsLoading(true);

    const result = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      "tutor"
    );

    if (!result.success) {
      setError(result.error || "Error al crear la cuenta. Intenta de nuevo.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-accent p-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white max-w-md"
        >
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Conviertete en tutor EduConnect
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Comparte tu conocimiento, ayuda a otros estudiantes y genera
            ingresos extra mientras estudias.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-white/90 flex-shrink-0" />
                <span className="text-white/90">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-white/10 rounded-2xl">
            <p className="text-white/70 text-sm mb-2">Tutores activos</p>
            <p className="text-3xl font-bold">500+</p>
            <p className="text-white/70 text-sm mt-4 mb-2">Sesiones este mes</p>
            <p className="text-3xl font-bold">2,500+</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="EduConnect" className="h-10" />
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {step === 1 ? "Aplica como tutor" : "Tu perfil academico"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1
                ? "Paso 1 de 2: Informacion basica"
                : "Paso 2 de 2: Informacion academica"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>

          {/* Form */}
          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            {step === 1 && (
              <>
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan Perez"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electronico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 pr-10 h-12 rounded-xl"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
<Input
                       id="confirmPassword"
                       type={showPassword ? "text" : "password"}
                       autoComplete="new-password"
                       placeholder="Repite tu contrasena"
                       value={formData.confirmPassword}
                       onChange={(e) =>
                         setFormData({ ...formData, confirmPassword: e.target.value })
                       }
                       className="pl-10 h-12 rounded-xl"
                       required
                     />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-base"
                >
                  Continuar
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                {/* University */}
                <div className="space-y-2">
                  <Label htmlFor="university">Universidad</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="university"
                      type="text"
                      placeholder="Ej: Universidad de Lima, PUCP, UPC"
                      value={formData.university}
                      onChange={(e) =>
                        setFormData({ ...formData, university: e.target.value })
                      }
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Career */}
                <div className="space-y-2">
                  <Label htmlFor="career">Carrera</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="career"
                      type="text"
                      placeholder="Ej: Ingenieria de Sistemas"
                      value={formData.career}
                      onChange={(e) =>
                        setFormData({ ...formData, career: e.target.value })
                      }
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Semester */}
                <div className="space-y-2">
                  <Label htmlFor="semester">Ciclo actual o egresado</Label>
                  <Input
                    id="semester"
                    type="text"
                    placeholder="Ej: 8vo ciclo, Egresado 2023"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Cuentanos sobre ti (opcional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Experiencia, materias que dominas, metodologia de ensenanza..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                {/* Terms */}
                <p className="text-xs text-muted-foreground">
                  Al registrarte como tutor, aceptas nuestros{" "}
                  <Link to="/terminos-tutor" className="text-primary hover:underline">
                    Terminos para Tutores
                  </Link>{" "}
                  y{" "}
                  <Link to="/privacidad" className="text-primary hover:underline">
                    Politica de Privacidad
                  </Link>
                </p>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Atras
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      "Aplicar como tutor"
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Inicia sesion
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
