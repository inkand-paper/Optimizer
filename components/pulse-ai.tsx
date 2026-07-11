"use client";

import * as React from "react";
import { Activity, X, Send, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function PulseAI() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Pulse-AI. Ask me about your plan, features, setup, or anything NexPulse-related." }
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
        body: JSON.stringify({ 
          message: input,
          history: messages.slice(-4) 
        }),
      });

      const data = await res.json();
      if (data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Signal lost. Please retry." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Communication failure." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Pulse-AI" : "Open Pulse-AI"}
        className={cn(
          "fixed bottom-24 md:bottom-6 right-6 h-14 w-14 rounded-full z-50 flex items-center justify-center transition-all duration-300 shadow-2xl group",
          isOpen ? "rotate-90 scale-90" : "hover:scale-110 active:scale-95"
        )}
        style={{
          background: "linear-gradient(135deg, var(--np-gold), #D4AF37)",
          boxShadow: "0 0 20px rgba(180, 140, 60, 0.3)"
        }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Activity className="h-6 w-6 text-white" />
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 px-3 py-1.5 bg-card border border-border rounded-ui text-[11px] font-bold uppercase tracking-widest text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Ask Pulse-AI
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-40 md:bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-card/80 backdrop-blur-xl border border-border rounded-card shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-ui bg-np-gold/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-np-gold" />
              </div>
              <div>
                <p className="text-[13px] font-bold uppercase tracking-tight">Pulse-AI</p>
                <p className="text-[10px] text-np-teal font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-np-teal animate-pulse" />
                  System Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 np-scroll"
          >
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                  m.role === "user" ? "bg-np-gold/10 text-np-gold" : "bg-muted text-muted-foreground"
                )}>
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                </div>
                <div className={cn(
                  "max-w-[80%] p-3 rounded-ui text-[12.5px] leading-relaxed prose dark:prose-invert prose-p:my-0 prose-sm",
                  m.role === "user" ? "bg-np-gold text-white" : "bg-muted/50 border border-border"
                )}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-muted-foreground animate-bounce" />
                </div>
                <div className="bg-muted/30 p-3 rounded-ui">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-np-gold" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask something..."
                className="w-full bg-background border border-border rounded-ui px-4 py-2.5 pr-10 text-[13px] outline-none focus:border-np-gold transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-np-slate hover:text-np-gold disabled:opacity-30 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[9px] text-center mt-2 text-muted-foreground uppercase tracking-widest font-medium">
              Powered by NexPulse Intelligence
            </p>
          </div>
        </div>
      )}
    </>
  );
}
