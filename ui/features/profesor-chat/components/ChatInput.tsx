import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { Send, Square, Sparkles } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { cn } from "@/ui/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false,
  placeholder = "Escribe tu pregunta...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSend(input.trim());
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl p-4">
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
            disabled && "opacity-50"
          )}
        >
          {/* Sparkle icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary/60" />
          </div>

          {/* Input area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground",
              "focus:outline-none disabled:cursor-not-allowed",
              "max-h-[200px] min-h-[40px] py-2.5"
            )}
          />

          {/* Action button */}
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onCancel}
              className="h-10 w-10 shrink-0 rounded-xl hover:bg-destructive/10 hover:text-destructive"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || disabled}
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl transition-all duration-200",
                input.trim()
                  ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Helper text */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Profesor EduBot puede cometer errores. Verifica la información importante.
        </p>
      </form>
    </motion.div>
  );
}
