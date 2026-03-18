import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Mic, Store, Building2, ArrowRight, Phone, Package, Tag,
  MessageSquare, Activity, Shield, Zap, CheckCircle, ChevronRight,
  Database, Brain, Radio, FileText, TrendingUp, BarChart3,
  Clock, Bot, PhoneCall, Star, Globe, Cpu, Sparkles
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";

/* ─── Typewriter ────────────────────────────────────────── */
function useTypewriter(texts: string[], speed = 55, pause = 2200) {
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
    if (deleting && charIdx === 0) { setDeleting(false); setIdx(i => (i + 1) % texts.length); }
  }, [charIdx, deleting, idx, texts, speed, pause]);
  useEffect(() => { setDisplay(texts[idx].slice(0, charIdx)); }, [charIdx, idx, texts]);
  return display;
}

/* ─── Counter ───────────────────────────────────────────── */
function useCountUp(target: number | undefined, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    setValue(0);
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(t);
  }, [target, duration]);
  return value;
}

/* ─── Live Ticker ───────────────────────────────────────── */
const LIVE_EVENTS = [
  { icon: PhoneCall, text: "Edison Pharmacy called MediVoice AI", color: "text-emerald-400" },
  { icon: Package,   text: "New stock request: Amoxicillin 500mg ×200", color: "text-blue-400" },
  { icon: Star,      text: "New offer: 15% off Paracetamol", color: "text-amber-400" },
  { icon: CheckCircle, text: "Order #RX-2941 marked as Delivered", color: "text-emerald-400" },
  { icon: Bot,       text: "AI processed Metformin stock enquiry", color: "text-violet-400" },
  { icon: TrendingUp, text: "CVS Newark reordered via AI call", color: "text-cyan-400" },
];

function LiveTicker() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => { setCurrent(i => (i + 1) % LIVE_EVENTS.length); setVisible(true); }, 350);
    };
    const interval = setInterval(cycle, 3000);
    return () => clearInterval(interval);
  }, []);
  const ev = LIVE_EVENTS[current];
  const Icon = ev.icon;
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink flex-shrink-0" />
      <span className="text-white/50 flex-shrink-0">Live</span>
      <div className={`flex items-center gap-1.5 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${ev.color}`} />
        <span className="text-white/80 truncate max-w-[220px]">{ev.text}</span>
      </div>
    </div>
  );
}

/* ─── How It Works ──────────────────────────────────────── */
const HOW_IT_WORKS = [
  { step: "01", icon: Radio,     title: "Pharmacist Calls In",    desc: "Dials the MediVoice AI hotline via Twilio — available 24/7 from any phone.",        color: "from-purple-500 to-indigo-600", detail: "Twilio Voice SDK handles routing to the AI pipeline in under 2 seconds." },
  { step: "02", icon: Brain,     title: "AI Processes the Call",  desc: "OpenAI Whisper transcribes speech; GPT-4 understands stock, pricing and reorders.", color: "from-blue-500 to-cyan-500",     detail: "Handles complex queries: 'Do you have 200 units of Amoxicillin at 15% off?'" },
  { step: "03", icon: Database,  title: "Data Saved Instantly",   desc: "Full conversation, AI response and orders stored in MongoDB Atlas in real time.",   color: "from-emerald-500 to-teal-500",  detail: "New orders appear in the dealer dashboard the moment the call ends." },
  { step: "04", icon: TrendingUp, title: "Dealer Reviews Analytics", desc: "Live charts, call logs, order pipelines and inventory health on the dashboard.",  color: "from-orange-500 to-amber-500",  detail: "Recharts dashboards with CSV export — zero manual reporting needed." },
];

