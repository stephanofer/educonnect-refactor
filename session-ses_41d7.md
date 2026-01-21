# Plan de flujo de sesiones y evaluación de video

**Session ID:** ses_41d739496ffeluLnJT50epzgb0
**Created:** 1/21/2026, 4:53:32 PM
**Updated:** 1/21/2026, 4:56:37 PM

---

## User

Elaboremos un plan de implementacion ayudame a diseñarlo utilizando todo tu conociemitno y poder, Nesecito implementar todo el flujo de sesiones dentro de la plataforma, quiero priorizar algo sencillo facil de utilizar pero que cumpla con lo que quiero tienes que analizar todos los posibles, la viabilidad,la sencilles @AGENTS.md, revisa en agents.md todo lo relacionado a sesiones basicamente quiero hacer que un estudiante reserve una sesion con un tutor  en tal hora y estoy pensando que lo que mejor nos conviene es usar daily.co en embed a video chat widget pero me falta evaluar todos los posibles ayudame a detemrinar no implementes nada primero evaluemos todas las features que nesecitamos que lo tienes en agents y ver como lo implementaremos 

---

## Assistant (Software · claude-opus-4.5 · 98.6s)

Perfecto, vamos a hacer esto bien. Déjame explorar primero qué ya tenés implementado en el proyecto para entender el contexto actual y después armamos el plan de batalla.

```
Tool: task

**Input:**
```json
{
  "description": "Explore sessions codebase",
  "prompt": "I need to understand the current state of this EduConnect project, specifically related to sessions/booking functionality.\n\nSearch for and analyze:\n1. Database schema files - look for any existing tables related to sessions, bookings, tutors, availability\n2. Existing components in ui/src/features/ or ui/src/components/ related to sessions, booking, calendar\n3. Any API routes or services related to sessions in api/\n4. Types/interfaces defined for sessions, bookings, tutors\n5. Supabase configuration and existing tables\n6. Any existing Daily.co integration\n\nReport back:\n- What already exists for sessions/booking\n- What database tables are defined (especially in Supabase migrations or schema files)\n- What UI components exist for this flow\n- Any existing integrations (Daily.co, etc.)\n- The overall project structure and what features are already built\n\nThis is a research task - do not write any code.",
  "subagent_type": "explore"
}
```
**Output:**
```
Now I have a comprehensive view of the project. Let me summarize my findings:

---

## EduConnect Project Analysis - Sessions/Booking Functionality

### 1. DATABASE SCHEMA (Supabase)

**Existing Tables Related to Sessions/Booking:**

| Table | Status | Description |
|-------|--------|-------------|
| `sessions` | **DEFINED** | Full table with all needed columns |
| `tutor_availability` | **DEFINED** | Weekly availability slots (day_of_week, start_time, end_time) |
| `tutor_profiles` | **DEFINED** | Tutor info with rating, hourly_rate, specialties |
| `subjects` | **DEFINED** | Course/subject catalog with seed data |
| `tutor_subjects` | **DEFINED** | Many-to-many tutor-subject relationship |
| `subscriptions` | **DEFINED** | Tracks sessions_remaining, plan info |
| `reviews` | **DEFINED** | Post-session feedback |
| `notifications` | **DEFINED** | Session reminder notification types defined |
| `plans` | **DEFINED** | 3 plans seeded (Basic/Premium/Ultra) |

**Sessions Table Schema (lines 172-196 of migration):**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  tutor_id UUID NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  subscription_id UUID REFERENCES subscriptions(id),
  status session_status (pending/confirmed/in_progress/completed/cancelled),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  description TEXT,
  notes TEXT,
  meeting_url TEXT,           -- For Daily.co
  meeting_room_name TEXT,     -- For Daily.co
  recording_url TEXT,
  summary TEXT,
  price DECIMAL,
  cancelled_by UUID,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Tutor Availability Table:**
```sql
CREATE TABLE tutor_availability (
  id UUID,
  tutor_id UUID,
  day_of_week INTEGER (0-6),
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN
);
```

---

### 2. UI COMPONENTS STATUS

