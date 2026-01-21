# Chat API Documentation

## Overview

Endpoint de chat impulsado por AI usando Cloudflare Workers AI con el modelo **Llama 3.1 8B Instruct**.

## Endpoints

### POST `/api/chat`

Envía mensajes al chatbot y recibe respuestas.

#### Request Body

```json
{
  "messages": [
    {
      "role": "user",
      "content": "¿Cómo puedo encontrar un tutor de matemáticas?"
    }
  ],
  "stream": true,
  "maxTokens": 1000,
  "temperature": 0.7
}
```

#### Parameters

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `messages` | `Array<Message>` | ✅ | - | Array de mensajes del chat |
| `stream` | `boolean` | ❌ | `true` | Habilitar respuesta streaming |
| `maxTokens` | `number` | ❌ | `1000` | Máximo de tokens a generar (1-2000) |
| `temperature` | `number` | ❌ | `0.7` | Control de aleatoriedad (0-1) |

#### Message Object

```typescript
{
  role: "user" | "assistant" | "system",
  content: string
}
```

#### Response (Streaming)

Content-Type: `text/event-stream`

La respuesta se transmite token por token en formato SSE (Server-Sent Events).

```
data: {"response": "Hola"}
data: {"response": " puedo"}
data: {"response": " ayudarte"}
data: [DONE]
```

#### Response (Non-Streaming)

Content-Type: `application/json`

```json
{
  "message": "Puedo ayudarte a encontrar un tutor de matemáticas...",
  "role": "assistant"
}
```

#### Error Response

```json
{
  "error": "Invalid request",
  "details": [
    {
      "path": "messages",
      "message": "At least one message is required"
    }
  ]
}
```

### GET `/api/chat/health`

Verifica el estado del servicio de chat.

#### Response

```json
{
  "status": "healthy",
  "model": "@cf/meta/llama-3.1-8b-instruct-awq",
  "timestamp": "2025-01-21T12:00:00.000Z"
}
```

## Usage Examples

### JavaScript/TypeScript (Streaming)

```typescript
async function sendMessage(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: message }
      ],
      stream: true
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;
        
        try {
          const parsed = JSON.parse(data);
          console.log(parsed.response);
        } catch (e) {
          // Handle parsing errors
        }
      }
    }
  }
}
```

### JavaScript/TypeScript (Non-Streaming)

```typescript
async function sendMessage(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: message }
      ],
      stream: false
    }),
  });

  const data = await response.json();
  console.log(data.message);
}
```

### cURL (Non-Streaming)

```bash
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "¿Cómo funciona la plataforma?"
      }
    ],
    "stream": false
  }'
```

### Multi-turn Conversation

```typescript
const conversationHistory = [
  { role: 'user', content: '¿Qué materias están disponibles?' },
  { role: 'assistant', content: 'Tenemos tutores para matemáticas, física, química...' },
  { role: 'user', content: '¿Y para programación?' }
];

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: conversationHistory,
    stream: false
  }),
});
```

## Configuration

### System Prompt

El comportamiento del chatbot se configura en `api/services/chat.service.ts`:

```typescript
const SYSTEM_PROMPT = `You are a helpful AI assistant for EduConnect...`;
```

**Personaliza este prompt** para adaptar el chatbot a las necesidades de tu plataforma:

1. Abre `api/services/chat.service.ts`
2. Modifica la constante `SYSTEM_PROMPT`
3. Guarda y redeploy

### Model Parameters

Puedes ajustar el comportamiento del modelo:

- **temperature** (0-1): Controla la aleatoriedad
  - `0.0`: Más determinístico y conservador
  - `1.0`: Más creativo y variado
  
- **maxTokens**: Longitud máxima de la respuesta
  - Min: `1`
  - Max: `2000`
  - Recomendado: `500-1000`

## Error Codes

| Status | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid request | Request body inválido o validación fallida |
| 500 | Failed to process chat request | Error interno del servidor o AI |
| 503 | AI binding not configured | Configuración de Workers AI incorrecta |

## Architecture

```
api/
├── schemas/
│   └── chat.schema.ts       # Validación Zod + tipos TypeScript
├── services/
│   └── chat.service.ts      # Lógica de negocio + AI integration
├── controllers/
│   └── chat.controller.ts   # HTTP request handlers
└── index.ts                  # Routes registration
```

## Testing

### Local Development

```bash
npm run dev
# or
wrangler dev
```

### Test Health Endpoint

```bash
curl http://localhost:8787/api/chat/health
```

### Test Chat Endpoint

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hola"}],
    "stream": false
  }'
```

## Deployment

```bash
npm run deploy
# or
wrangler deploy
```

## Notes

- El binding de AI ya está configurado en `wrangler.json`
- El modelo usado es `@cf/meta/llama-3.1-8b-instruct-awq`
- Streaming está habilitado por defecto para mejor UX
- Las respuestas se generan en tiempo real
- El sistema prompt se inyecta automáticamente si no está presente

## Next Steps

1. ✅ Personaliza `SYSTEM_PROMPT` en `api/services/chat.service.ts`
2. Integra el endpoint en tu frontend React
3. Implementa almacenamiento de conversaciones (opcional)
4. Añade autenticación si es necesario
5. Configura rate limiting para producción
