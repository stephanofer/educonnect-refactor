EduConnect is A modern web platform connecting university students with verified tutors for personalized online academic coaching.

### Tech Stack by Components

MOST IMPORTANT WE USE SUPABASE FOR ALL BACKEND NEEDS (AUTH, DB, STORAGE), AND ONLY /api `api/` USE FOR AI 


### No negociables

- Todos los UI tiene que ser responsive
- Para los forumarios tienen que siempre estar con sus validaciones estamos usando zod + reac hook form + Si esque es un form chico simplemente con los elementos normales si son form mas complejos usar los componentes de shadcn
- Si necesitas un componente siempre revisa que el componente si lo tiene shadcn usa el de shadcn si no implementalo tu mismo pero siempre verifica si shadcn ya lo tiene para que ya no crees tu mismo 
-Si tiene todo el sentido del mundo utiliza Tanstack Query para las peticiones si determinas quen no hace falta entonces no lo utilices.

### Features

Funcionalidades
**1. Autenticación y Perfiles:**
- Registro/login con email 
- Perfiles separados: estudiante vs tutor
- Onboarding diferenciado por rol
- Upload de foto de perfil

**2. Dashboard Estudiante:**
- Vista de próximas sesiones con countdown
- Historial de sesiones completadas
- Acceso rápido a grabaciones y resúmenes
- Indicador de sesiones restantes del plan actual

**3. Búsqueda y Filtrado de Tutores:**
- Búsqueda por materia (autocomplete)
- Filtros: Universidad, Disponibilidad (ahora/hoy/esta semana), Precio, Calificación
- Cards de tutores con: foto, nombre, universidad, especialidades, rating, disponibilidad
- Sistema de favoritos (toggle heart icon)
- Paginación

**4. Perfil Detallado de Tutor:**
- Bio completa
- Especialidades (tags)
- Universidad y carrera verificada (badge)
- Rating promedio + número de reseñas
- Calendario semanal de disponibilidad (vista gráfica)
- Últimas 5 reseñas con opción "Ver todas"
- Estadísticas: sesiones completadas, tasa de recomendación
- Botón CTA grande: "Reservar sesión"

**5. Sistema de Reservas:**
- Selector de fecha (calendario con días disponibles destacados)
- Slots de horarios disponibles ese día (cada 30 min o 1 hr)
- Selector de duración (30min, 1hr, 1.5hr, 2hr)
- Dropdown: materia/curso
- Campo textarea: ¿En qué necesitas ayuda?" (descripción de duda)
- Verificación de sesiones disponibles en plan

**6. Sistema de Pagos (Suscripciones):**
- No se realizara nionguna integracion con pasarela de pagos
- Quiero que simules que cuando el des a adquirir plan se haga el pago se confirme y se le de el plan esto es simualdo los planes son de 3 planes: Básico (S/ 29.90), Premium (S/ 59.90), Ultra (S/ 99.90)
- Compra de sesiones extra como one-time payment
- Historial de pagos y facturas descargables
- Cancelación de plan desde dashboard

**7. Confirmación y Recordatorios:**
- Notificación in-app cuando quedan 1 minuto parea empezar

**8. Sala de Videollamada:**
- Integración con Daily.co:
  - Crear room al confirmar sesión
  - Link único de acceso para estudiante y tutor
  - Botón "Entrar a sala" habilitado 5 min antes
  - Grabación automática activada server-side
  - 
**9. Post-Sesión:**
- Redirect automático a página de feedback al terminar
- Modal de calificación (5 estrellas + comentario opcional)
- Tags rápidos: Paciente, Claro, Puntual, Preparado
- Guardar review en DB y actualizar rating promedio del tutor
10.Seccion de materiales de estudio, 
- Aca apareceran todo lo relacionado por sesiones por ejemplo el tutor dejo archivos pdfs o lo que sea para que el alumno lo estudie 
**13. Sistema de Notificaciones:**
- Notificaciones in-app en un icono que diga notifiaciones
- Centro de notificaciones con badge de no leídas
- Tipos:
  - Nueva sesión confirmada
  - Recordatorio de sesión (24hr, 1hr, 15min. 30 segundops 10 segundos)
  - Tutor canceló/reprogramó
**15. Biblioteca Virtual:**
- CRUD de materiales de estudio
- Categorización por materia
- Upload de PDFs, videos, links
- Buscador con filtros
- privada (solo estudiantes con plan activo)

**14. Panel de Tutor **
- Dashboard con sesiones programadas
- Configuración de disponibilidad (calendario drag-and-drop)
- Estadísticas de ingresos
- Gestión de perfil
- Ver reseñas recibidas



### Auto invoke skills

When performing these actions, ALWAYS invoke the corresponding skills FIRST:

| Action | Skill |
|--------|-------|
| Creating Zod schemas | `zod-4` |
| Using Zustand stores | `zustand-5` |
| Working with Tailwind classes | `tailwind-4` |
| Working with motion | `motion` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |
| Using Cloudflare Workers AI | `cloudflare-workers-ai` |
| knowledge for Cloudflare Workers | `cloudflare-workers` |



| Component                 | Location              | Tech Stack                                                                                                                                        |
| ------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend React App        | `ui/`                 | React 19 + Vite, TanStack Query, React Router with data mode, Tailwind 4, zustand, zod, shadcn, react-hook-form, motion, TanStack Table, recharts |
| Backend Cloudflare Worker | `api/`                |                                        |  |

### Project structure 

- For ui Component `ui/`
```

New/Existing UI? → shadcn/ui + Tailwind
Used 1 feature? → features/{feature}/components | Used 2+? → components/{domain}/
Types (shared 2+) → types/{domain}.ts | Types (local 1) → {feature}/types.ts
Utils (shared 2+) → lib/ | Utils (local 1) → {feature}/utils/
Hooks (shared 2+) → hooks/ | Hooks (local 1) → {feature}/hooks.ts
shadcn components → components/shadcn/
styles globals in `/styles/`
```

- For api Component `api/`

```
api/  
│ ├── index.ts # App entry point  
│ │  
│ ├── schemas/ # Zod schemas (single source of truth)  
│ │ └── user.schema.ts  
│ │  
│ ├── controllers/ # HTTP handlers (thin layer)  
│ │ └── user.controller.ts  
│ │  
│ ├── services/ # Business logic (no HTTP details)  
│ │ └── user.service.ts  
│ │  
│ ├── middlewares/ # Auth, logging, error handling  
│ │ └── auth.middleware.ts  
│ │  
│ ├── models/ # Database models/DTOs  
│ │ └── user.model.ts  
│ │  
│ ├── core/ # Utilities and helpers  
│ │ ├── logger.ts  
│ │ ├── mailer.ts  
│ │ └── auth.ts  
│ │  
│ ├── exceptions/ # Custom error classes  
│ │ └── http-exceptions.ts  
│ │  
│ ├── crons/ # Background jobs  
│ │ └── cleanup.cron.ts  
│ │  
│ └── db/ # Database setup  
│ └── index.ts  
│  
└── tests/ # Mirrors api/ structure  
├── controllers/  
├── services/  
└── core/
```

### Project Alias

For references imports use `@/ui` for componente `ui` and use `@/api` for component `api` 


