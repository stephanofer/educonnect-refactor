import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { ScrollArea } from "@/ui/components/shadcn/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyChat } from "./EmptyChat";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatContainerProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onCancelRequest: () => void;
  onClearMessages: () => void;
  disabled?: boolean;
}

export function ChatContainer({
  messages,
  isLoading,
  error,
  onSendMessage,
  onCancelRequest,
  onClearMessages,
  disabled = false,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b px-4 py-3"
      >
        <div>
          <h1 className="text-lg font-semibold">Profesor EduBot</h1>
          <p className="text-xs text-muted-foreground">
            Tu asistente académico con inteligencia artificial
          </p>
        </div>

        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearMessages}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Nueva conversación
          </Button>
        )}
      </motion.div>

      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="popLayout">
            {hasMessages ? (
              <div className="divide-y">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[60vh] items-center justify-center"
              >
                <EmptyChat onSuggestionClick={onSendMessage} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-4 mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <p className="font-medium">Error</p>
                <p className="mt-1 text-destructive/80">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <ChatInput
        onSend={onSendMessage}
        onCancel={onCancelRequest}
        isLoading={isLoading}
        disabled={disabled}
        placeholder="Pregúntale lo que quieras al Profesor EduBot..."
      />
    </div>
  );
}
