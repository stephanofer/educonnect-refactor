import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Label } from "@/ui/components/shadcn/label";
import { useAuthStore } from "@/ui/stores/auth.store";
import { getDashboardPath } from "@/ui/lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, profile } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Redirect if already logged in (AuthProvider handles initialization)
  useEffect(() => {
    if (user && profile) {
      navigate(getDashboardPath(profile.role), { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn(formData.email, formData.password);

    if (!result.success) {
      setError(result.error || "Error al iniciar sesion");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contrasena</Label>
                <Link
                  to="/recuperar-contrasena"
                  className="text-sm text-primary hover:underline"
                >
                  Olvidaste tu contrasena?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
<Input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   autoComplete="current-password"
                   placeholder="********"
                   value={formData.password}
                   onChange={(e) =>
                     setFormData({ ...formData, password: e.target.value })
                   }
                   className="pl-10 pr-10 h-12 rounded-xl"
                   required
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Iniciando sesion...
                </>
              ) : (
                "Iniciar sesion"
              )}
            </Button>

            {/* Sign Up Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No tienes una cuenta?{" "}
                <Link to="/registro" className="text-primary font-medium hover:underline">
                  Registrate como estudiante
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Quieres ser tutor?{" "}
                <Link to="/registro-tutor" className="text-primary font-medium hover:underline">
                  Aplica aqui
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-accent p-12 items-center justify-center">
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
            Aprende de los mejores tutores
          </h2>
          <p className="text-white/80 text-lg">
            Conecta con tutores universitarios verificados y mejora tu rendimiento
            academico con sesiones personalizadas.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-white/70">Tutores</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm text-white/70">Sesiones</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">4.9</p>
              <p className="text-sm text-white/70">Rating</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
