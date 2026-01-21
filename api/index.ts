import { Hono } from "hono";
import { cors } from "hono/cors";
import { ChatController } from "@/api/controllers/chat.controller";
import { ProfesorBotController } from "@/api/controllers/profesor-bot.controller";

type Env = {
  AI: Ai;
};

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use("*", cors({
  origin: "*", // Configure this for production
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Chat routes (EduBot - Asistente general)
app.post("/api/chat", ChatController.chat);
app.get("/api/chat/health", ChatController.health);

// Profesor Bot routes (Tutor académico)
app.post("/api/profesor-bot", ProfesorBotController.chat);
app.get("/api/profesor-bot/health", ProfesorBotController.health);

// Error handlers
app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((err, c) => {
  console.error("Global error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500
  );
});

export default app;
