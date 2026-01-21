🎯 Plan de Implementación: Flujo Completo de Sesiones
📊 Estado Actual del Proyecto
| Componente | Estado |
|------------|--------|
| Schema de DB (Supabase) | ✅ COMPLETO - Todas las tablas definidas con RLS |
| Types TypeScript | ✅ COMPLETO - Session, TutorAvailability, TutorProfile |
| Dashboard Display | ✅ IMPLEMENTADO - Muestra stats de sesiones |
| Flujo de Reserva | ❌ NO INICIADO - Solo placeholders |
| Búsqueda de Tutores | ❌ NO INICIADO - Placeholder |
| Configuración Disponibilidad | ❌ NO INICIADO - Placeholder |
| Gestión de Sesiones | ❌ NO INICIADO - Placeholder |
| Integración Daily.co | ❌ NO INICIADO - Solo columnas en DB listas |
---
🔄 Flujo Completo de Usuario (End-to-End)
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DEL ESTUDIANTE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. BÚSQUEDA           2. PERFIL TUTOR         3. RESERVA                   │
│  ┌─────────────┐      ┌─────────────┐        ┌─────────────┐                │
│  │ Filtrar por │ ───► │ Ver perfil  │ ───►   │ Seleccionar │                │
│  │ materia,    │      │ completo,   │        │ fecha/hora  │                │
│  │ rating,     │      │ reseñas,    │        │ duración    │                │
│  │ precio      │      │ disponib.   │        │ materia     │                │
│  └─────────────┘      └─────────────┘        └─────────────┘                │
│        │                                            │                        │
│        │                                            ▼                        │
│        │                                   ┌─────────────┐                  │
│        │                                   │ Confirmar   │                  │
│        │                                   │ y descontar │                  │
│        │                                   │ sesión plan │                  │
│        │                                   └─────────────┘                  │
│        │                                            │                        │
│  ◄─────┴────────────────────────────────────────────┘                       │
│                                                                              │
│  4. PRE-SESIÓN         5. VIDEOLLAMADA          6. POST-SESIÓN             │
│  ┌─────────────┐      ┌─────────────┐        ┌─────────────┐                │
│  │ Notificación│ ───► │ Daily.co    │ ───►   │ Calificar   │                │
│  │ recordatorio│      │ Embed con   │        │ tutor +     │                │
│  │ 5 min antes │      │ grabación   │        │ feedback    │                │
│  │ entrar sala │      │             │        │             │                │
│  └─────────────┘      └─────────────┘        └─────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUJO DEL TUTOR                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CONFIGURAR         2. RECIBIR              3. VIDEOLLAMADA              │
│  ┌─────────────┐      ┌─────────────┐        ┌─────────────┐                │
│  │ Drag & drop │ ◄──► │ Notificación│ ───►   │ Daily.co    │                │
│  │ calendario  │      │ nueva       │        │ Embed       │                │
│  │ semanal     │      │ reserva     │        │             │                │
│  └─────────────┘      └─────────────┘        └─────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
---
🎬 Análisis de Daily.co - Opciones de Integración
Opción A: Daily Prebuilt (RECOMENDADO ✅)
Pros:
  ✅ UI completa out-of-the-box (controles, layout, chat)
  ✅ Implementación en 1-2 días
  ✅ Responsive automático
  ✅ Grabación cloud integrada
  ✅ Menos código = menos bugs
  ✅ Daily maneja reconexiones, fallbacks
  
Cons:
  ⚠️ Branding de Daily visible
  ⚠️ Menos control sobre UX
  ⚠️ Puede sentirse "genérico"
Implementación:
  - iframe embed o @daily-co/daily-js con prebuilt
  - Configuración via REST API
  
Costo de desarrollo: 2-3 días
Opción B: Daily React Custom UI
Pros:
  ✅ Control total del diseño
  ✅ Integración perfecta con tu branding
  ✅ UX personalizada
  
Cons:
  ⚠️ 5-10x más tiempo de desarrollo
  ⚠️ Manejar edge cases (reconexiones, errores)
  ⚠️ Testing complejo
  ⚠️ Mantenimiento continuo
Implementación:
  - @daily-co/daily-react hooks
  - DailyProvider, useDaily, useParticipants, useRecording
  - UI completamente custom
Costo de desarrollo: 2-3 semanas
Opción C: Híbrido (Prebuilt + Customización)
Pros:
  ✅ Balance entre velocidad y personalización
  ✅ Prebuilt con theme/color customization
  ✅ Ocultar branding Daily (plan pago)
  
Cons:
  ⚠️ Limitaciones de customización
  
Implementación:
  - Prebuilt con custom colors, logo
  - Custom prejoin/lobby page
  - Wrapper components propios
