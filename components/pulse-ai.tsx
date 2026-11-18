"use client";

import * as React from "react";
import { X, Send, Loader2, User, Terminal } from "lucide-react";
import { BrandIcon } from "./brand-icon";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ConsoleAssistant() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "NexPulse Console Assistant ready. Ask about your monitors, deployment runbooks, API configuration, or cluster telemetry."
    }
  ]);
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          message: input,
          history: messages.slice(-4) 
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content || "Your session could not be verified. Please log in to access account features." }]);
      } else if (res.status === 429) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content || "Rate limit reached. Please wait a moment before sending another message." }]);
      } else if (data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "No response received. Please try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Communication failure." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Console Assistant" : "Open Console Assistant"}
        className={cn(
          "fixed bottom-24 md:bottom-6 right-6 h-12 w-12 rounded-full z-[90] items-center justify-center transition-all duration-200 shadow-lg cursor-pointer bg-primary text-primary-foreground border border-border group",
          isOpen ? "hidden md:flex" : "flex",
          isOpen ? "rotate-90 scale-95" : "hover:scale-105 active:scale-95"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Terminal className="h-5 w-5" strokeWidth={1.5} />
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-14 px-2.5 py-1 bg-card border border-border rounded-ui text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Console Assistant
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-[90] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200
            inset-0 md:inset-auto
            md:bottom-24 md:right-6
            md:w-[360px] md:max-w-[calc(100vw-3rem)]
            md:h-[500px] md:max-h-[calc(100vh-10rem)]
            md:rounded-card md:border md:border-border md:shadow-xl
            bg-card"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-ui bg-muted border border-border flex items-center justify-center">
                <BrandIcon className="h-3.5 w-3.5 text-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">Console Assistant</p>
                <p className="text-[10px] text-muted-foreground">Cluster &amp; telemetry guidance</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 np-scroll"
          >
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2.5", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium border border-border",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {m.role === "user" ? <User className="h-3 w-3" strokeWidth={1.5} /> : <BrandIcon className="h-3 w-3" />}
                </div>
                <div className={cn(
                  "max-w-[80%] p-3 rounded-ui text-xs leading-relaxed prose dark:prose-invert prose-p:my-0 prose-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-foreground"
                )}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center">
                  <BrandIcon className="h-3 w-3 text-muted-foreground animate-pulse" />
                </div>
                <div className="bg-muted p-3 rounded-ui border border-border">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about endpoints, incidents, or audits..."
                enterKeyHint="send"
                className="w-full bg-background border border-border rounded-ui px-3.5 py-2.5 pr-10 text-xs outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-[10px] text-center mt-2 text-muted-foreground">
              Direct telemetry &amp; code analysis
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// Backward-compatibility export alias
export { ConsoleAssistant as PulseAI };
