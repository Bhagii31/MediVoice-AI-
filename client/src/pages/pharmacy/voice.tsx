import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, PhoneOff, Zap, Bot, User, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Do you have Paracetamol in stock?",
  "What medicines are low on stock?",
  "Tell me about current offers and discounts.",
  "What is the price of Amoxicillin?",
];

function WaveVisualizer({ active }: { active: boolean }) {
  const heights = [20, 35, 28, 42, 18, 38, 25, 45, 20, 32, 28, 38, 22];
  return (
    <div className="flex items-end gap-1 h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${active ? "bg-emerald-400" : "bg-muted-foreground/20"}`}
          style={{
            width: "3px",
            height: active ? `${h}px` : "4px",
            animation: active ? `waveBar ${0.6 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex items-end gap-2.5 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isUser ? "bg-emerald-600" : "bg-gradient-to-br from-purple-500 to-indigo-600"}`}>
        {isUser ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
        isUser
          ? "bg-emerald-600 text-white rounded-br-sm"
          : "bg-card border border-border text-foreground rounded-bl-sm"
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-fade-in">
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 0.2, 0.4].map((delay) => (
            <div
              key={delay}
              className="h-2 w-2 rounded-full bg-muted-foreground/40"
              style={{ animation: `blink 1.2s ease-in-out ${delay}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VoicePage() {
  const { toast } = useToast();
  const [callActive, setCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      apiRequest("POST", "/api/ai/chat", {
        message,
        conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
      }).then((r) => r.json()),
  });

  const startCall = () => {
    setCallActive(true);
    setMessages([{
      role: "assistant",
      content: "Hello! I'm MediVoice AI, your pharmacy assistant. I can help you check medicine availability, pricing, and current promotional offers. How can I assist you today?",
    }]);
  };

  const endCall = () => {
    setCallActive(false);
    setMessages([]);
    setInput("");
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || chatMutation.isPending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setIsTyping(true);
    try {
      const data = await chatMutation.mutateAsync(msg);
      setIsTyping(false);
      const reply = data.response || data.message || "I'm sorry, I couldn't process that right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setIsTyping(false);
      toast({ title: "Error", description: "Failed to reach MediVoice AI. Try again.", variant: "destructive" });
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {callActive && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-blink" />}
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {callActive ? "Call Active" : "AI Assistant"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MediVoice AI</h1>
        </div>
        {callActive && (
          <Button
            variant="destructive"
            size="sm"
            onClick={endCall}
            className="gap-2 animate-fade-in"
            data-testid="button-end-call"
          >
            <PhoneOff className="h-4 w-4" /> End Call
          </Button>
        )}
      </div>

      {!callActive ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-scale-in">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl animate-float">
                <Mic className="h-14 w-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center shadow-md animate-float delay-300">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Ready to Connect</h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Start a conversation with MediVoice AI to inquire about medicines, check stock, and explore current offers.
            </p>
          </div>

          <Button
            size="lg"
            onClick={startCall}
            className="gap-2.5 px-8 py-6 text-base font-semibold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse-ring"
            data-testid="button-start-call"
          >
            <Mic className="h-5 w-5" /> Start Call
          </Button>

          <div className="w-full max-w-sm space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Try asking:</span>
            </div>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={s}
                onClick={() => { startCall(); setTimeout(() => sendMessage(s), 600); }}
                className="w-full text-left text-sm px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted hover:border-emerald-400 transition-all duration-200 text-muted-foreground hover:text-foreground animate-fade-in-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-scale-in">
          <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-emerald-600 to-teal-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">MediVoice AI</p>
                  <p className="text-emerald-200 text-xs">Powered by OpenAI GPT-4</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <WaveVisualizer active={chatMutation.isPending || isTyping} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} index={i} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 animate-fade-in">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-border bg-background/50">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type your message…"
                className="flex-1 rounded-xl border-border"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0 shadow-sm"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