| Component/Page | Status | Location |
|----------------|--------|----------|
| `MySessionsPage` | **PLACEHOLDER** | `/ui/pages/dashboard/MySessionsPage.tsx` |
| `TutorSessionsPage` | **PLACEHOLDER** | `/ui/pages/tutor/TutorSessionsPage.tsx` |
| `TutorAvailabilityPage` | **PLACEHOLDER** | `/ui/pages/tutor/TutorAvailabilityPage.tsx` |
| `SearchTutorsPage` | **PLACEHOLDER** | `/ui/pages/dashboard/SearchTutorsPage.tsx` |
| `StudentDashboardHome` | **IMPLEMENTED** | Full dashboard with session stats, upcoming sessions display |
| `TutorDashboardHome` | **IMPLEMENTED** | Full dashboard with today's sessions, earnings charts |
| `Calendar` (shadcn) | **EXISTS** | `/ui/components/shadcn/calendar.tsx` - react-day-picker based |

**What's Implemented:**
- Dashboard hooks that query sessions table (`use-student-dashboard.ts`, `use-tutor-dashboard.ts`)
- Session display on both dashboards (shows upcoming/today's sessions)
- Subscription management (`subscription.store.ts`)
- Auth with role-based routing (student vs tutor)
- Library/materials CRUD

**What's NOT Implemented (Placeholder pages):**
- Session booking flow
- Tutor search with filters
- Tutor availability configuration (drag-and-drop calendar)
- Session management (cancel/reschedule)
- Booking confirmation
- Videocall room page

---

### 3. TYPES DEFINED

**Location:** `/ui/types/index.ts`

```typescript
// Session types
type SessionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface Session {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  description?: string;
  meeting_url?: string;
  recording_url?: string;
  summary?: string;
  created_at: string;
}

interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number; // 0-6
  start_time: string;  // HH:mm
  end_time: string;
  is_active: boolean;
}

interface TutorProfile {
  id: string;
  user_id: string;
  university: string;
  career: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  total_sessions: number;
  is_verified: boolean;
  is_available: boolean;
  recommendation_rate: number;
}
```

---

### 4. API ROUTES

**Location:** `/api/`

**Currently Only Exists:**
- `/api/chat` - AI chatbot endpoints (Cloudflare Workers AI)
- No session/booking API routes yet

The project uses Supabase directly from the frontend for most operations (as per AGENTS.md: "SUPABASE FOR ALL BACKEND NEEDS").

---

### 5. DAILY.CO INTEGRATION

**Status:** NOT IMPLEMENTED

**What Exists:**
- Documentation in `SUPABASE_SETUP.md` mentions Daily.co setup (line 241)
- Database columns ready: `meeting_url`, `meeting_room_name`, `recording_url` in sessions table
- Storage bucket `session-recordings` configured

**What's Missing:**
- No Daily.co API integration code
- No videocall room component
- No room creation logic

---

### 6. EXISTING STORES

| Store | Location | Purpose |
|-------|----------|---------|
| `auth.store.ts` | `/ui/stores/auth.store.ts` | User auth, profile, roles |
| `subscription.store.ts` | `/ui/stores/subscription.store.ts` | Plan purchase, upgrade, cancel |

**No session booking store exists yet.**

---

### 7. PROJECT ROUTES

**Student Routes (`/dashboard/`):**
- `/dashboard` - StudentDashboardHome (implemented)
- `/dashboard/buscar-tutores` - SearchTutorsPage (placeholder)
- `/dashboard/mis-sesiones` - MySessionsPage (placeholder)
- `/dashboard/materiales` - MaterialsPage
- `/dashboard/biblioteca` - LibraryPage (implemented)
- `/dashboard/planes` - PlansPage (implemented)
- `/dashboard/notificaciones` - NotificationsPage
- `/dashboard/configuracion` - SettingsPage
- `/dashboard/perfil` - ProfilePage

**Tutor Routes (`/tutor/`):**
- `/tutor/dashboard` - TutorDashboardHome (implemented)
- `/tutor/sesiones` - TutorSessionsPage (placeholder)
- `/tutor/disponibilidad` - TutorAvailabilityPage (placeholder)
- `/tutor/ganancias` - TutorEarningsPage
- `/tutor/estudiantes` - TutorStudentsPage
- `/tutor/resenas` - TutorReviewsPage
- `/tutor/configuracion` - SettingsPage
- `/tutor/perfil` - ProfilePage

---

### 8. WHAT NEEDS TO BE BUILT FOR SESSIONS/BOOKING

1. **Search Tutors Page:**
   - Tutor cards with filters (subject, university, availability, price, rating)
   - Favorites toggle
   - Pagination

2. **Tutor Profile Page:**
   - Full tutor profile view
   - Weekly availability calendar
   - Reviews section
   - "Reservar sesion" CTA

3. **Booking Flow:**
   - Date selector (available days highlighted)
   - Time slot selector (30min/1hr increments)
   - Duration selector
   - Subject dropdown
   - Description textarea
   - Session deduction from plan

4. **My Sessions Page (Student):**
   - Upcoming/Past/Cancelled tabs
   - Session cards with countdown
   - Cancel/reschedule actions
   - Enter room button (5 min before)

5. **Tutor Sessions Page:**
   - Today's sessions
   - Upcoming sessions
   - Past sessions
   - Session management

6. **Tutor Availability Page:**
   - Drag-and-drop weekly calendar
   - CRUD for time slots

7. **Videocall Room:**
   - Daily.co integration
   - Room creation on booking confirmation
   - Recording management

8. **Notification System:**
   - Session reminders (24h, 1h, 15min, 1min before)
   - Real-time notifications

---

### SUMMARY

| Area | Status |
|------|--------|
| Database Schema | **COMPLETE** - All tables defined with RLS |
| TypeScript Types | **MOSTLY COMPLETE** - Core types exist |
| Dashboard Display | **IMPLEMENTED** - Shows session stats |
| Booking Flow | **NOT STARTED** - All placeholder pages |
| Tutor Search | **NOT STARTED** - Placeholder |
| Availability Config | **NOT STARTED** - Placeholder |
| Session Management | **NOT STARTED** - Placeholder |
| Daily.co Integration | **NOT STARTED** - Only DB columns ready |
| Notifications | **NOT STARTED** - Schema exists |

<task_metadata>
session_id: ses_41d73692effeymjtJ5hRrLkYL2
</task_metadata>
```
```

```
Tool: context7_resolve-library-id

**Input:**
```json
{
  "libraryName": "daily-co",
  "query": "Daily.co video call SDK embed integration for React application"
}
```
**Output:**
```
Available Libraries:

Each result includes:
- Library ID: Context7-compatible identifier (format: /org/project)
- Name: Library or package name
- Description: Short summary
- Code Snippets: Number of available code examples
- Source Reputation: Authority indicator (High, Medium, Low, or Unknown)
- Benchmark Score: Quality indicator (100 is the highest score)
- Versions: List of versions if available. Use one of those versions if the user provides a version in their query. The format of the version is /org/project/version.

For best results, select libraries based on name match, source reputation, snippet coverage, benchmark score, and relevance to your use case.

----------

- Title: Daily
- Context7-compatible library ID: /websites/daily_co
- Description: Daily provides an API and SDKs for developers to build or embed custom video and audio chat applications, offering features like prebuilt widgets, mobile support, audio-only calls, and AI-powered workflows.
- Code Snippets: 4271
- Source Reputation: High
- Benchmark Score: 76.2
----------
- Title: Daily React
- Context7-compatible library ID: /daily-co/daily-react
- Description: Daily React simplifies the integration of Daily's real-time video and audio APIs into React applications, providing hooks and components for easy management of participants and call states.
- Code Snippets: 16
- Source Reputation: High
----------
- Title: Daily Client SDK for Flutter
- Context7-compatible library ID: /websites/daily_co_reference_flutter
- Description: The Daily Client SDK for Flutter provides tools to integrate real-time video and audio communication features, such as rooms, participants, recordings, and live streaming, into Flutter applications.
- Code Snippets: 8575
- Source Reputation: High
----------
- Title: Daily REST API
- Context7-compatible library ID: /websites/docs_daily_co-reference-rest-api
- Description: The Daily REST API provides endpoints for developers to programmatically manage Daily rooms, meeting tokens, recordings, live streams, transcriptions, and other call-related features like domains, metrics, and logs.
- Code Snippets: 358
- Source Reputation: High
- Benchmark Score: 72.7
----------
- Title: Daily Client SDK for Python
- Context7-compatible library ID: /daily-co/daily-python
- Description: The Daily client SDK for Python enables developers to integrate voice and video calling into desktop and server applications, supporting features like joining meetings, configuring inputs, and managing recordings.
- Code Snippets: 76
- Source Reputation: High
- Benchmark Score: 18.2
```
```

---

## Assistant (Software · claude-opus-4.5 · 6.4s)

Excelente, ahora busco la documentación de Daily.co para tener todo el panorama completo:

```
Tool: context7_query-docs

**Input:**
```json
{
  "libraryId": "/daily-co/daily-react",
  "query": "How to embed video call with prebuilt UI, create room, join room with recording enabled"
}
```
**Output:**
```
### Initializing Daily React with DailyProvider (JSX)

Source: https://github.com/daily-co/daily-react/blob/main/README.md

Demonstrates how to wrap your React application with the DailyProvider component, passing the room URL to establish the initial Daily context.

```jsx
import { DailyProvider } from '@daily-co/daily-react';

function App({ roomUrl }) {
  return <DailyProvider url={roomUrl}>{/* … */}</DailyProvider>;
}
```

--------------------------------

### Initializing Daily Call Object with useDaily (TSX)

Source: https://github.com/daily-co/daily-react/blob/main/API_PROPOSAL.md

Initializes a Daily `callObject` instance. This is the primary hook for configuration, automatically handling required parameters for `join` and `preAuth`. It accepts a `UseDailyArgs` object for various settings.

```tsx
interface UseDailyArgs {
  audioSource?: boolean | string | MediaStreamTrack;
  experimentalChromeVideoMuteLightOff?: boolean;
  receiveSettings?: object;
  subscribeToTracksAutomatically?: boolean;
  token?: string;
  url: string;
  userName?: string;
  videoSource?: boolean | string | MediaStreamTrack;
}
useDaily(args: UseDailyArgs): DailyCall;
```

--------------------------------

### Managing Call Recording with useRecording (TSX)

Source: https://github.com/daily-co/daily-react/blob/main/API_PROPOSAL.md

Provides the current recording state and related information. It includes methods to start and stop recordings, accepting options similar to the daily-js equivalent, and supports arguments for handling various recording events.

```tsx
interface UseRecordingArgs {
  onRecordingData?(ev: DailyEvent): void;
  onRecordingError?(ev: DailyEvent): void;
  onRecordingStarted?(ev: DailyEvent): void;
  onRecordingStats?(ev: DailyEvent): void;
  onRecordingStopped?(ev: DailyEvent): void;
  onRecordingUploadCompleted?(ev: DailyEvent): void;
}
useRecording(): {
  isRecording: boolean; // whether the call is being recorded
  startRecording(): void; // Accepts same options as daily-js equivalent
  stopRecording(); void;
}
```
```
```

```
Tool: context7_query-docs

**Input:**
```json
{
  "libraryId": "/websites/docs_daily_co-reference-rest-api",
  "query": "Create room API endpoint with recording enabled, meeting token generation, room configuration options"
}
```
**Output:**
```
### POST /rooms

Source: https://docs.daily.co/reference/rest-api/rooms

Create a new room with optional configuration properties.

```APIDOC
## POST /rooms

### Description
Creates a new room. You can specify configuration properties during creation. Rooms can be created manually or via this API endpoint.

### Method
POST

### Endpoint
/rooms

### Parameters
#### Request Body
- **name** (string) - Required - The name for the new room.
- **privacy** (string) - Optional - The privacy setting for the room (e.g., "public"). Defaults to "public".
- **config** (object) - Optional - Configuration object for the room.
  - **max_participants** (integer) - Optional - Maximum number of participants.
  - **nbf** (integer) - Optional - 'Not before' timestamp (Unix epoch seconds).
  - **exp** (integer) - Optional - 'Expires' timestamp (Unix epoch seconds).
  - **start_video_off** (boolean) - Optional - If true, video starts off by default.
  - **enable_recording** (string) - Optional - Recording configuration (e.g., 'cloud').
  - **eject_at_room_exp** (boolean) - Optional - If true, participants are ejected when the room expires.

### Request Example
```json
{
  "name": "my-new-room",
  "privacy": "private",
  "config": {
    "max_participants": 10,
    "exp": 1678886400,
    "start_video_off": true
  }
}
```

### Response
#### Success Response (200)
- **id** (string) - Unique identifier for the created room.
- **url** (string) - The URL for the new room.
- Other properties of the room object as described above.

#### Response Example
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "name": "my-new-room",
  "privacy": "private",
  "url": "https://<your-domain>.daily.co/my-new-room",
  "created_at": "2023-03-15T10:00:00.000Z",
  "config": {
    "max_participants": 10,
    "exp": 1678886400,
    "start_video_off": true
  }
}
```
```

--------------------------------

### POST /v1/rooms - Create a private room with devices turned off

Source: https://docs.daily.co/reference/rest-api/rooms/create-room

Creates a private room with a human-readable name. By default, both the camera and microphone for all participants will be turned off at the start of the call. Access can be controlled using meeting tokens.

```APIDOC
## POST /v1/rooms

### Description
Creates a private room with a specified name and initial media settings (audio/video off).

### Method
POST

### Endpoint
https://api.daily.co/v1/rooms/

### Parameters
#### Request Body
- **name** (string) - Required - A human-readable name for the room.
- **privacy** (string) - Required - The privacy setting for the room ('private' or 'public').
- **properties** (object) - Optional - Contains room-specific properties.
  - **start_audio_off** (boolean) - Optional - If true, audio will be off by default for participants.
  - **start_video_off** (boolean) - Optional - If true, video will be off by default for participants.

### Request Example
```bash
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -XPOST -d \
     '{"name": "getting-started-webinar",
       "privacy": "private",
       "properties" : {
          "start_audio_off":true,
          "start_video_off":true}}' \
     https://api.daily.co/v1/rooms/
```

### Response
#### Success Response (200)
(Details not provided in the source text, but would typically include the created room object, with only non-default config options shown)

#### Error Response (400)
(Details not provided in the source text, but would typically indicate a bad request)
```

--------------------------------

### Create a private room with devices off at start (cURL)

Source: https://docs.daily.co/reference/rest-api/rooms/create-room

Shows how to create a private Daily room with a specific name and configure it so that all participants' cameras and microphones are turned off by default upon joining. This is useful for controlled meeting environments.

```bash
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -XPOST -d \
     '{"name": "getting-started-webinar",
       "privacy": "private",
       "properties" : {
          "start_audio_off":true,
          "start_video_off":true}}' \
     https://api.daily.co/v1/rooms/
