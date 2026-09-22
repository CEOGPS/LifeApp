import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Mic, Send, Settings, Sparkles, Loader2, MessageSquareOff } from "lucide-react";
import { useAuth } from "@/lib/SupabaseAuthContext";
import { invokeLLM } from "@/lib/llm";

interface ErebusMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function ErebusDock() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ErebusMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "Enter" && !e.shiftKey && document.activeElement === document.getElementById("erebus-input")) {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput("");
    setIsLoading(true);

    const userMsg: ErebusMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await invokeLLM({
        prompt: userMessage,
        systemPrompt: "You are Erebus, the AI companion for LifeOS/CEO GPS. Be helpful, concise, and actionable. You have access to the user's dashboard data and can help with tasks, analysis, and questions.",
      });
      if (result.ok) {
        const assistantMsg: ErebusMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text || result.content || "No response",
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const errorMsg: ErebusMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${result.detail || result.reason || "Failed to get response"}`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (e: any) {
      const errorMsg: ErebusMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${e?.message || "Failed to get response"}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl",
          isOpen
            ? "bg-primary text-primary-foreground rotate-45"
            : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
        )}
        aria-label={isOpen ? "Close Erebus" : "Open Erebus"}
      >
        <Sparkles size={28} />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-full max-w-md lg:w-96 h-[600px] max-h-[80vh] glass rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Erebus</h3>
                <p className="text-[10px] text-white/40 font-display tracking-widest uppercase">AI Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                aria-label="Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" className="w-4 h-4 accent-primary" />
                  <span>Auto-open on new messages</span>
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" className="w-4 h-4 accent-primary" />
                  <span>Voice input enabled</span>
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" className="w-4 h-4 accent-primary" />
                  <span>Proactive suggestions</span>
                </label>
                <button className="w-full px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30">
                  Clear conversation history
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 200 }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40 text-center py-12">
                <Sparkles size={48} className="mb-4 opacity-50" />
                <p className="font-medium text-white/60">Hey! I'm Erebus.</p>
                <p className="text-sm text-white/30 mt-1">Ask me anything about your dashboard, data, or just chat.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%] animate-fade-in",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[75%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-white/10 text-white rounded-tl-none"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[9px] opacity-50 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-end gap-2">
              <button
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0"
                aria-label="Voice input"
              >
                <Mic size={18} />
              </button>
              <div className="flex-1 relative">
                <input
                  id="erebus-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask Erebus..."
                  disabled={isLoading}
                  className="w-full h-10 pl-4 pr-10 py-0 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-[10px] text-white/40 mt-2">
                <Loader2 size={12} className="animate-spin" />
                <span>Erebus is thinking...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}