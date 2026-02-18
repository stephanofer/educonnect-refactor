import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  BookOpen,
  Calendar,
  CreditCard,
  HelpCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  RotateCcw,
  GraduationCap,
  Bot,
  Minus,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { cn } from "@/ui/lib/utils";
import type { ChatMessage } from "@/ui/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const quickReplies = [
  {
    icon: BookOpen,
    label: "¿Cómo funciona?",
    message: "¿Cómo funciona EduConnect?",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calendar,
    label: "Reservar sesión",
    message: "¿Cómo puedo reservar una sesión con un tutor?",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: CreditCard,
    label: "Ver planes",
    message: "¿Cuáles son los planes y precios disponibles?",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: HelpCircle,
    label: "Ayuda",
    message: "Necesito ayuda con la plataforma",
    color: "from-emerald-500 to-green-500",
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "¡Hola! 👋 Soy el asistente virtual de EduConnect. Estoy aquí para ayudarte a encontrar el tutor perfecto y resolver tus dudas. ¿Cómo puedo ayudarte hoy?",
    timestamp: new Date(),
  },
];

interface APIMessage {
  role: "user" | "assistant";
  content: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Sub-components ---

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="size-1.5 rounded-full bg-primary/60"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: 1, y: -3 }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function ScrollToBottomButton({ onClick, visible }: { onClick: () => void; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClick}
          className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronDown className="size-3.5" />
          Nuevos mensajes
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm mt-0.5">
          <Bot className="size-3.5 text-white" />
        </div>
      )}

      <div className="flex max-w-[80%] flex-col gap-1">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card text-card-foreground shadow-sm border border-border rounded-bl-md"
          )}
        >
          {message.content ? (
            <>
              {message.content}
              {isStreaming && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
                  className="ml-0.5 inline-block h-3.5 w-1.5 rounded-sm bg-current align-text-bottom opacity-70"
                />
              )}
            </>
          ) : isStreaming ? (
            <TypingIndicator />
          ) : null}
        </div>
        <span
          className={cn(
            "text-[10px] text-muted-foreground/60 px-1",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// --- Main Widget ---

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Scroll detection for "scroll to bottom" button
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBtn(!isNearBottom);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Create a placeholder for the assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Prepare messages for API (only user and assistant messages, no system)
      const apiMessages: APIMessage[] = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Add the new user message
      apiMessages.push({
        role: "user",
        content: content.trim(),
      });

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          stream: true,
          maxTokens: 1000,
          temperature: 0.7,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            // Check for end of stream
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.response) {
                accumulatedContent += parsed.response;

                // Update the assistant message with accumulated content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch {
              // Not JSON, might be raw text
              if (data.trim()) {
                accumulatedContent += data;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            }
          }
        }
      }

      // If no content was received, show error
      if (!accumulatedContent) {
        throw new Error("No response received from AI");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Request was cancelled, ignore
        return;
      }

      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Error al enviar mensaje");

      // Remove the empty assistant message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      );
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsOpen(false);
  };

  const handleRetry = () => {
    setError(null);
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const showQuickReplies = messages.length <= 2 && !isTyping;
  const currentAssistantStreaming =
    isTyping && messages[messages.length - 1]?.role === "assistant";

  return (
    <>
      {/* ---- FAB Button ---- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30 sm:bottom-6 sm:right-6"
            aria-label="Abrir chat"
          >
            <MessageCircle className="size-6" />

            {/* Unread badge */}
            {hasUnread && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background"
              >
                1
              </motion.span>
            )}

            {/* Pulse ring */}
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---- Chat Window ---- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={cn(
                "fixed z-50 flex flex-col overflow-hidden border border-border bg-background shadow-2xl",
                // Mobile: full-screen bottom sheet
                "inset-x-0 bottom-0 top-12 rounded-t-3xl sm:top-auto",
                // Desktop: floating panel
                "sm:bottom-6 sm:right-6 sm:left-auto sm:w-[400px] sm:h-[min(620px,85vh)] sm:rounded-2xl"
              )}
            >
              {/* ===== Header ===== */}
              <div className="relative flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
                {/* Subtle pattern overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_50%)]" />

                <div className="relative flex items-center gap-3">
                  <div className="relative flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                    <GraduationCap className="size-5" />
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-tight">
                      Asistente EduBot
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      <p className="text-[11px] text-white/70">En línea</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-1">
                  {/* Minimize (mobile only) */}
                  <button
                    onClick={handleClose}
                    className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white sm:hidden"
                    aria-label="Minimizar chat"
                  >
                    <Minus className="size-5" />
                  </button>
                  {/* Close */}
                  <button
                    onClick={handleClose}
                    className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    aria-label="Cerrar chat"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* ===== Error Banner ===== */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5">
                      <AlertCircle className="size-4 shrink-0 text-destructive" />
                      <p className="flex-1 text-xs text-destructive">{error}</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleRetry}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <RotateCcw className="size-3" />
                          Reintentar
                        </button>
                        <button
                          onClick={() => setError(null)}
                          className="rounded-md p-1 text-destructive/60 transition-colors hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ===== Messages ===== */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="relative flex-1 overflow-y-auto overscroll-contain scroll-smooth bg-muted/30 px-4 py-4"
              >
                <div className="flex flex-col gap-4">
                  {messages.map((message, i) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isStreaming={
                        currentAssistantStreaming === true &&
                        i === messages.length - 1
                      }
                    />
                  ))}
                </div>

                <div ref={messagesEndRef} className="h-1" />

                {/* Scroll to bottom */}
                <ScrollToBottomButton
                  visible={showScrollBtn}
                  onClick={() => scrollToBottom()}
                />
              </div>

              {/* ===== Quick Replies ===== */}
              <AnimatePresence>
                {showQuickReplies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border bg-background"
                  >
                    <div className="px-4 pt-3 pb-2">
                      <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                        Preguntas frecuentes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickReplies.map((reply) => (
                          <motion.button
                            key={reply.label}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSendMessage(reply.message)}
                            disabled={isTyping}
                            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <div
                              className={cn(
                                "flex size-4 items-center justify-center rounded-full bg-gradient-to-br text-white",
                                reply.color
                              )}
                            >
                              <reply.icon className="size-2.5" />
                            </div>
                            {reply.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ===== Input Area ===== */}
              <form
                onSubmit={handleSubmit}
                className="border-t border-border bg-background p-3"
              >
                <div
                  className={cn(
                    "flex items-end gap-2 rounded-2xl border bg-muted/40 p-1.5 transition-all duration-200",
                    "focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-background"
                  )}
                >
                  {/* Sparkle icon */}
                  <div className="flex size-9 shrink-0 items-center justify-center">
                    <Sparkles className="size-4 text-primary/50" />
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje..."
                    disabled={isTyping}
                    rows={1}
                    className="flex-1 resize-none bg-transparent py-2 text-[13px] leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed max-h-[120px] min-h-[36px]"
                  />

                  {/* Send / Loading button */}
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || isTyping}
                    className={cn(
                      "size-9 shrink-0 rounded-xl transition-all duration-200",
                      inputValue.trim() && !isTyping
                        ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isTyping ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>

                <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
                  EduBot puede cometer errores · Verifica la información
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