```

--------------------------------

### Example Meeting Token Object

Source: https://docs.daily.co/reference/rest-api/meeting-tokens

This JSON object demonstrates the structure and common properties found in a Daily meeting token. Properties control session configuration such as expiration time, room name, user details, and feature enablement.

```json
{
  // example meeting token object
  "exp": 1548633621,
  "room_name": "hello",
  "user_name": "A. User",
  "is_owner": true,
  "close_tab_on_exit": true,
  "enable_recording": "cloud",
  "start_video_off": true
}
```

--------------------------------

### Meeting Token Object Structure

Source: https://docs.daily.co/reference/rest-api/meeting-tokens

An example of a Daily meeting token object, illustrating the key-value pairs used for configuration.

```APIDOC
## Meeting Token Object

### Description
Represents a meeting token used to control access and configuration for a participant in a Daily meeting.

### Parameters
#### Request Body
- **exp** (integer) - Optional - The expiration timestamp of the token.
- **room_name** (string) - Required - The name of the room the token grants access to.
- **user_name** (string) - Optional - The display name of the user.
- **is_owner** (boolean) - Optional - Whether the user is the owner of the room.
- **close_tab_on_exit** (boolean) - Optional - Whether to close the tab when the user exits.
- **enable_recording** (string) - Optional - Enables recording for the user ('cloud' or 'local').
- **start_video_off** (boolean) - Optional - Whether the user's video should start off.

