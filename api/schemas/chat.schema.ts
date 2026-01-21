import { z } from "zod";

/**
 * Role types for chat messages
 */
export const CHAT_ROLE = {
  SYSTEM: "system",
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export type ChatRole = (typeof CHAT_ROLE)[keyof typeof CHAT_ROLE];

/**
 * Schema for a single chat message
 */
export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1, { error: "Message content cannot be empty" }),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

/**
 * Schema for chat request with streaming support
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, { error: "At least one message is required" })
    .max(50, { error: "Maximum 50 messages allowed" }),
  stream: z.boolean().optional().default(true),
  maxTokens: z.number().int().positive().max(2000).optional().default(1000),
  temperature: z.number().min(0).max(1).optional().default(0.7),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Schema for non-streaming chat response
 */
export const chatResponseSchema = z.object({
  message: z.string(),
  role: z.enum(["assistant"]),
  usage: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
