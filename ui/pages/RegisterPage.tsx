import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, Mail, Lock, User, Loader2, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Label } from "@/ui/components/shadcn/label";
import { useAuthStore } from "@/ui/stores/auth.store";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, user, profile } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Redirect if already logged in (AuthProvider handles initialization)
  useEffect(() => {
    if (user && profile) {
      const redirectPath = profile.role === "tutor" ? "/tutor/dashboard" : "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    const result = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      "student"
    );

    if (!result.success) {
      setError(result.error || "Error al crear la cuenta. Intenta de nuevo.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent to-primary p-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white text-center max-w-md"
        >
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl font-bold">E</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Unete a la comunidad EduConnect
          </h2>
          <p className="text-white/80 text-lg">
            Accede a cientos de tutores verificados y mejora tu rendimiento academico.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold">Flexible</p>
              <p className="text-sm text-white/70">Tu horario, tu ritmo</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold">Seguro</p>
              <p className="text-sm text-white/70">Tutores verificados</p>
            </div>
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
              Crea tu cuenta
            </h1>
            <p className="text-muted-foreground">
              Registrate gratis y comienza a aprender hoy
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              className="p-4 rounded-xl border-2 transition-all border-primary bg-primary/5 cursor-default"
            >
              <GraduationCap
                className="w-6 h-6 mx-auto mb-2 text-primary"
              />
              <p className="font-medium text-sm text-center text-primary">
                Soy Estudiante
              </p>
              <p className="text-xs text-center   text-muted-foreground mt-1">
                Quiero encontrar tutores
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/registro-tutor")}
              className="p-4 rounded-xl border-2 transition-all border-border hover:border-primary/50"
            >
              <BookOpen
                className="w-6 h-6 mx-auto mb-2 text-muted-foreground"
              />
              <p className="font-medium text-sm text-foreground">
                Soy Tutor
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Quiero dar clases
              </p>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Terms */}
            <p className="text-xs text-muted-foreground">
              Al registrarte, aceptas nuestros{" "}
              <Link to="/terminos" className="text-primary hover:underline">
                Terminos y Condiciones
              </Link>{" "}
              y{" "}
              <Link to="/privacidad" className="text-primary hover:underline">
                Politica de Privacidad
              </Link>
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>

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