Costo de desarrollo: 3-5 días
Mi Recomendación: Opción A (Daily Prebuilt)
Para tu MVP y dado que:
1. La grabación automática es crítica (viene incluida)
2. El foco es la funcionalidad, no reinventar videollamadas
3. Necesitás ir rápido al mercado
4. Siempre podés migrar a custom después
---
🗂️ Arquitectura Propuesta
Backend (Cloudflare Worker + Supabase)
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API Worker (solo Daily.co)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  POST /api/sessions/:id/room                                                │
│  ├── Crear Daily room                                                        │
│  ├── Generar meeting tokens (estudiante + tutor)                            │
│  └── Guardar meeting_url en sessions                                        │
│                                                                              │
│  GET /api/sessions/:id/join                                                 │
│  ├── Validar que faltan ≤5 min para sesión                                  │
│  ├── Generar token temporal para el usuario                                 │
│  └── Retornar meeting_url + token                                           │
│                                                                              │
│  POST /api/webhooks/daily                                                   │
│  ├── recording.ready-to-download                                            │
│  ├── meeting.ended                                                          │
│  └── Actualizar session con recording_url                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
Frontend (Supabase directo)
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Supabase Queries Directo                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  tutor_profiles                                                              │
│  ├── Listar tutores con filtros                                             │
│  ├── Obtener perfil completo                                                │
│  └── Join con subjects, reviews                                             │
│                                                                              │
│  tutor_availability                                                          │
│  ├── CRUD disponibilidad (tutor)                                            │
│  └── Leer slots disponibles (estudiante)                                    │
│                                                                              │
│  sessions                                                                    │
│  ├── Crear reserva (INSERT)                                                  │
│  ├── Listar mis sesiones                                                    │
│  ├── Cancelar sesión (UPDATE status)                                        │
│  └── Actualizar rating promedio                                              │
│                                                                              │
│  subscriptions                                                               │
│  └── Verificar/descontar sesiones                                           │
│                                                                              │
│  reviews                                                                     │
│  └── Crear review post-sesión                                               │
│                                                                              │
│  notifications (Realtime)                                                    │
│  └── Subscribe a nuevas notificaciones                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
---
📦 Fases de Implementación
FASE 1: Fundación (3-4 días)
> Prioridad: ALTA | Dependencias: Ninguna
| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 1.1 | Búsqueda de Tutores - Page con filtros, cards, paginación | 1 día |
| 1.2 | Perfil de Tutor Público - Vista detallada, disponibilidad visual, reseñas | 1 día |
| 1.3 | Hooks de queries - useTutors, useTutorProfile, useTutorAvailability | 0.5 día |
| 1.4 | Store de booking - useBookingStore (draft de reserva) | 0.5 día |
Entregables Fase 1:
- Estudiante puede buscar y ver perfiles de tutores
- Calendario semanal de disponibilidad visible
---
FASE 2: Reservas (3-4 días)
> Prioridad: ALTA | Dependencias: Fase 1
| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 2.1 | Booking Modal/Page - Selector fecha, hora, duración, materia | 1.5 días |
| 2.2 | Validación de slots - Calcular slots libres basado en disponibilidad | 0.5 día |
| 2.3 | Confirmación de reserva - Crear sesión + descontar de plan | 0.5 día |
| 2.4 | My Sessions Page (Estudiante) - Lista con tabs, countdown, acciones | 1 día |
| 2.5 | Tutor Sessions Page - Vista de sesiones programadas | 0.5 día |
Entregables Fase 2:
- Estudiante puede reservar sesión completa
- Descuento automático de sesiones del plan
- Vista de próximas sesiones para ambos roles
---
FASE 3: Daily.co Integration (2-3 días)
> Prioridad: ALTA | Dependencias: Fase 2
| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 3.1 | API endpoint crear room - POST /api/sessions/:id/room | 0.5 día |
| 3.2 | API endpoint join - GET /api/sessions/:id/join (token temporal) | 0.5 día |
| 3.3 | VideoRoom Page - Embed de Daily Prebuilt | 0.5 día |
| 3.4 | Botón "Entrar a sala" - Habilitado 5 min antes | 0.5 día |
| 3.5 | Webhook recordings - Capturar URL de grabación | 0.5 día |
Entregables Fase 3:
- Videollamada funcional entre estudiante y tutor
- Grabación automática guardada
---
FASE 4: Post-Sesión y Feedback (1-2 días)
> Prioridad: MEDIA | Dependencias: Fase 3
| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 4.1 | Redirect post-llamada - Detectar meeting.ended | 0.5 día |
| 4.2 | Feedback Modal - Rating 5 estrellas + tags + comentario | 0.5 día |
| 4.3 | Actualizar rating - Trigger en DB o lógica frontend | 0.5 día |
Entregables Fase 4:
- Sistema de reviews funcional
- Rating de tutores actualizado automáticamente
---
FASE 5: Disponibilidad del Tutor (2-3 días)
> Prioridad: MEDIA | Dependencias: Ninguna (paralelo a Fase 2-3)
| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 5.1 | Calendario drag-and-drop - Vista semanal editable | 1.5 días |
| 5.2 | CRUD disponibilidad - Crear, editar, eliminar slots | 0.5 día |
| 5.3 | Validación de conflictos - No solapar horarios | 0.5 día |
Entregables Fase 5:
- Tutor puede configurar su disponibilidad semanal
---
FASE 6: Notificaciones y Polish (2-3 días)
> Prioridad: MEDIA-BAJA | Dependencias: Fase 2
| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 6.1 | Notificaciones in-app - Centro de notificaciones | 1 día |
| 6.2 | Recordatorios de sesión - 24h, 1h, 15min, 1min | 1 día |
| 6.3 | Real-time updates - Supabase Realtime para notificaciones | 0.5 día |
Entregables Fase 6:
- Sistema de notificaciones completo
---
📅 Timeline Sugerido
Semana 1:
├── Lunes-Martes:    FASE 1 (Búsqueda + Perfil Tutor)
├── Miércoles-Jueves: FASE 2 (Reservas)
└── Viernes:         FASE 2 (cont.) + inicio FASE 5 (paralelo)
Semana 2:
├── Lunes-Martes:    FASE 3 (Daily.co)
├── Miércoles:       FASE 4 (Post-sesión)
├── Jueves:          FASE 5 (cont. Disponibilidad)
└── Viernes:         FASE 6 (Notificaciones)
Semana 3:
├── Lunes-Martes:    Testing E2E + Bug fixing
└── Miércoles:       Deploy + Monitoring
Total estimado: 13-18 días de desarrollo
---
🛠️ Stack de Componentes por Feature
features/
├── tutors/                    # FASE 1
│   ├── components/
│   │   ├── TutorCard.tsx
│   │   ├── TutorFilters.tsx
│   │   ├── TutorAvailabilityGrid.tsx
│   │   └── TutorReviewsList.tsx
│   ├── hooks.ts               # useTutors, useTutorProfile
│   └── types.ts
│
├── booking/                   # FASE 2
│   ├── components/
│   │   ├── BookingModal.tsx
│   │   ├── DatePicker.tsx
│   │   ├── TimeSlotSelector.tsx
│   │   ├── DurationSelector.tsx
│   │   └── BookingConfirmation.tsx
│   ├── hooks.ts               # useCreateBooking
│   └── booking.store.ts
│
├── sessions/                  # FASE 2-3
│   ├── components/
│   │   ├── SessionCard.tsx
│   │   ├── SessionsList.tsx
│   │   ├── SessionCountdown.tsx
│   │   └── JoinButton.tsx
│   ├── hooks.ts               # useSessions, useJoinSession
│   └── types.ts
│
├── videocall/                 # FASE 3
│   ├── components/
│   │   ├── VideoRoom.tsx      # Daily embed wrapper
│   │   └── CallControls.tsx
│   └── hooks.ts               # useVideoRoom
│
├── reviews/                   # FASE 4
│   ├── components/
│   │   ├── FeedbackModal.tsx
│   │   └── RatingStars.tsx
│   └── hooks.ts               # useCreateReview
│
├── availability/              # FASE 5
│   ├── components/
│   │   ├── AvailabilityCalendar.tsx
│   │   └── TimeSlotEditor.tsx
│   └── hooks.ts
│
└── notifications/             # FASE 6
    ├── components/
    │   ├── NotificationBell.tsx
    │   └── NotificationsList.tsx
    └── hooks.ts
