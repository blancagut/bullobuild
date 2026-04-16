"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({ api: "/api/ai/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  const SUGGESTIONS = [
    "What's the best drill for home use?",
    "Compare DeWalt vs Milwaukee",
    "How do I maintain my tools?",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-yellow text-ink shadow-lg transition-colors hover:bg-yellow-dark"
        aria-label="Open BULLOBUILD AI chat"
      >
        <MessageSquare size={22} />
      </button>

      <Sheet open={open} onOpenChange={setOpen} title="BULLOBUILD AI" description="Ask anything about professional tools" width="w-[380px]">
        <div className="flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel">
                  <Bot size={22} className="text-yellow-dark" />
                </div>
                <p className="text-sm font-bold text-ink">Ask me anything about tools!</p>
                <p className="max-w-[200px] text-xs text-ink-soft">Brands, specs, compatibility, maintenance — I&apos;ve got you covered.</p>
                <div className="mt-3 space-y-2 w-full">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="w-full border border-stroke bg-card px-3 py-2 text-left text-xs text-ink-soft transition-colors hover:bg-panel hover:text-ink"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("");
              return (
                <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel">
                      <Bot size={13} className="text-yellow-dark" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] text-sm px-3 py-2.5 leading-relaxed",
                      m.role === "user"
                        ? "bg-yellow text-ink font-medium"
                        : "border border-stroke bg-card text-ink"
                    )}
                  >
                    {text}
                  </div>
                  {m.role === "user" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel">
                      <User size={13} className="text-ink-soft" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel">
                  <Bot size={13} className="text-yellow-dark" />
                </div>
                <div className="flex items-center gap-1 border border-stroke bg-card px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-stroke p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about tools..."
                className="flex-1 border border-stroke bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-yellow"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-yellow px-3 text-ink transition-colors hover:bg-yellow-dark disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </Sheet>
    </>
  );
}
