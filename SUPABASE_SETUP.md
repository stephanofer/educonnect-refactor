# Configuracion de Supabase para EduConnect

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en "New Project"
3. Configura:
   - **Name:** `educonnect`
   - **Database Password:** (genera una segura y guardala)
   - **Region:** South America (Sao Paulo) - mas cercano a Peru
4. Espera a que el proyecto se cree (~2 minutos)

## 2. Obtener Credenciales

1. Ve a **Settings > API**
2. Copia estos valores:
   - `Project URL` (ej: `https://xxxxx.supabase.co`)
   - `anon public` key
   - `service_role` key (solo para backend)

## 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raiz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Solo para el worker API (no exponer en frontend)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

Para Cloudflare Workers, agrega los secrets:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## 4. Ejecutar Migraciones

### Opcion A: Desde Supabase Dashboard (Recomendado para empezar)

1. Ve a **SQL Editor** en el dashboard de Supabase
2. Copia el contenido de `supabase/migrations/00001_initial_schema.sql`
3. Pega y ejecuta (click en "Run")

### Opcion B: Usando Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar proyecto
supabase link --project-ref tu-project-ref

# Ejecutar migraciones
supabase db push
```

## 5. Configurar Autenticacion

### 5.1 Habilitar Email Auth

1. Ve a **Authentication > Providers**
2. Asegurate que **Email** este habilitado
3. Configura:
   - **Confirm email:** ON (recomendado para produccion)
   - **Secure email change:** ON

### 5.2 Configurar Google OAuth (Opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Ve a **APIs & Services > Credentials**
4. Crea **OAuth 2.0 Client ID**:
   - Tipo: Web application
   - Authorized redirect URIs: `https://tu-proyecto.supabase.co/auth/v1/callback`
5. Copia Client ID y Client Secret
6. En Supabase, ve a **Authentication > Providers > Google**
7. Pega las credenciales

### 5.3 Configurar Redirect URLs

1. Ve a **Authentication > URL Configuration**
2. Configura:
   - **Site URL:** `http://localhost:5173` (dev) / tu dominio de produccion
   - **Redirect URLs:** 
     - `http://localhost:5173/auth/callback`
     - `https://tu-dominio.com/auth/callback`

## 6. Configurar Storage (para archivos)

1. Ve a **Storage**
2. Crea estos buckets:

### Bucket: `avatars`
```sql
-- Politica para avatares
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Bucket: `materials`
```sql
-- Politica para materiales de estudio
CREATE POLICY "Materials are accessible to authenticated users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'materials' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Tutors can upload materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'materials' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'tutor'
  )
);
```

### Bucket: `recordings`
```sql
-- Politica para grabaciones (privadas)
CREATE POLICY "Session participants can view recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'recordings' AND
  EXISTS (
    SELECT 1 FROM sessions 
    WHERE recording_url LIKE '%' || name || '%'
    AND (student_id = auth.uid() OR tutor_id = auth.uid())
  )
);
```

## 7. Instalar Cliente en el Proyecto

```bash
pnpm add @supabase/supabase-js
```

## 8. Crear Cliente de Supabase

Crea el archivo `ui/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/ui/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

## 9. Generar Tipos TypeScript (Opcional pero Recomendado)

```bash
# Instalar CLI si no lo tienes
npm install -g supabase

# Generar tipos
supabase gen types typescript --project-id tu-project-ref > ui/types/database.ts
```

## 10. Estructura de Tablas

| Tabla | Descripcion |
|-------|-------------|
| `profiles` | Datos basicos de usuarios (extiende auth.users) |
| `student_profiles` | Perfil extendido de estudiantes |
| `tutor_profiles` | Perfil extendido de tutores |
| `subjects` | Materias/cursos disponibles |
| `tutor_subjects` | Relacion tutores-materias |
| `tutor_availability` | Horarios disponibles de tutores |
| `plans` | Planes de suscripcion |
| `subscriptions` | Suscripciones activas de usuarios |
| `sessions` | Sesiones de tutoria |
| `reviews` | Resenas de sesiones |
| `favorites` | Tutores favoritos de estudiantes |
| `payments` | Historial de pagos |
| `notifications` | Notificaciones in-app |
| `materials` | Materiales de estudio |
| `material_access` | Acceso a materiales por estudiante |
| `chat_messages` | Mensajes del chatbot |

## 11. Funcionalidades por Implementar

Checklist de integraciones con Supabase:

- [ ] **Auth:** Login/Registro con email
- [ ] **Auth:** Login con Google
- [ ] **Auth:** Recuperar contrasena
- [ ] **Profiles:** CRUD de perfiles
- [ ] **Tutors:** Listado y busqueda
- [ ] **Tutors:** Perfil publico
- [ ] **Sessions:** Crear reserva
- [ ] **Sessions:** Ver mis sesiones
- [ ] **Sessions:** Cancelar/reprogramar
- [ ] **Subscriptions:** Adquirir plan
- [ ] **Subscriptions:** Ver estado
- [ ] **Payments:** Historial
- [ ] **Reviews:** Crear resena
- [ ] **Favorites:** Guardar/quitar favoritos
- [ ] **Notifications:** Listar y marcar leidas
- [ ] **Materials:** Subir/ver materiales
- [ ] **Storage:** Upload de avatares
- [ ] **Storage:** Upload de materiales
- [ ] **Realtime:** Notificaciones en tiempo real

## 12. Daily.co para Videollamadas

1. Crea cuenta en [daily.co](https://daily.co)
2. Obtiene tu API Key
3. Agrega a las variables de entorno:
   ```env
   DAILY_API_KEY=tu-daily-api-key
   ```
4. Configura en Cloudflare Workers:
   ```bash
   npx wrangler secret put DAILY_API_KEY
   ```

## Notas Importantes

- **RLS (Row Level Security)** esta habilitado en todas las tablas
- Los triggers actualizan automaticamente:
  - `updated_at` en modificaciones
  - Rating promedio de tutores al crear reviews
  - Contador de sesiones de tutores
- El perfil se crea automaticamente al registrarse (trigger `on_auth_user_created`)
- Los planes y materias se crean con datos iniciales

## Comandos Utiles

```bash
# Ver logs de Supabase
supabase logs

# Reset de base de datos (CUIDADO: borra todo)
supabase db reset

# Ver estado del proyecto
supabase status
```
