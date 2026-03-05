import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Mic, Store, Building2, ArrowRight, Phone, Package, Tag,
  MessageSquare, Activity, Shield, Zap, CheckCircle, ChevronRight,
  Database, Brain, Radio, FileText, TrendingUp, Users, BarChart3,
  Clock, Sparkles, Bot, PhoneCall, Star, Globe, Lock, Cpu
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";

function useCountUp(target: number | undefined, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === undefined || target === 0) return;
    setValue(0);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const timeout = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(timeout);
  }, [target]);
  return value;
}

function useTypewriter(texts: string[], speed = 60, pause = 2200) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), speed);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx(i => (i + 1) % texts.length);
    }
  }, [charIdx, deleting, idx, texts, speed, pause]);

  useEffect(() => {
    setDisplay(texts[idx].slice(0, charIdx));
  }, [charIdx, idx, texts]);

  return display;
}

const LIVE_EVENTS = [
  { icon: PhoneCall, text: "Edison Pharmacy just called MediVoice AI", color: "text-emerald-500" },
  { icon: Package, text: "New stock request: Amoxicillin 500mg ×200", color: "text-blue-500" },
  { icon: Star, text: "New offer added: 15% off Paracetamol", color: "text-amber-500" },
  { icon: CheckCircle, text: "Order #RX-2941 marked as Delivered", color: "text-emerald-500" },
  { icon: Bot, text: "AI processed enquiry for Metformin stock", color: "text-violet-500" },
  { icon: TrendingUp, text: "CVS - Newark placed a reorder via AI call", color: "text-cyan-500" },
];

function LiveTicker() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(i => (i + 1) % LIVE_EVENTS.length);
        setVisible(true);
      }, 400);
    };
    const interval = setInterval(cycle, 3000);
    return () => clearInterval(interval);
  }, []);

  const ev = LIVE_EVENTS[current];
  const Icon = ev.icon;

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border shadow-sm text-xs font-medium overflow-hidden">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-blink flex-shrink-0" />
      <span className="text-muted-foreground flex-shrink-0">Live:</span>
      <div className={`flex items-center gap-1.5 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${ev.color}`} />
        <span className="truncate max-w-[220px]">{ev.text}</span>
      </div>
    </div>
  );
}

function StatCard({ label, target, icon: Icon, color, suffix = "" }: {
  label: string; target?: number; icon: any; color: string; suffix?: string;
}) {
  const value = useCountUp(target);
  return (
    <div className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-card border border-border shadow-sm hover-elevate animate-fade-in-up group">
      <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-3xl font-black tracking-tight">
        {target === undefined ? <span className="text-muted-foreground text-lg">—</span> : `${value}${suffix}`}
      </p>
      <p className="text-xs text-muted-foreground text-center leading-tight">{label}</p>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01", icon: Radio, title: "Pharmacist Calls In",
    desc: "Pharmacist dials the MediVoice AI hotline powered by Twilio. Available 24/7 from any phone.",
    color: "from-purple-500 to-indigo-600", detail: "Twilio Voice SDK handles the incoming call and routes it to the AI pipeline instantly."
  },
  {
    step: "02", icon: Brain, title: "AI Processes the Call",
    desc: "OpenAI Whisper transcribes speech and GPT-4 understands intent — stock, pricing, reorders.",
    color: "from-blue-500 to-cyan-600", detail: "Natural language understanding handles complex queries like 'Do you have 200 units of Amoxicillin?'"
  },
  {
    step: "03", icon: Database, title: "Data Saved to MongoDB",
    desc: "Full conversation, AI response, and any order placed is stored in MongoDB Atlas instantly.",
    color: "from-emerald-500 to-teal-600", detail: "Real-time database sync means dealers see new orders and calls appear in their dashboard instantly."
  },
  {
    step: "04", icon: TrendingUp, title: "Dealer Reviews Analytics",
    desc: "Dealer portal shows live charts, call logs, order pipelines and inventory health.",
    color: "from-orange-500 to-amber-600", detail: "Live Recharts dashboards with CSV export — no manual reporting needed."
  },
];

const DEALER_FEATURES = [
  { icon: Package, label: "Medicine catalogue & inventory" },
  { icon: Tag, label: "Offers & promotions management" },
  { icon: MessageSquare, label: "AI call analytics & logs" },
  { icon: Activity, label: "Real-time order pipeline" },
  { icon: BarChart3, label: "Live dashboard charts" },
];

const PHARMACIST_FEATURES = [
  { icon: Package, label: "Browse & order medicines" },
  { icon: Phone, label: "MediVoice AI phone hotline" },
  { icon: FileText, label: "Printable invoices" },
  { icon: Shield, label: "Order & delivery tracking" },
  { icon: MessageSquare, label: "Full AI call history" },
];

