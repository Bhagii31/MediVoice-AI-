import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone, PhoneCall, Clock, Bot, ArrowRight,
  PhoneOff, Mic, Sparkles, MessageSquare, Info, ShieldCheck,
  ChevronRight, Star, Zap, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePharmacyContext } from "@/lib/pharmacy-context";
import { apiRequest } from "@/lib/queryClient";

function WaveBar({ height, delay }: { height: number; delay: number }) {
  return (
    <div
      className="rounded-full bg-emerald-300/80"
      style={{
        width: "4px",
        height: `${height}px`,
        animation: `waveBar 0.8s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

function PulseRing() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="absolute h-20 w-20 rounded-full border-2 border-emerald-300/40 animate-ping" style={{ animationDuration: "2s" }} />
      <div className="absolute h-28 w-28 rounded-full border border-emerald-300/20 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
    </div>
  );
}

const WHAT_TO_ASK = [
  { icon: MessageSquare, label: "Stock availability", example: '"Do you have Paracetamol 500mg?"' },
  { icon: Star, label: "Current offers", example: '"What discounts are available today?"' },
  { icon: Info, label: "Pricing", example: '"How much does Amoxicillin cost?"' },
  { icon: Zap, label: "Reorder medicines", example: '"I need 200 units of Metformin."' },
];

function CallBotHero({ twilioNumber }: { twilioNumber: string }) {
  const { pharmacyId, pharmacyName } = usePharmacyContext();
  const [phone, setPhone] = useState("");
  const [callResult, setCallResult] = useState<{ success: boolean; message: string } | null>(null);

  const callMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/twilio/outbound", {
        to: phone.trim(),
        pharmacyName: pharmacyName || "Pharmacist",
        reason: "stock check and medicine enquiry",
        ...(pharmacyId ? { pharmacyId } : {}),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCallResult({ success: true, message: "Call initiated! Your phone will ring in a few seconds." });
        setPhone("");
      } else {
        setCallResult({ success: false, message: data.error || "Failed to initiate call." });
      }
    },
    onError: (err: any) => {
      setCallResult({ success: false, message: err.message || "Could not reach the server." });
    },
  });

  const handleCall = () => {
    if (!phone.trim()) return;
    setCallResult(null);
    callMutation.mutate();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 shadow-2xl animate-scale-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/3 animate-float" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3 animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 animate-float delay-500" />
      </div>

      <div className="relative z-10 p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-blink" />
            MediVoice AI · Live 24/7
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium">
            <ShieldCheck className="h-3 w-3 text-emerald-300" /> Calls Recorded & Saved
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 leading-tight">
              Call MediVoice AI
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-sm">
              Enter your phone number and MediVoice AI will call you back instantly.
              Ask about stock, pricing, and active offers.
            </p>
          </div>
          <div className="relative flex-shrink-0">
            <PulseRing />
            <div className="relative h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl z-10">
              <Mic className={`h-10 w-10 text-white ${callMutation.isPending ? "animate-pulse" : ""}`} />
            </div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/25 shadow-inner">
          <p className="text-emerald-200 text-xs uppercase tracking-widest font-semibold text-center">Request AI Call Back</p>

          <div className="flex items-end gap-1 justify-center h-10 py-1">
            {[14, 22, 18, 30, 16, 36, 14, 28, 22, 34, 14, 26, 20, 30, 18].map((h, i) => (
              <WaveBar key={i} height={h} delay={i * 0.06} />
            ))}
          </div>

          {/* Phone number input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 z-10" />
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCall()}
                className="pl-9 bg-white/95 border-0 text-gray-800 placeholder:text-gray-400 font-medium rounded-xl h-12 focus:ring-2 focus:ring-white/50 focus:outline-none"
                data-testid="input-phone-number"
              />
            </div>
            <Button
              onClick={handleCall}
              disabled={callMutation.isPending || !phone.trim()}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-black px-5 h-12 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
              data-testid="button-call-me-now"
            >
              {callMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Calling…</>
              ) : (
                <><PhoneCall className="h-4 w-4" /> Call Me</>
              )}
            </Button>
          </div>

          {/* Result banner */}
          {callResult && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in-up ${callResult.success ? "bg-emerald-500/30 text-white border border-emerald-400/40" : "bg-red-500/30 text-white border border-red-400/40"}`}
              data-testid="status-call-result">
              {callResult.success
                ? <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                : <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-300" />}
              {callResult.message}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-emerald-200">
            <Sparkles className="h-3 w-3" />
            <span>Powered by Twilio + OpenAI · Calls auto-saved to history</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatToAsk() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">What You Can Ask</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {WHAT_TO_ASK.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`rounded-xl p-4 cursor-pointer border transition-all duration-200 animate-fade-in-up hover-elevate ${active === i ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : "border-border bg-card hover:border-emerald-300"}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-200 ${active === i ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">{item.label}</p>
              {active === i && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 italic animate-fade-in-up leading-relaxed">
                  {item.example}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">Tap a topic to see an example phrase</p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", title: "Dial the hotline", desc: "Call the MediVoice AI number above from any mobile or landline", color: "from-emerald-500 to-teal-600" },
    { n: "2", title: "Speak naturally", desc: "Ask about stock, pricing, reorders, or offers — the AI understands context", color: "from-teal-500 to-cyan-600" },
    { n: "3", title: "Get instant answers", desc: "The AI responds with live data and saves a full transcript to your history", color: "from-cyan-500 to-blue-600" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">How It Works</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in-up hover-elevate group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-110 transition-transform`}>
              {s.n}
            </div>
            <p className="font-bold text-sm">{s.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentCalls({ pharmacyName, pharmacyCode }: { pharmacyName: string | null; pharmacyCode: string | null }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/conversations", pharmacyName, pharmacyCode],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "5" });
      if (pharmacyName) params.set("pharmacy", pharmacyName);
      const res = await fetch(`/api/conversations?${params}`);
      return res.json();
    },
  });

  const calls = data?.conversations || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Recent Calls</h3>
        <div className="flex-1 h-px bg-border" />
        <Link href="/pharmacy/conversations">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
            View all <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Phone className="h-7 w-7 text-muted-foreground opacity-30" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">No calls yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Dial the hotline above — your call will appear here within seconds after it ends.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map((c: any, i: number) => (
            <Link key={c._id} href={`/pharmacy/conversations/${c._id}`}>
              <div
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover-elevate cursor-pointer hover:border-emerald-400 transition-all duration-200 animate-fade-in-up group"
                style={{ animationDelay: `${i * 50}ms` }}
                data-testid={`card-call-${c._id}`}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{c.pharmacy_name || "MediVoice AI Call"}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.pharmacist_text?.slice(0, 70) || c.ai_response?.slice(0, 70) || "—"}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{c.timestamp ? new Date(c.timestamp).toLocaleDateString() : "—"}</span>
                  </div>
                  {c.type && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${c.type === "inbound" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}`}>
                      {c.type}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 text-center py-20 animate-scale-in">
      <div className="relative">
        <div className="h-24 w-24 rounded-3xl bg-muted flex items-center justify-center">
          <PhoneOff className="h-12 w-12 text-muted-foreground opacity-30" />
        </div>
      </div>
      <div>
        <p className="text-xl font-black">AI Hotline Not Configured</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
          Twilio credentials have not been set up yet. Contact your dealer or admin to enable the MediVoice AI call bot.
        </p>
      </div>
      <div className="bg-muted rounded-xl p-4 text-xs text-muted-foreground max-w-sm space-y-1.5 text-left border border-border">
        <p className="font-bold text-foreground mb-2 flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Required setup:</p>
        <p>• TWILIO_ACCOUNT_SID</p>
        <p>• TWILIO_AUTH_TOKEN</p>
        <p>• TWILIO_PHONE_NUMBER</p>
      </div>
    </div>
  );
}

export default function VoicePage() {
  const { pharmacyName, pharmacyCode } = usePharmacyContext();
  const { data: twilioStatus, isLoading } = useQuery<any>({ queryKey: ["/api/twilio/status"] });
  const { data: convsData } = useQuery<any>({ queryKey: ["/api/conversations"] });
  const totalCalls = convsData?.total || 0;

  return (
    <div className="p-6 space-y-7 max-w-3xl mx-auto">
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-2 mb-1">
          {twilioStatus?.configured && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-blink" />}
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">MediVoice AI</span>
          {totalCalls > 0 && (
            <span className="ml-auto bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalCalls} call{totalCalls !== 1 ? "s" : ""} recorded
            </span>
          )}
        </div>
        <h1 className="text-2xl font-black tracking-tight">Call Bot Hotline</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Ask about medicines, stock, pricing and offers — 24/7 AI-powered phone line
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        </div>
      ) : twilioStatus?.configured ? (
        <>
          <CallBotHero twilioNumber={twilioStatus.phoneNumber} />
          <WhatToAsk />
          <HowItWorks />
          <RecentCalls pharmacyName={pharmacyName} pharmacyCode={pharmacyCode} />
        </>
      ) : (
        <NotConfigured />
      )}
    </div>
  );
}
