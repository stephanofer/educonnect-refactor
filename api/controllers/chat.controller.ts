import type { Context } from "hono";
import { ChatService } from "@/api/services/chat.service";
import { chatRequestSchema } from "@/api/schemas/chat.schema";

/**
 * ChatController handles HTTP requests for chat functionality
 */
export class ChatController {
  /**
   * POST /api/chat
   * Handles chat requests with streaming or non-streaming responses
   */
  static async chat(c: Context): Promise<Response> {
    try {
      // Parse and validate request body
      const body = await c.req.json();
      const validationResult = chatRequestSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          {
            error: "Invalid request",
            details: validationResult.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          400
        );
      }

      const request = validationResult.data;
      const chatService = new ChatService(c.env.AI);

      // Handle streaming response
      if (request.stream) {
        const stream = await chatService.generateStreamingResponse(request);

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Encoding": "identity",
            "Transfer-Encoding": "chunked",
          },
        });
      }

      // Handle non-streaming response
      const message = await chatService.generateResponse(request);

      return c.json({
        message,
        role: "assistant",
      });
    } catch (error) {
      console.error("Chat controller error:", error);

      return c.json(
        {
          error: "Failed to process chat request",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }

  /**
   * GET /api/chat/health
   * Health check endpoint for the chat service
   */
  static async health(c: Context): Promise<Response> {
    try {
      // Verify AI binding is available
      if (!c.env.AI) {
        return c.json(
          {
            status: "unhealthy",
            error: "AI binding not configured",
          },
          503
        );
      }

      return c.json({
        status: "healthy",
        model: "@cf/meta/llama-3.1-8b-instruct-awq",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        503
      );
    }
  }
}
