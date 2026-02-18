import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/shadcn/card";
import { Calendar } from "@/ui/components/shadcn/calendar";
import { Textarea } from "@/ui/components/shadcn/textarea";
import { Label } from "@/ui/components/shadcn/label";
import { Separator } from "@/ui/components/shadcn/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { cn } from "@/ui/lib/utils";
import { toast } from "sonner";
import {
  useMockTutorDetail,
  useSubjects,
  getMockAvailableSlots,
} from "@/ui/features/tutors";

type BookingStep = "date" | "time" | "details" | "confirm" | "success";

const DURATION_OPTIONS = [
  { value: 30, label: "30 min", description: "Sesión rápida" },
  { value: 60, label: "1 hora", description: "Más popular" },
  { value: 90, label: "1.5 horas", description: "Sesión extendida" },
  { value: 120, label: "2 horas", description: "Sesión completa" },
];

const STEPS: { key: BookingStep; label: string; icon: typeof CalendarIcon }[] = [
  { key: "date", label: "Fecha", icon: CalendarIcon },
  { key: "time", label: "Horario", icon: Clock },
  { key: "details", label: "Detalles", icon: FileText },
  { key: "confirm", label: "Confirmar", icon: CreditCard },
];

export default function BookingPage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { data: tutor } = useMockTutorDetail(tutorId);
  const { data: subjects } = useSubjects();

  const [step, setStep] = useState<BookingStep>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">No se encontró el tutor</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  // Get available slots for selected date
  const dateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const allSlots = dateString ? getMockAvailableSlots(tutor.id, dateString) : [];

  // Filter slots based on duration (need consecutive available slots)
  const slotsNeeded = selectedDuration / 30;
  const availableSlots = allSlots.filter((slot, idx) => {
    if (!slot.available) return false;
    for (let i = 0; i < slotsNeeded; i++) {
      const checkSlot = allSlots[idx + i];
      if (!checkSlot || !checkSlot.available) return false;
    }
    return true;
  });

  // Tutor subjects for the booking
  const tutorSubjects = subjects?.filter((s) =>
    tutor.subjects.some((ts) => ts.id === s.id)
  ) || tutor.subjects;

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const canGoNext = () => {
    switch (step) {
      case "date": return !!selectedDate;
      case "time": return !!selectedTime;
      case "details": return !!selectedSubject;
      case "confirm": return true;
      default: return false;
    }
  };

  const goNext = () => {
    const order: BookingStep[] = ["date", "time", "details", "confirm"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  };

  const goBack = () => {
    const order: BookingStep[] = ["date", "time", "details", "confirm"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
    else navigate(-1);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setStep("success");
    toast.success("¡Sesión reservada con éxito!");
  };

  const getEndTime = () => {
    if (!selectedTime) return "";
    const [h, m] = selectedTime.split(":").map(Number);
    const totalMin = h * 60 + m + selectedDuration;
    const endH = Math.floor(totalMin / 60);
    const endM = totalMin % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
  };

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Card className="text-center overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
            <CardContent className="p-8 space-y-6">
              <div className="size-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <CheckCircle className="size-10 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">¡Sesión reservada!</h2>
                <p className="text-muted-foreground mt-2">
                  Tu sesión ha sido confirmada exitosamente
                </p>
              </div>

              <Card className="bg-muted/50 border-0">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={tutor.avatarUrl || undefined} />
                      <AvatarFallback>{tutor.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{tutor.fullName}</p>
                      <p className="text-sm text-muted-foreground">{tutor.career}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {selectedDate && format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Horario</p>
                      <p className="font-medium">{selectedTime} - {getEndTime()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duración</p>
                      <p className="font-medium">{DURATION_OPTIONS.find((d) => d.value === selectedDuration)?.label}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Materia</p>
                      <p className="font-medium">
                        {tutorSubjects.find((s) => s.id === selectedSubject)?.name || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                <AlertCircle className="size-4 text-amber-600 shrink-0" />
                <span>Se ha descontado 1 sesión de tu plan activo</span>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/dashboard/mis-sesiones")} className="w-full gap-2">
                  Ver mis sesiones
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard/buscar-tutores")} className="w-full">
                  Buscar más tutores
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 -ml-2">
          <ArrowLeft className="size-4" />
          {step === "date" ? "Volver al perfil" : "Paso anterior"}
        </Button>
      </motion.div>

      {/* Progress Steps */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center justify-between px-2">
          {STEPS.map((s, i) => {
            const isActive = s.key === step;
            const isCompleted = i < currentStepIndex;
            const Icon = s.icon;

            return (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "size-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="size-5" />
                    ) : (
                      <Icon className="size-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block",
                      isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div
                      className={cn(
                        "h-0.5 rounded-full transition-colors",
                        i < currentStepIndex ? "bg-emerald-500" : "bg-muted"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step: Date */}
              {step === "date" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="size-5 text-primary" />
                      Selecciona la fecha
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Elige un día dentro de los próximos 30 días
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Duration selector */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Duración de la sesión</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {DURATION_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSelectedDuration(opt.value);
                              setSelectedTime("");
                            }}
                            className={cn(
                              "relative p-3 rounded-xl border-2 text-center transition-all duration-200",
                              selectedDuration === opt.value
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                            )}
                          >
                            <p className="font-bold text-base">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                            {opt.value === 60 && (
                              <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 bg-primary">
                                <Sparkles className="size-2.5 mr-0.5" />
                                Popular
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calendar */}
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTime("");
                        }}
                        disabled={(date) =>
                          isBefore(date, startOfDay(new Date())) ||
                          isBefore(addDays(new Date(), 30), date)
                        }
                        className="rounded-lg border"
                      />
                    </div>

                    {selectedDate && (
                      <div className="text-center text-sm text-muted-foreground">
                        Seleccionaste: <span className="font-medium text-foreground">{format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step: Time */}
              {step === "time" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="size-5 text-primary" />
                      Selecciona el horario
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} &middot; {DURATION_OPTIONS.find((d) => d.value === selectedDuration)?.label}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {availableSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">No hay horarios disponibles</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Intenta con otra fecha o duración diferente
                        </p>
                        <Button variant="outline" onClick={() => setStep("date")} className="mt-4">
                          Cambiar fecha
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {availableSlots.length} horarios disponibles
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {availableSlots.map((slot) => {
                            const isSelected = selectedTime === slot.time;
                            const [h, m] = slot.time.split(":").map(Number);
                            const endMin = h * 60 + m + selectedDuration;
                            const endH = Math.floor(endMin / 60);
                            const endM = endMin % 60;
                            const endTime = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;

                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => setSelectedTime(slot.time)}
                                className={cn(
                                  "p-3 rounded-xl border-2 text-center transition-all duration-200",
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                                )}
                              >
                                <p className="font-bold text-sm">{slot.time}</p>
                                <p className="text-[10px] text-muted-foreground">a {endTime}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step: Details */}
              {step === "details" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="size-5 text-primary" />
                      Detalles de la sesión
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Cuéntanos más sobre lo que necesitas
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Subject */}
                    <div className="space-y-2">
                      <Label className="font-medium">Materia / Curso *</Label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la materia" />
                        </SelectTrigger>
                        <SelectContent>
                          {tutorSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="font-medium">¿En qué necesitas ayuda?</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe brevemente tu duda, el tema que quieres revisar, ejercicios específicos, etc. Esto ayuda al tutor a prepararse mejor para la sesión..."
                        rows={5}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Opcional pero recomendado. Mientras más detalle, mejor preparado estará el tutor.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step: Confirm */}
              {step === "confirm" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="size-5 text-primary" />
                      Confirma tu reserva
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Revisa los detalles antes de confirmar
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Tutor info */}
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                      <Avatar className="size-14 border-2 border-background shadow-md">
                        <AvatarImage src={tutor.avatarUrl || undefined} />
                        <AvatarFallback className="text-lg font-bold">{tutor.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{tutor.fullName}</p>
                        <p className="text-sm text-muted-foreground">{tutor.career} &mdash; {tutor.university}</p>
                      </div>
                    </div>

                    {/* Booking details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 rounded-lg border">
                        <CalendarIcon className="size-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha</p>
                          <p className="font-medium">
                            {selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 rounded-lg border">
                        <Clock className="size-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Horario</p>
                          <p className="font-medium">
                            {selectedTime} - {getEndTime()} ({DURATION_OPTIONS.find((d) => d.value === selectedDuration)?.label})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 rounded-lg border">
                        <BookOpen className="size-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Materia</p>
                          <p className="font-medium">
                            {tutorSubjects.find((s) => s.id === selectedSubject)?.name}
                          </p>
                        </div>
                      </div>

                      {description && (
                        <div className="flex items-start gap-4 p-3 rounded-lg border">
                          <FileText className="size-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Descripción</p>
                            <p className="font-medium text-sm">{description}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subscription notice */}
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-5 text-amber-600" />
                        <p className="font-semibold text-amber-800 dark:text-amber-300">Descuento de tu plan</p>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Al confirmar, se descontará <strong>1 sesión</strong> de tu suscripción activa. 
                        Asegúrate de tener sesiones disponibles en tu plan antes de continuar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar - Summary */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            {/* Tutor summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={tutor.avatarUrl || undefined} />
                    <AvatarFallback>{tutor.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{tutor.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{tutor.career}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resumen de reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración</span>
                  <span className="font-medium">{DURATION_OPTIONS.find((d) => d.value === selectedDuration)?.label}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha</span>
                    <span className="font-medium">{format(selectedDate, "d MMM yyyy", { locale: es })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora</span>
                    <span className="font-medium">{selectedTime} - {getEndTime()}</span>
                  </div>
                )}
                {selectedSubject && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Materia</span>
                    <span className="font-medium truncate ml-2">
                      {tutorSubjects.find((s) => s.id === selectedSubject)?.name}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>Se descontará 1 sesión de tu plan</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-4 border-t"
        >
          <Button variant="ghost" onClick={goBack} className="gap-2">
            <ArrowLeft className="size-4" />
            {step === "date" ? "Cancelar" : "Anterior"}
          </Button>

          {step === "confirm" ? (
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="gap-2 min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Reservando...
                </>
              ) : (
                <>
                  <CheckCircle className="size-4" />
                  Confirmar reserva
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={goNext}
              disabled={!canGoNext()}
              className="gap-2"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          )}
        </motion.div>
    </div>
  );
}
