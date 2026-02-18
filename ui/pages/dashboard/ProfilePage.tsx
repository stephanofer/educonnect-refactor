import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
  Camera,
  Mail,
  User,
  Save,
  Loader2,
  CheckCircle2,
  X,
  Gift,
  Copy,
  Check,
  Link,
  Sparkles,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import { Input } from "@/ui/components/shadcn/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Badge } from "@/ui/components/shadcn/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/components/shadcn/form";
import { toast } from "sonner";
import { useAuthStore } from "@/ui/stores/auth.store";
import { supabase } from "@/ui/lib/supabase";

// Zod 4 schema for profile validation
// Only includes fields that exist in the profiles table
const profileSchema = z.object({
  full_name: z.string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" }),
  phone: z.string()
    .refine(
      (val) => {
        if (val === "") return true;
        // Remove spaces and dashes for validation
        const cleaned = val.replace(/[\s-]/g, "");
        // Peru phone: 9 digits starting with 9, or with +51 prefix
        return /^(\+51)?9\d{8}$/.test(cleaned);
      },
      { message: "Ingresa un número de celular peruano válido (9 dígitos)" }
    ).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

// Format phone number as user types
function formatPeruPhone(value: string): string {
  // Remove all non-digits except +
  const cleaned = value.replace(/[^\d+]/g, "");
  
  // If starts with +51, format accordingly
  if (cleaned.startsWith("+51")) {
    const number = cleaned.slice(3);
    if (number.length <= 3) return `+51 ${number}`;
    if (number.length <= 6) return `+51 ${number.slice(0, 3)} ${number.slice(3)}`;
    return `+51 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 9)}`;
  }
  
  // Otherwise format as 9-digit number
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
}

export default function ProfilePage() {
  const { user, profile, fetchProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
    },
  });

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      // Format the phone number for display (stored as +51987654321, display as 987 654 321)
      let formattedPhone = "";
      if (profile.phone) {
        // Remove +51 prefix if present, then format
        const phoneWithoutPrefix = profile.phone.replace(/^\+51/, "");
        formattedPhone = formatPeruPhone(phoneWithoutPrefix);
      }
      
      form.reset({
        full_name: profile.full_name || "",
        phone: formattedPhone,
      });
    }
  }, [profile, form]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
    setAvatarRemoved(false);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setIsUploading(true);
    try {
      // Create unique filename - path must be: {user_id}/filename for RLS policy
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log("Uploading avatar to:", filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Error al subir la imagen. Verifica que el bucket 'avatars' exista.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      let avatarUrl: string | null | undefined = profile?.avatar_url;

      // Handle avatar upload/removal
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        } else {
          // Upload failed, don't continue
          setIsSaving(false);
          return;
        }
      } else if (avatarRemoved) {
        avatarUrl = null;
      }

      // Clean phone number before saving (remove formatting, add +51 prefix)
      const rawPhone = (data.phone || "").replace(/[\s-]/g, "");
      const cleanedPhone = rawPhone ? `+51${rawPhone}` : null;

      // Update profile in database - only fields that exist in profiles table
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: cleanedPhone,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchProfile();

      toast.success("Perfil actualizado correctamente");
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarRemoved(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine which avatar to display
  const displayAvatar = avatarRemoved ? null : (avatarPreview || profile?.avatar_url);
  const fullName = form.watch("full_name");
  const hasChanges = form.formState.isDirty || avatarFile !== null || avatarRemoved;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu información personal
          </p>
        </div>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden sm:block"
          >
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSaving || isUploading} 
              className="gap-2"
            >
              {isSaving || isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </motion.div>
        )}
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>
                  Tu foto será visible para tutores y en las sesiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <Avatar className="size-32 border-4 border-background shadow-lg">
                      <AvatarImage src={displayAvatar || undefined} alt={fullName} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials(fullName || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <Camera className="size-8 text-white" />
                    </button>
                    {displayAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 size-8 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg">{fullName || "Tu Nombre"}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                      <Badge variant="secondary" className="capitalize">
                        {profile?.role || "Estudiante"}
                      </Badge>
                      {profile?.onboarding_completed && (
                        <Badge className="gap-1 bg-success text-success-foreground">
                          <CheckCircle2 className="size-3" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                      <Button type="button" variant="outline" size="sm" onClick={handleAvatarClick}>
                        <Camera className="size-4 mr-2" />
                        Cambiar foto
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal Information */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Esta información será visible en tu perfil público
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={user?.email || ""}
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <FormDescription>
                      El correo no puede ser modificado
                    </FormDescription>
                  </FormItem>
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de celular</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-base">🇵🇪</span>
                            <span className="text-sm font-medium">+51</span>
                          </div>
                          <Input
                            type="tel"
                            placeholder="999 999 999"
                            className="pl-20"
                            value={field.value || ""}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/[^\d\s]/g, "");
                              const formatted = formatPeruPhone(rawValue);
                              if (formatted.replace(/\s/g, "").length <= 9) {
                                field.onChange(formatted);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Tu número de contacto para recordatorios de sesiones
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Section */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="size-5 text-primary" />
                  Programa de Referidos
                </CardTitle>
                <CardDescription>
                  Invita a tus amigos y gana beneficios cuando se suscriban a un plan
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-5">

                {/* Generate / Display link */}
                {!referralLink ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                      <Input
                        placeholder="Tu enlace de referido aparecera aqui..."
                        disabled
                        className="pl-10 bg-muted/30 text-muted-foreground"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={async () => {
                        setIsGeneratingLink(true);
                        // Simulate generation delay
                        await new Promise((r) => setTimeout(r, 1500));
                        const code = user?.id
                          ? user.id.slice(0, 8).toUpperCase()
                          : Math.random().toString(36).slice(2, 10).toUpperCase();
                        setReferralLink(
                          `https://educonnect.stephanofer.com/ref/${code}`
                        );
                        setIsGeneratingLink(false);
                        toast.success("Enlace de referido generado exitosamente");
                      }}
                      disabled={isGeneratingLink}
                      className="gap-2 shrink-0"
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Link className="size-4" />
                          Generar enlace de referidos
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Link display + copy */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                        <Input
                          value={referralLink}
                          readOnly
                          className="pl-10 pr-3 font-mono text-sm bg-primary/5 border-primary/20 text-foreground"
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                      </div>
                      <Button
                        type="button"
                        variant={linkCopied ? "default" : "outline"}
                        className={`gap-2 shrink-0 min-w-[140px] transition-all duration-300 ${
                          linkCopied
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                            : ""
                        }`}
                        onClick={async () => {
                          await navigator.clipboard.writeText(referralLink);
                          setLinkCopied(true);
                          toast.success("Enlace copiado al portapapeles");
                          setTimeout(() => setLinkCopied(false), 2500);
                        }}
                      >
                        {linkCopied ? (
                          <>
                            <Check className="size-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" />
                            Copiar enlace
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Hint */}
                    <p className="text-xs text-muted-foreground">
                      Comparte este enlace con tus amigos. Cuando se registren y
                      adquieran un plan, ambos recibiran beneficios.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button - Mobile */}
          {hasChanges && (
            <motion.div
              variants={itemVariants}
              className="sticky bottom-4 sm:hidden"
            >
              <Button
                type="submit"
                disabled={isSaving || isUploading}
                className="w-full gap-2 shadow-lg"
                size="lg"
              >
                {isSaving || isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </form>
      </Form>
    </motion.div>
  );
}