function HowItWorksSection() {
  const [active, setActive] = useState<number | null>(null);
  const [autoStep, setAutoStep] = useState(0);
  useEffect(() => {
    if (active !== null) return;
    const t = setInterval(() => setAutoStep(s => (s + 1) % HOW_IT_WORKS.length), 2200);
    return () => clearInterval(t);
  }, [active]);
  const highlighted = active ?? autoStep;
  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
            <Zap className="h-3 w-3" /> End-to-End AI Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">How MediVoice AI Works</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Click any step to explore. Auto-highlights every 2 seconds.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, detail }, i) => {
            const isActive = highlighted === i;
            return (
              <div
                key={step}
                onClick={() => setActive(active === i ? null : i)}
                className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 animate-fade-in-up group ${
                  isActive
                    ? "border-primary/40 bg-card shadow-xl shadow-black/5 scale-[1.02]"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1"
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
                data-testid={`card-how-it-works-${step}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-4xl font-black transition-colors duration-300 ${isActive ? "text-primary/30" : "text-muted-foreground/15"}`}>{step}</span>
                </div>
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                {isActive && (
                  <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                    <p className="text-xs text-primary font-medium leading-relaxed">{detail}</p>
                  </div>
                )}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2.5 z-10 -translate-y-1/2">
                    <ChevronRight className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {HOW_IT_WORKS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${highlighted === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Tech Stack ────────────────────────────────────────── */
const TECH_STACK = [
  { name: "OpenAI",           desc: "GPT-4 + Whisper for voice AI",  color: "from-emerald-500 to-teal-600",    dot: "bg-emerald-500", icon: Brain },
  { name: "Twilio",           desc: "Voice & SMS infrastructure",     color: "from-red-500 to-pink-600",        dot: "bg-red-500",     icon: Phone },
  { name: "MongoDB Atlas",    desc: "Cloud-native database",          color: "from-green-500 to-emerald-600",   dot: "bg-green-500",   icon: Database },
  { name: "React + Vite",     desc: "Blazing fast frontend",          color: "from-cyan-500 to-blue-600",       dot: "bg-cyan-500",    icon: Zap },
  { name: "Node.js + Express", desc: "REST API backend",             color: "from-lime-500 to-green-600",      dot: "bg-lime-500",    icon: Globe },
  { name: "Raspberry Pi",     desc: "Edge device integration",        color: "from-pink-500 to-rose-600",       dot: "bg-pink-500",    icon: Cpu },
];

function TechStackSection() {
  return (
    <section className="px-6 py-16 bg-muted/30 border-y border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black tracking-tight mb-2">Built With Enterprise Tech</h2>
          <p className="text-muted-foreground text-sm">The same stack trusted by the world's leading companies</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {TECH_STACK.map(({ name, desc, color, icon: Icon }, i) => (
            <div
              key={name}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
              data-testid={`badge-tech-${name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold leading-none">{name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Portal Card ───────────────────────────────────────── */
const DEALER_FEATURES = [
  { icon: Package,     label: "Medicine catalogue & inventory" },
  { icon: Tag,         label: "Offers & promotions management" },
  { icon: MessageSquare, label: "AI call analytics & logs" },
  { icon: Activity,    label: "Real-time order pipeline" },
  { icon: BarChart3,   label: "Live dashboard charts" },
];
const PHARMACIST_FEATURES = [
  { icon: Package,     label: "Browse & order medicines" },
  { icon: Phone,       label: "MediVoice AI phone hotline" },
  { icon: FileText,    label: "Printable invoices" },
  { icon: Shield,      label: "Order & delivery tracking" },
  { icon: MessageSquare, label: "Full AI call history" },
];

function PortalCard({ href, title, subtitle, features, gradient, icon: Icon, accentColor, cta, testId }: any) {
  return (
    <Link href={href}>
      <div
        className={`group relative rounded-2xl border border-border/60 bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/8 hover:-translate-y-1 hover:border-border`}
        data-testid={testId}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.035] transition-opacity duration-500`} />
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${accentColor}`}>
              Portal
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{subtitle}</p>

          <div className="space-y-2.5 mb-7">
            {features.map(({ icon: FIcon, label }: any) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-200">
                <CheckCircle className={`h-3.5 w-3.5 flex-shrink-0 ${accentColor.split(" ")[0].replace("border-", "text-").replace("/40", "")}`} />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>

          <div className={`flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
            {cta} <ArrowRight className="h-4 w-4 text-current opacity-70" style={{ backgroundImage: "none", WebkitTextFillColor: "currentcolor" }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Stat Bar ──────────────────────────────────────────── */
function StatBar({ label, value, icon: Icon, gradient }: { label: string; value: number | undefined; icon: any; gradient: string }) {
  const v = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-2 py-6 px-4">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md mb-1`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-3xl font-black tracking-tight">{value === undefined ? "—" : v}</p>
      <p className="text-xs text-muted-foreground text-center max-w-[100px] leading-snug">{label}</p>
    </div>
  );
}

/* ─── Main Landing ──────────────────────────────────────── */
export default function Landing() {
  const { data: stats } = useQuery<any>({ queryKey: ["/api/stats"] });
  const typed = useTypewriter(["Pharmacy Intelligence", "AI-Powered Supply Chain", "Voice-First Ordering", "Real-Time Analytics"], 55, 2100);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-md flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-gray-950 animate-blink" />
          </div>
          <span className="font-black text-sm text-white tracking-tight">MediVoice AI</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/dealer">
            <button className="text-xs font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8" data-testid="link-dealer-header">
              Dealer Portal
            </button>
          </Link>
          <Link href="/pharmacy">
            <button className="text-xs font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8" data-testid="link-pharmacy-header">
              Pharmacist Portal
            </button>
          </Link>
          <div className="ml-1 [&_button]:text-gray-400 [&_button:hover]:text-white [&_button:hover]:bg-white/8">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-3xl animate-float-slow" />
          <div className="absolute top-[60px] right-[-60px] w-[400px] h-[400px] rounded-full bg-indigo-600/12 blur-3xl animate-float-slow delay-300" />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-600/8 blur-3xl animate-float-slow delay-500" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-24 max-w-5xl mx-auto">

          {/* Live ticker */}
          <div className="mb-8 animate-fade-in-down">
            <LiveTicker />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-5 animate-fade-in-up leading-[1.05]" data-testid="text-hero-title">
            The Future of<br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent animate-gradient" style={{ backgroundSize: "200% 200%" }}>
              {typed}<span className="animate-blink border-r-2 border-violet-400 ml-0.5">&nbsp;</span>
            </span>
          </h1>

          {/* Sub */}
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            MediVoice AI connects medicine dealers and pharmacists through an AI voice platform — automating stock enquiries, reorders, and analytics using <span className="text-white/80 font-medium">OpenAI</span>, <span className="text-white/80 font-medium">Twilio</span>, and <span className="text-white/80 font-medium">MongoDB Atlas</span>.
          </p>

          {/* Tech pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-14 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {[
              { label: "OpenAI GPT-4",   dot: "bg-emerald-400", cls: "border-emerald-500/25 text-emerald-400" },
              { label: "Twilio Voice",   dot: "bg-red-400",     cls: "border-red-500/25 text-red-400" },
              { label: "MongoDB Atlas",  dot: "bg-green-400",   cls: "border-green-500/25 text-green-400" },
              { label: "24/7 AI Hotline", dot: "bg-blue-400 animate-blink", cls: "border-blue-500/25 text-blue-400" },
            ].map(b => (
              <span key={b.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-white/5 ${b.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${b.dot}`} />{b.label}
              </span>
            ))}
          </div>

          {/* Portal Cards */}
          <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl text-left animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/8 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <Link href="/dealer">
                <div className="p-7" data-testid="card-dealer-portal">
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10">Dealer</span>
                  </div>
                  <h2 className="text-lg font-black text-white mb-2">Dealer Portal</h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5">Full medicine distribution — inventory, orders, AI call logs and live analytics.</p>
                  <div className="space-y-2 mb-6">
                    {DEALER_FEATURES.map(({ icon: FIcon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                        <CheckCircle className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-400 group-hover:gap-3 transition-all">
                    Enter Dealer Portal <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>

            <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/8 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <Link href="/pharmacy">
                <div className="p-7" data-testid="card-pharmacist-portal">
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Pharmacy</span>
                  </div>
                  <h2 className="text-lg font-black text-white mb-2">Pharmacist Portal</h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5">Single-pharmacy focused — browse medicines, track orders, invoices and the AI hotline.</p>
                  <div className="space-y-2 mb-6">
                    {PHARMACIST_FEATURES.map(({ icon: FIcon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:gap-3 transition-all">
                    Enter Pharmacist Portal <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-b border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/50 animate-fade-in-up">
          <StatBar label="Pharmacies Connected" value={stats?.pharmacies}     icon={Building2}  gradient="from-purple-500 to-indigo-600" />
          <StatBar label="AI Calls Recorded"    value={stats?.conversations}  icon={Phone}      gradient="from-blue-500 to-cyan-500" />
          <StatBar label="Active Offers"         value={stats?.offers}         icon={Star}       gradient="from-amber-500 to-orange-500" />
          <StatBar label="Pending Orders"        value={stats?.pendingOrders}  icon={Clock}      gradient="from-emerald-500 to-teal-600" />
        </div>
      </section>

      {/* ── How It Works ── */}
      <HowItWorksSection />

      {/* ── Tech Stack ── */}
      <TechStackSection />

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 bg-gray-950 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-black text-sm text-white">MediVoice AI</p>
              <p className="text-xs text-gray-500">Masters Research Project · AI + Voice + Pharmacy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dealer">
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25 transition-all shadow-md btn-pop" data-testid="button-footer-dealer">
                Dealer Portal
              </button>
            </Link>
            <Link href="/pharmacy">
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/25 transition-all shadow-md btn-pop" data-testid="button-footer-pharmacy">
                Pharmacist Portal
              </button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