const TECH_STACK = [
  { name: "OpenAI", desc: "GPT-4 + Whisper for voice AI", color: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", icon: Brain },
  { name: "Twilio", desc: "Voice & SMS infrastructure", color: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300", dot: "bg-red-500", icon: Phone },
  { name: "MongoDB Atlas", desc: "Cloud-native database", color: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300", dot: "bg-green-500", icon: Database },
  { name: "React + Vite", desc: "Blazing fast frontend", color: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500", icon: Zap },
  { name: "Node.js + Express", desc: "REST API backend", color: "bg-lime-100 dark:bg-lime-900/50 text-lime-700 dark:text-lime-300", dot: "bg-lime-500", icon: Globe },
  { name: "Raspberry Pi", desc: "Edge device integration", color: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300", dot: "bg-pink-500", icon: Cpu },
];

function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

function HowItWorksSection() {
  const [active, setActive] = useState<number | null>(null);
  const [autoStep, setAutoStep] = useState(0);

  useEffect(() => {
    if (active !== null) return;
    const t = setInterval(() => setAutoStep(s => (s + 1) % HOW_IT_WORKS.length), 2000);
    return () => clearInterval(t);
  }, [active]);

  const highlighted = active !== null ? active : autoStep;

  return (
    <section className="px-6 py-20 bg-muted/30 border-y border-border/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4 border border-blue-200 dark:border-blue-800">
            <Zap className="h-3 w-3" /> End-to-End AI Pipeline
          </div>
          <h2 className="text-3xl font-black mb-3">How MediVoice AI Works</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Click any step to explore the details. The pipeline auto-highlights every 2 seconds.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, detail }, i) => {
            const isActive = highlighted === i;
            return (
              <div
                key={step}
                onClick={() => setActive(active === i ? null : i)}
                className={`relative rounded-2xl border p-5 shadow-sm cursor-pointer transition-all duration-300 animate-fade-in-up ${isActive ? "border-primary bg-card shadow-lg scale-[1.02]" : "border-border bg-card hover:border-primary/50 hover:shadow-md"}`}
                style={{ animationDelay: `${i * 80}ms` }}
                data-testid={`card-how-it-works-${step}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-3xl font-black transition-colors duration-300 ${isActive ? "text-primary/40" : "text-muted-foreground/20"}`}>{step}</span>
                </div>
                <h3 className="font-bold text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-border animate-fade-in-up">
                    <p className="text-xs text-primary font-medium leading-relaxed">{detail}</p>
                  </div>
                )}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 z-10">
                    <ChevronRight className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {HOW_IT_WORKS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${highlighted === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <section className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black mb-2">Built With</h2>
          <p className="text-muted-foreground text-sm">Enterprise-grade technologies — hover each to learn more</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {TECH_STACK.map(({ name, desc, color, dot, icon: Icon }) => (
            <div
              key={name}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-border ${color} cursor-default animate-fade-in-up transition-all duration-200 hover-elevate ${hovered === name ? "scale-105 shadow-md" : ""}`}
              data-testid={`badge-tech-${name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dot} flex-shrink-0`} />
                <div>
                  <p className="text-xs font-bold leading-none">{name}</p>
                  <p className={`text-xs opacity-70 mt-0.5 transition-all duration-200 ${hovered === name ? "max-h-8 opacity-100" : "max-h-0 opacity-0 overflow-hidden sm:max-h-8 sm:opacity-70"}`}>
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortalCard({ href, title, subtitle, features, color, icon: Icon, badge, cta, testId, featureColor }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Link href={href}>
      <div
        className={`group rounded-2xl border border-border bg-card p-7 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 text-left hover:border-${featureColor}-400 dark:hover:border-${featureColor}-500 relative overflow-hidden animate-fade-in-up`}
        data-testid={testId}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

        <div className="relative mb-5">
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full ${badge.bg} flex items-center justify-center border-2 border-background`}>
            <span className={`text-xs font-black ${badge.text}`}>{badge.letter}</span>
          </div>
        </div>

        <h2 className="text-xl font-black mb-1.5">{title}</h2>
        <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{subtitle}</p>

        <div className="space-y-2.5 mb-6">
          {features.map(({ icon: FIcon, label }: any) => (
            <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              <div className={`h-5 w-5 rounded-md ${badge.iconBg} flex items-center justify-center flex-shrink-0`}>
                <FIcon className={`h-3 w-3 ${badge.iconText}`} />
              </div>
              <span>{label}</span>
              <CheckCircle className={`h-3 w-3 ml-auto ${badge.iconText} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

        <div className={`flex items-center gap-2 text-sm font-black ${badge.cta} group-hover:gap-4 transition-all duration-300`}>
          {cta} <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

export default function Landing() {
  const { data: stats } = useQuery<any>({ queryKey: ["/api/stats"] });
  const pharmacies = useCountUp(stats?.pharmacies);
  const calls = useCountUp(stats?.conversations);
  const offers = useCountUp(stats?.offers);
  const orders = useCountUp(stats?.pendingOrders);

  const typed = useTypewriter([
    "Pharmacy Intelligence",
    "AI-Powered Supply Chain",
    "Voice-First Ordering",
    "Real-Time Analytics",
  ], 55, 2000);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      <FloatingOrb className="w-[500px] h-[500px] bg-purple-400/8 dark:bg-purple-500/6 top-[-120px] left-[-100px] animate-float-slow" />
      <FloatingOrb className="w-[400px] h-[400px] bg-emerald-400/8 dark:bg-emerald-500/6 top-32 right-[-80px] animate-float-slow delay-300" />
      <FloatingOrb className="w-[300px] h-[300px] bg-blue-400/6 dark:bg-blue-500/4 bottom-40 left-1/3 animate-float-slow delay-500" />

      <header className="flex items-center justify-between px-6 py-4 relative z-10 animate-fade-in-down border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-blink" />
          </div>
          <div>
            <p className="font-black text-base leading-tight">MediVoice AI</p>
            <p className="text-xs text-muted-foreground">Pharmacy Intelligence Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dealer">
            <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted" data-testid="link-dealer-header">
              Dealer Portal
            </button>
          </Link>
          <Link href="/pharmacy">
            <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted" data-testid="link-pharmacy-header">
              Pharmacist Portal
            </button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <section className="flex flex-col items-center justify-center px-4 pt-16 pb-20 text-center max-w-5xl mx-auto">
          <div className="mb-6 animate-fade-in-down">
            <LiveTicker />
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 animate-fade-in-up" data-testid="text-hero-title">
            The Future of<br />
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
              {typed}
              <span className="animate-blink border-r-2 border-purple-500 ml-0.5">&nbsp;</span>
            </span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            MediVoice AI connects medicine dealers and pharmacists through an AI voice platform — automating stock enquiries, reorders, and analytics using OpenAI, Twilio, and MongoDB Atlas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {[
              { label: "Open AI", color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
              { label: "Twilio Voice", color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300", dot: "bg-red-500" },
              { label: "MongoDB Atlas", color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300", dot: "bg-green-500" },
              { label: "24/7 AI Hotline", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300", dot: "bg-blue-500 animate-blink" },
            ].map(b => (
              <span key={b.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-transparent ${b.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} /> {b.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <StatCard label="Pharmacies Connected" target={stats?.pharmacies} icon={Building2} color="bg-gradient-to-br from-purple-500 to-indigo-600" />
            <StatCard label="AI Calls Recorded" target={stats?.conversations} icon={Phone} color="bg-gradient-to-br from-blue-500 to-cyan-500" />
            <StatCard label="Active Offers" target={stats?.offers} icon={Star} color="bg-gradient-to-br from-amber-500 to-orange-500" />
            <StatCard label="Pending Orders" target={stats?.pendingOrders} icon={Clock} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl" style={{ animationDelay: "250ms" }}>
            <PortalCard
              href="/dealer"
              title="Dealer Portal"
              subtitle="Full medicine distribution management — inventory, orders, AI call logs and live analytics."
              features={DEALER_FEATURES}
              color="from-purple-500 to-indigo-600"
              icon={Store}
              featureColor="purple"
              badge={{ bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-600 dark:text-purple-400", letter: "D", iconBg: "bg-purple-100 dark:bg-purple-900/60", iconText: "text-purple-600 dark:text-purple-400", cta: "text-purple-600 dark:text-purple-400" }}
              cta="Enter Dealer Portal"
              testId="card-dealer-portal"
            />
            <PortalCard
              href="/pharmacy"
              title="Pharmacist Portal"
              subtitle="Single-pharmacy focused — browse medicines, track orders, view invoices and call the AI hotline."
              features={PHARMACIST_FEATURES}
              color="from-emerald-500 to-teal-600"
              icon={Building2}
              featureColor="emerald"
              badge={{ bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-600 dark:text-emerald-400", letter: "P", iconBg: "bg-emerald-100 dark:bg-emerald-900/60", iconText: "text-emerald-600 dark:text-emerald-400", cta: "text-emerald-600 dark:text-emerald-400" }}
              cta="Enter Pharmacist Portal"
              testId="card-pharmacist-portal"
            />
          </div>
        </section>

        <HowItWorksSection />
        <TechStackSection />

        <section className="px-6 py-10 border-t border-border/50 bg-muted/20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-black text-sm">MediVoice AI</p>
                <p className="text-xs text-muted-foreground">Masters Research Project · AI + Voice + Pharmacy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dealer">
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-black hover:opacity-90 hover:shadow-lg transition-all shadow-md" data-testid="button-footer-dealer">
                  Dealer Portal
                </button>
              </Link>
              <Link href="/pharmacy">
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-black hover:opacity-90 hover:shadow-lg transition-all shadow-md" data-testid="button-footer-pharmacy">
                  Pharmacist Portal
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
