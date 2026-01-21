/**
 * React Hook Example for Chat API Integration
 * 
 * This file provides examples of how to integrate the chat API
 * in your React components using the EduConnect chat endpoint.
 * 
 * Copy and adapt these examples to your needs.
 */

import { useState, useCallback } from 'react';

// Types
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UseChatOptions {
  apiUrl?: string;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Custom hook for chat functionality
 * 
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { messages, isLoading, sendMessage } = useChat();
 *   
 *   const handleSubmit = async (text: string) => {
 *     await sendMessage(text);
 *   };
 *   
 *   return (
 *     <div>
 *       {messages.map((msg, i) => (
 *         <div key={i}>{msg.role}: {msg.content}</div>
 *       ))}
 *       <button onClick={() => handleSubmit("Hello")} disabled={isLoading}>
 *         Send
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    apiUrl = '/api/chat',
    stream = true,
    maxTokens = 1000,
    temperature = 0.7,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = { role: 'user', content };
      setMessages((prev) => [...prev, userMessage]);

      try {
        if (stream) {
          await handleStreamingResponse(content);
        } else {
          await handleNormalResponse(content);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, stream, maxTokens, temperature, messages]
  );

  const handleStreamingResponse = async (content: string) => {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content }],
        stream: true,
        maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let assistantMessage = '';

    // Add empty assistant message that will be updated
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.response) {
              assistantMessage += parsed.response;
              
              // Update the last message (assistant) with accumulated content
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage,
                };
                return updated;
              });
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  };

  const handleNormalResponse = async (content: string) => {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content }],
        stream: false,
        maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const assistantMessage: Message = {
      role: 'assistant',
      content: data.message,
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}

/**
 * Example Chat Component
 * 
 * Complete example showing how to build a chat UI
 */
export function ChatExample() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat({
    stream: true,
    temperature: 0.7,
  });

  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">EduConnect Chat</h1>
        <button
          onClick={clearMessages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Start a conversation with the AI assistant
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}

/**
 * Example with TanStack Query
 * 
 * For more advanced state management
 */
import { useMutation } from '@tanstack/react-query';

interface ChatRequest {
  messages: Message[];
  stream: boolean;
  maxTokens?: number;
  temperature?: number;
}

export function useChatMutation() {
  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
  });
}
