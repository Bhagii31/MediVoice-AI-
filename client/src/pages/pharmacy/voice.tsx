import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone, Copy, CheckCheck, PhoneCall, Clock, Bot, ArrowRight,
  PhoneOff, Mic, Sparkles, MessageSquare, Info, ShieldCheck,
  ChevronRight, Star, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePharmacyContext } from "@/lib/pharmacy-context";

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
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [callActive, setCallActive] = useState(false);

  const copyNumber = () => {
    navigator.clipboard.writeText(twilioNumber);
    setCopied(true);
    toast({ title: "Phone number copied!", description: "Open your dialler and paste to call." });
    setTimeout(() => setCopied(false), 3000);
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
              Our AI answers instantly. Ask about stock, pricing, and active offers.
              Every call is recorded and saved to your history.
            </p>
          </div>
          <div className="relative flex-shrink-0">
            <PulseRing />
            <div className="relative h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl z-10">
              <Mic className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 space-y-5 border border-white/25 shadow-inner">
          <div className="text-center">
            <p className="text-emerald-200 text-xs uppercase tracking-widest mb-2 font-semibold">AI Hotline Number</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-white tracking-widest font-mono" data-testid="text-twilio-number">
                {twilioNumber}
              </span>
              <button
                onClick={copyNumber}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/35 transition-all duration-200 border border-white/20 hover:scale-110"
                data-testid="button-copy-number"
                title="Copy number"
              >
                {copied
                  ? <CheckCheck className="h-4 w-4 text-emerald-300" />
                  : <Copy className="h-4 w-4 text-white" />
                }
              </button>
            </div>
          </div>

          <div className="flex items-end gap-1 justify-center h-12 py-1">
            {[18, 28, 14, 36, 22, 40, 18, 32, 26, 38, 16, 30, 24, 34, 20].map((h, i) => (
              <WaveBar key={i} height={h} delay={i * 0.06} />
            ))}
          </div>

          <a href={`tel:${twilioNumber}`} className="block" onClick={() => setCallActive(true)}>
            <Button
              className="w-full gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-black py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
              data-testid="button-dial-now"
            >
              <PhoneCall className="h-5 w-5" /> Dial Now
            </Button>
          </a>

          <div className="flex items-center justify-center gap-2 text-xs text-emerald-200">
            <Sparkles className="h-3 w-3" />
            <span>Powered by Twilio + OpenAI GPT-4 · All calls auto-saved</span>
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
