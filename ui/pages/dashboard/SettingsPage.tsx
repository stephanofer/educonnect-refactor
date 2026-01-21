import { useState } from "react";
import { motion } from "motion/react";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Key,
  Trash2,
  LogOut,
  Monitor,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import { Switch } from "@/ui/components/shadcn/switch";
import { Label } from "@/ui/components/shadcn/label";
import { Input } from "@/ui/components/shadcn/input";
import { Separator } from "@/ui/components/shadcn/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/components/shadcn/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/components/shadcn/alert-dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/ui/stores/auth.store";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const { signOut } = useAuthStore();

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [language, setLanguage] = useState("es");

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sessionReminder24h: true,
    sessionReminder1h: true,
    sessionReminder15m: true,
    newMessages: true,
    marketing: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    allowRatings: true,
  });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sessions state
  const [activeSessions] = useState([
    {
      id: "1",
      device: "Chrome en Windows",
      location: "Lima, Perú",
      lastActive: "Activo ahora",
      current: true,
    },
    {
      id: "2",
      device: "Safari en iPhone",
      location: "Lima, Perú",
      lastActive: "Hace 2 horas",
      current: false,
    },
  ]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`Tema cambiado a ${newTheme === "light" ? "claro" : newTheme === "dark" ? "oscuro" : "sistema"}`);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preferencias de notificación actualizadas");
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Configuración de privacidad actualizada");
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsChangingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsChangingPassword(false);
    setShowPasswordModal(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
    toast.success("Contraseña actualizada correctamente");
  };

  const handleRevokeSession = (_sessionId: string) => {
    toast.success("Sesión cerrada correctamente");
  };

  const handleRevokeAllSessions = () => {
    toast.success("Todas las demás sesiones han sido cerradas");
  };

  const handleDeleteAccount = async () => {
    toast.success("Cuenta eliminada correctamente");
    await signOut();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus preferencias y configuración de cuenta
        </p>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="size-5" />
              Apariencia
            </CardTitle>
            <CardDescription>
              Personaliza la apariencia de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-base">Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona el tema de la interfaz
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("light")}
                  className="gap-2"
                >
                  <Sun className="size-4" />
                  <span className="hidden sm:inline">Claro</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("dark")}
                  className="gap-2"
                >
                  <Moon className="size-4" />
                  <span className="hidden sm:inline">Oscuro</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("system")}
                  className="gap-2"
                >
                  <Monitor className="size-4" />
                  <span className="hidden sm:inline">Sistema</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Idioma y Región
            </CardTitle>
            <CardDescription>
              Configura tu idioma preferido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-base">Idioma</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona el idioma de la interfaz
                </p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura cómo quieres recibir las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Canales</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-muted-foreground shrink-0" />
                  <div>
                    <Label>Notificaciones por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones en tu correo
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange("email")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="size-5 text-muted-foreground shrink-0" />
                  <div>
                    <Label>Notificaciones push</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones en el navegador
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationChange("push")}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Recordatorios de Sesión</h4>
              <div className="flex items-center justify-between">
                <Label>24 horas antes</Label>
                <Switch
                  checked={notifications.sessionReminder24h}
                  onCheckedChange={() => handleNotificationChange("sessionReminder24h")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>1 hora antes</Label>
                <Switch
                  checked={notifications.sessionReminder1h}
                  onCheckedChange={() => handleNotificationChange("sessionReminder1h")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>15 minutos antes</Label>
                <Switch
                  checked={notifications.sessionReminder15m}
                  onCheckedChange={() => handleNotificationChange("sessionReminder15m")}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Otras Notificaciones</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Nuevos mensajes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones de mensajes de tutores
                  </p>
                </div>
                <Switch
                  checked={notifications.newMessages}
                  onCheckedChange={() => handleNotificationChange("newMessages")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing y ofertas</Label>
                  <p className="text-sm text-muted-foreground">
                    Promociones y novedades de EduConnect
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={() => handleNotificationChange("marketing")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Privacidad
            </CardTitle>
            <CardDescription>
              Controla quién puede ver tu información
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Perfil visible</Label>
                <p className="text-sm text-muted-foreground">
                  Permite que otros usuarios vean tu perfil
                </p>
              </div>
              <Switch
                checked={privacy.profileVisible}
                onCheckedChange={() => handlePrivacyChange("profileVisible")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Mostrar estado en línea</Label>
                <p className="text-sm text-muted-foreground">
                  Muestra cuando estás activo en la plataforma
                </p>
              </div>
              <Switch
                checked={privacy.showOnlineStatus}
                onCheckedChange={() => handlePrivacyChange("showOnlineStatus")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Permitir calificaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Permite que los tutores te califiquen
                </p>
              </div>
              <Switch
                checked={privacy.allowRatings}
                onCheckedChange={() => handlePrivacyChange("allowRatings")}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="size-5" />
              Contraseña
            </CardTitle>
            <CardDescription>
              Gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium">Cambiar contraseña</p>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu contraseña regularmente
                </p>
              </div>
              <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">Cambiar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                      Ingresa tu contraseña actual y la nueva contraseña
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Contraseña actual</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.current}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, current: e.target.value }))
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                          onClick={() =>
                            setShowPasswords((p) => ({ ...p, current: !p.current }))
                          }
                        >
                          {showPasswords.current ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.new}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, new: e.target.value }))
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                          onClick={() =>
                            setShowPasswords((p) => ({ ...p, new: !p.new }))
                          }
                        >
                          {showPasswords.new ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirm}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                          onClick={() =>
                            setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                          }
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Guardando..." : "Guardar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Sessions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="size-5" />
              Sesiones Activas
            </CardTitle>
            <CardDescription>
              Dispositivos donde has iniciado sesión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="size-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      {session.device}
                      {session.current && (
                        <span className="ml-2 text-xs text-primary">
                          (Este dispositivo)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.location} · {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive w-full sm:w-auto"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <LogOut className="size-4 mr-2 sm:mr-0" />
                    <span className="sm:hidden">Cerrar sesión</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleRevokeAllSessions}
            >
              Cerrar todas las demás sesiones
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Zona de Peligro
            </CardTitle>
            <CardDescription>
              Acciones irreversibles para tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium">Eliminar cuenta</p>
                <p className="text-sm text-muted-foreground">
                  Esta acción es irreversible y eliminará todos tus datos
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">Eliminar cuenta</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente tu
                      cuenta y todos tus datos de nuestros servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sí, eliminar mi cuenta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
