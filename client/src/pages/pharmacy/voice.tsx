import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Copy, CheckCheck, PhoneCall, Clock, Bot, ArrowRight, PhoneOff, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePharmacyContext } from "@/lib/pharmacy-context";

function WaveBar({ height, delay }: { height: number; delay: number }) {
  return (
    <div
      className="rounded-full bg-emerald-400/80"
      style={{
        width: "3px",
        height: `${height}px`,
        animation: `waveBar 0.8s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

function CallBotHero({ twilioNumber }: { twilioNumber: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyNumber = () => {
    navigator.clipboard.writeText(twilioNumber);
    setCopied(true);
    toast({ title: "Phone number copied!" });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 shadow-xl animate-scale-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/3 animate-float" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3 animate-float delay-300" />
      </div>

      <div className="relative z-10 p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-blink" />
          MediVoice AI · Call Bot
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Call MediVoice AI</h2>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-sm">
              Our AI call bot answers instantly. Ask about stock availability, pricing, and active offers — all recorded and saved.
            </p>
          </div>
          <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
            <Mic className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 space-y-4 border border-white/20">
          <div className="text-center">
            <p className="text-emerald-200 text-xs uppercase tracking-widest mb-2 font-medium">AI Hotline Number</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold text-white tracking-widest font-mono" data-testid="text-twilio-number">
                {twilioNumber}
              </span>
              <button
                onClick={copyNumber}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                data-testid="button-copy-number"
              >
                {copied
                  ? <CheckCheck className="h-4 w-4 text-emerald-300" />
                  : <Copy className="h-4 w-4 text-white" />
                }
              </button>
            </div>
          </div>

          <div className="flex items-end gap-1 justify-center h-10 py-1">
            {[18, 28, 14, 36, 22, 40, 18, 32, 26, 38, 16, 30, 24].map((h, i) => (
              <WaveBar key={i} height={h} delay={i * 0.06} />
            ))}
          </div>

          <a href={`tel:${twilioNumber}`} className="block">
            <Button
              className="w-full gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              data-testid="button-dial-now"
            >
              <PhoneCall className="h-5 w-5" /> Dial Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", title: "Call the number", desc: "Dial the MediVoice AI hotline above from any phone" },
    { n: "2", title: "Speak your request", desc: "Ask about stock, pricing, reorder, or current offers" },
    { n: "3", title: "AI responds instantly", desc: "The bot answers and your call is saved in history" },
  ];
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">How It Works</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="bg-card border border-border rounded-xl p-4 space-y-2 animate-fade-in-up hover-elevate"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {s.n}
            </div>
            <p className="font-semibold text-sm">{s.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentCalls({ pharmacyName }: { pharmacyName: string | null }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/conversations", pharmacyName],
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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Recent Calls</h3>
        <Link href="/pharmacy/conversations">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
          <Phone className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">No calls yet. Dial the hotline to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map((c: any, i: number) => (
            <Link key={c._id} href={`/pharmacy/conversations/${c._id}`}>
              <div
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover-elevate cursor-pointer hover:border-emerald-400 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
                data-testid={`card-call-${c._id}`}
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{c.pharmacy_name || "MediVoice AI Call"}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.pharmacist_text?.slice(0, 60) || c.ai_response?.slice(0, 60) || "—"}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{c.timestamp ? new Date(c.timestamp).toLocaleDateString() : "—"}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-50" />
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
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-16 animate-scale-in">
      <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
        <PhoneOff className="h-10 w-10 text-muted-foreground opacity-40" />
      </div>
      <div>
        <p className="text-xl font-bold">AI Hotline Not Set Up</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Twilio credentials have not been configured yet. Contact your dealer to enable the MediVoice AI call bot.
        </p>
      </div>
    </div>
  );
}

export default function VoicePage() {
  const { pharmacyName } = usePharmacyContext();
  const { data: twilioStatus, isLoading } = useQuery<any>({ queryKey: ["/api/twilio/status"] });

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-2 mb-1">
          {twilioStatus?.configured && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-blink" />}
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">MediVoice AI</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Call Bot</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Call our AI bot to ask about medicines, stock, pricing and offers — 24/7
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : twilioStatus?.configured ? (
        <>
          <CallBotHero twilioNumber={twilioStatus.phoneNumber} />
          <HowItWorks />
          <RecentCalls pharmacyName={pharmacyName} />
        </>
      ) : (
        <NotConfigured />
      )}
    </div>
  );
}