### Request Example
```json
{
  "exp": 1548633621,
  "room_name": "hello",
  "user_name": "A. User",
  "is_owner": true,
  "close_tab_on_exit": true,
  "enable_recording": "cloud",
  "start_video_off": true
}
```

### Response
#### Success Response (200)
- **Meeting Token Object** (object) - The structured meeting token.

#### Response Example
```json
{
  "exp": 1548633621,
  "room_name": "hello",
  "user_name": "A. User",
  "is_owner": true,
  "close_tab_on_exit": true,
  "enable_recording": "cloud",
  "start_video_off": true
}
```
```
```
```

---

## Assistant (Software · claude-opus-4.5 · 80.0s)

Ahora tengo todo el panorama. Déjame elaborarte el plan de implementación completo:

---

# 🎯 Plan de Implementación: Flujo Completo de Sesiones

## 📊 Estado Actual del Proyecto

| Componente | Estado |
|------------|--------|
| **Schema de DB (Supabase)** | ✅ COMPLETO - Todas las tablas definidas con RLS |
| **Types TypeScript** | ✅ COMPLETO - Session, TutorAvailability, TutorProfile |
| **Dashboard Display** | ✅ IMPLEMENTADO - Muestra stats de sesiones |
| **Flujo de Reserva** | ❌ NO INICIADO - Solo placeholders |
| **Búsqueda de Tutores** | ❌ NO INICIADO - Placeholder |
| **Configuración Disponibilidad** | ❌ NO INICIADO - Placeholder |
| **Gestión de Sesiones** | ❌ NO INICIADO - Placeholder |
| **Integración Daily.co** | ❌ NO INICIADO - Solo columnas en DB listas |

---

## 🔄 Flujo Completo de Usuario (End-to-End)

```
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
```

---

## 🎬 Análisis de Daily.co - Opciones de Integración

### Opción A: Daily Prebuilt (RECOMENDADO ✅)
```
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
```

### Opción B: Daily React Custom UI
```
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
```

### Opción C: Híbrido (Prebuilt + Customización)
```
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
```

### **Mi Recomendación: Opción A (Daily Prebuilt)**

Para tu MVP y dado que:
1. La grabación automática es crítica (viene incluida)
2. El foco es la funcionalidad, no reinventar videollamadas
3. Necesitás ir rápido al mercado
4. Siempre podés migrar a custom después

---

## 🗂️ Arquitectura Propuesta

### Backend (Cloudflare Worker + Supabase)

```
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
```

### Frontend (Supabase directo)

```
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
```

---

## 📦 Fases de Implementación

### **FASE 1: Fundación (3-4 días)**
> Prioridad: ALTA | Dependencias: Ninguna

| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 1.1 | **Búsqueda de Tutores** - Page con filtros, cards, paginación | 1 día |
| 1.2 | **Perfil de Tutor Público** - Vista detallada, disponibilidad visual, reseñas | 1 día |
| 1.3 | **Hooks de queries** - useTutors, useTutorProfile, useTutorAvailability | 0.5 día |
| 1.4 | **Store de booking** - useBookingStore (draft de reserva) | 0.5 día |

**Entregables Fase 1:**
- Estudiante puede buscar y ver perfiles de tutores
- Calendario semanal de disponibilidad visible

---

### **FASE 2: Reservas (3-4 días)**
> Prioridad: ALTA | Dependencias: Fase 1

| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 2.1 | **Booking Modal/Page** - Selector fecha, hora, duración, materia | 1.5 días |
| 2.2 | **Validación de slots** - Calcular slots libres basado en disponibilidad | 0.5 día |
| 2.3 | **Confirmación de reserva** - Crear sesión + descontar de plan | 0.5 día |
| 2.4 | **My Sessions Page (Estudiante)** - Lista con tabs, countdown, acciones | 1 día |
| 2.5 | **Tutor Sessions Page** - Vista de sesiones programadas | 0.5 día |

**Entregables Fase 2:**
- Estudiante puede reservar sesión completa
- Descuento automático de sesiones del plan
- Vista de próximas sesiones para ambos roles

---

### **FASE 3: Daily.co Integration (2-3 días)**
> Prioridad: ALTA | Dependencias: Fase 2

| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 3.1 | **API endpoint crear room** - POST /api/sessions/:id/room | 0.5 día |
| 3.2 | **API endpoint join** - GET /api/sessions/:id/join (token temporal) | 0.5 día |
| 3.3 | **VideoRoom Page** - Embed de Daily Prebuilt | 0.5 día |
| 3.4 | **Botón "Entrar a sala"** - Habilitado 5 min antes | 0.5 día |
| 3.5 | **Webhook recordings** - Capturar URL de grabación | 0.5 día |

**Entregables Fase 3:**
- Videollamada funcional entre estudiante y tutor
- Grabación automática guardada

---

### **FASE 4: Post-Sesión y Feedback (1-2 días)**
> Prioridad: MEDIA | Dependencias: Fase 3

| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 4.1 | **Redirect post-llamada** - Detectar meeting.ended | 0.5 día |
| 4.2 | **Feedback Modal** - Rating 5 estrellas + tags + comentario | 0.5 día |
| 4.3 | **Actualizar rating** - Trigger en DB o lógica frontend | 0.5 día |

**Entregables Fase 4:**
- Sistema de reviews funcional
- Rating de tutores actualizado automáticamente

---

### **FASE 5: Disponibilidad del Tutor (2-3 días)**
> Prioridad: MEDIA | Dependencias: Ninguna (paralelo a Fase 2-3)

| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 5.1 | **Calendario drag-and-drop** - Vista semanal editable | 1.5 días |
| 5.2 | **CRUD disponibilidad** - Crear, editar, eliminar slots | 0.5 día |
| 5.3 | **Validación de conflictos** - No solapar horarios | 0.5 día |

**Entregables Fase 5:**
- Tutor puede configurar su disponibilidad semanal

---

### **FASE 6: Notificaciones y Polish (2-3 días)**
> Prioridad: MEDIA-BAJA | Dependencias: Fase 2

| Tarea | Descripción | Estimado |
|-------|-------------|----------|
| 6.1 | **Notificaciones in-app** - Centro de notificaciones | 1 día |
| 6.2 | **Recordatorios de sesión** - 24h, 1h, 15min, 1min | 1 día |
| 6.3 | **Real-time updates** - Supabase Realtime para notificaciones | 0.5 día |

**Entregables Fase 6:**
- Sistema de notificaciones completo

---

## 📅 Timeline Sugerido

```
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
```

**Total estimado: 13-18 días de desarrollo**

---

## 🛠️ Stack de Componentes por Feature

```
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
```

---

## 🔐 Consideraciones de Seguridad

1. **Daily Room Creation**: Solo en backend (API Worker) con API key segura
2. **Meeting Tokens**: Generados server-side con expiración corta
3. **Validación de acceso**: Solo el estudiante y tutor de la sesión pueden entrar
4. **RLS en Supabase**: Ya configurado - usuarios solo ven sus sesiones
5. **Webhook signature**: Validar firma de Daily en webhooks

---

## 💰 Costos Daily.co

| Plan | Precio | Características |
|------|--------|-----------------|
| **Free** | $0 | 30 min/sesión, 4 participantes, sin grabación cloud |
| **Scale** | $0.04/min | Recording cloud, 100+ participantes, API completa |
| **Enterprise** | Custom | SLA, soporte premium |

**Recomendación**: Empezar con **Scale** (pay-as-you-go). Para 100 sesiones de 1 hora = ~$240/mes

---

## ❓ Decisiones que Necesito de Vos

1. **Daily.co Plan**: ¿Confirmamos Prebuilt con grabación cloud?

2. **Duración de slots**: ¿30 min como unidad mínima está bien?

3. **Ventana de acceso**: ¿5 minutos antes para habilitar botón "Entrar"?

4. **Cancelación**: 
   - ¿Política de cancelación? (ej: gratis hasta 24h antes, después cobra)
   - ¿Devolver sesión al plan si cancela a tiempo?

5. **Recordatorios**: ¿24h, 1h, 15min, 1min están bien o querés otros tiempos?

6. **Grabaciones**: 
   - ¿Cuánto tiempo mantenerlas? (Daily cobra storage)
   - ¿Descargarlas a Supabase Storage después?

7. **Orden de prioridad**: ¿Empezamos con Fase 1 como propuse o tenés otra prioridad?

---

¿Qué te parece el plan? ¿Ajustamos algo antes de empezar a implementar?

---

