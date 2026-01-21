import type { Context } from "hono";
import { ProfesorBotService } from "@/api/services/profesor-bot.service";
import { chatRequestSchema } from "@/api/schemas/chat.schema";

/**
 * ProfesorBotController handles HTTP requests for the teaching bot
 */
export class ProfesorBotController {
  /**
   * POST /api/profesor-bot
   * Handles teaching bot requests with streaming or non-streaming responses
   */
  static async chat(c: Context): Promise<Response> {
    try {
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
      const profesorBotService = new ProfesorBotService(c.env.AI);

      if (request.stream) {
        const stream = await profesorBotService.generateStreamingResponse(request);

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

      const message = await profesorBotService.generateResponse(request);

      return c.json({
        message,
        role: "assistant",
      });
    } catch (error) {
      console.error("Profesor Bot controller error:", error);

      return c.json(
        {
          error: "Failed to process request",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }

  /**
   * GET /api/profesor-bot/health
   * Health check endpoint for the teaching bot
   */
  static async health(c: Context): Promise<Response> {
    try {
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
        bot: "Profesor EduBot",
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
