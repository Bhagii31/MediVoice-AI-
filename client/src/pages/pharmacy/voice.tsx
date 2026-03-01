import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Mic, MicOff, Send, Phone, PhoneOff, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export default function PharmacyVoice() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const newHistory = [...conversationHistory, { role: "user", content: message }];
      const res = await apiRequest("POST", "/api/ai/chat", { message, conversationHistory });
      const data = await res.json();
      return { data, newHistory };
    },
    onSuccess: ({ data, newHistory }) => {
      const aiMessage = data.reply || data.message || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: aiMessage,
        timestamp: new Date(),
      }]);
      setConversationHistory([...newHistory, { role: "assistant", content: aiMessage }]);
    },
    onError: () => {
      toast({ title: "Connection error", description: "Could not reach MediVoice AI. Please try again.", variant: "destructive" });
    }
  });

  const startCall = () => {
    setCallActive(true);
    setMessages([{
      role: "assistant",
      content: "Hello! This is MediVoice AI. I'm here to help you with medicine availability, stock checks, and ordering. How can I assist you today?",
      timestamp: new Date(),
    }]);
    setConversationHistory([]);
  };

  const endCall = () => {
    setCallActive(false);
    setMessages(prev => [...prev, {
      role: "system",
      content: "Call ended.",
      timestamp: new Date(),
    }]);
  };

  const sendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const message = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: message, timestamp: new Date() }]);
    chatMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Call MediVoice AI</h1>
        <p className="text-muted-foreground text-sm">Ask about medicines, check stock, or place an order via chat</p>
      </div>

      <Card className="border-2 border-dashed border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${callActive ? "bg-emerald-500 animate-pulse" : "bg-muted"}`}>
                {callActive ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="font-medium text-sm">{callActive ? "Call in progress" : "Not connected"}</p>
                <p className="text-xs text-muted-foreground">{callActive ? "MediVoice AI is listening" : "Start a session to chat with the AI"}</p>
              </div>
            </div>
            {callActive ? (
              <Button variant="destructive" size="sm" onClick={endCall} data-testid="button-end-call">
                <PhoneOff className="h-4 w-4 mr-1" /> End Call
              </Button>
            ) : (
              <Button size="sm" onClick={startCall} className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="button-start-call">
                <Phone className="h-4 w-4 mr-1" /> Start Call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3 max-h-96 overflow-y-auto px-4 pb-4" data-testid="chat-messages">
              {messages.map((msg, i) => (
                msg.role === "system" ? (
                  <div key={i} className="text-center text-xs text-muted-foreground py-1">— {msg.content} —</div>
                ) : (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-foreground"
                    }`}>
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-60 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </div>
                )
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="bg-muted rounded-xl px-3 py-2 text-sm text-muted-foreground">Thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>
      )}

      {callActive && (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message (e.g. 'Do you have Amoxicillin in stock?')"
            disabled={chatMutation.isPending}
            data-testid="input-chat-message"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || chatMutation.isPending} data-testid="button-send-message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!callActive && messages.length === 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">What can you ask?</p>
            <div className="space-y-1.5">
              {[
                "Do you have Amoxicillin 500mg in stock?",
                "I need to order 100 units of Paracetamol",
                "What offers are available for Gold tier?",
                "When will my last order be delivered?",
              ].map((suggestion, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-emerald-500">›</span> {suggestion}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