---
🔐 Consideraciones de Seguridad
1. Daily Room Creation: Solo en backend (API Worker) con API key segura
2. Meeting Tokens: Generados server-side con expiración corta
3. Validación de acceso: Solo el estudiante y tutor de la sesión pueden entrar
4. RLS en Supabase: Ya configurado - usuarios solo ven sus sesiones
5. Webhook signature: Validar firma de Daily en webhooks
---
💰 Costos Daily.co
| Plan | Precio | Características |
|------|--------|-----------------|
| Free | $0 | 30 min/sesión, 4 participantes, sin grabación cloud |
| Scale | $0.04/min | Recording cloud, 100+ participantes, API completa |
| Enterprise | Custom | SLA, soporte premium |
Recomendación: Empezar con Scale (pay-as-you-go). Para 100 sesiones de 1 hora = ~$240/mes
---
❓ Decisiones que Necesito de Vos
1. Daily.co Plan: ¿Confirmamos Prebuilt con grabación cloud?
2. Duración de slots: ¿30 min como unidad mínima está bien?
3. Ventana de acceso: ¿5 minutos antes para habilitar botón "Entrar"?
4. Cancelación: 
   - ¿Política de cancelación? (ej: gratis hasta 24h antes, después cobra)
   - ¿Devolver sesión al plan si cancela a tiempo?
5. Recordatorios: ¿24h, 1h, 15min, 1min están bien o querés otros tiempos?
6. Grabaciones: 
   - ¿Cuánto tiempo mantenerlas? (Daily cobra storage)
   - ¿Descargarlas a Supabase Storage después?
7. Orden de prioridad: ¿Empezamos con Fase 1 como propuse o tenés otra prioridad?
---
¿Qué te parece el plan? ¿Ajustamos algo antes de empezar a implementar?