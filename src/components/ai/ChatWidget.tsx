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
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] flex items-center justify-center shadow-2xl transition-colors"
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
                <div className="h-12 w-12 rounded-full bg-[#F2B705]/10 flex items-center justify-center">
                  <Bot size={22} className="text-[#F2B705]" />
                </div>
                <p className="text-white font-bold text-sm">Ask me anything about tools!</p>
                <p className="text-gray-500 text-xs max-w-[200px]">Brands, specs, compatibility, maintenance — I&apos;ve got you covered.</p>
                <div className="mt-3 space-y-2 w-full">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="w-full text-left text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 transition-colors"
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
                    <div className="h-7 w-7 rounded-full bg-[#F2B705]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} className="text-[#F2B705]" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] text-sm px-3 py-2.5 leading-relaxed",
                      m.role === "user"
                        ? "bg-[#F2B705] text-[#0B1F3A] font-medium"
                        : "bg-white/5 text-gray-200"
                    )}
                  >
                    {text}
                  </div>
                  {m.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={13} className="text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-7 w-7 rounded-full bg-[#F2B705]/10 flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-[#F2B705]" />
                </div>
                <div className="bg-white/5 px-3 py-2.5 flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about tools..."
                className="flex-1 bg-[#070f1c] border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-[#F2B705] transition-colors placeholder:text-gray-600"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#F2B705] hover:bg-[#D9A204] text-[#0B1F3A] px-3 disabled:opacity-40 transition-colors"
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
