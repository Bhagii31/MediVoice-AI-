import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Mic, Store, Building2, ArrowRight, Phone, Package, Tag,
  MessageSquare, Activity, Shield, Zap, CheckCircle,
  Database, Brain, Radio, FileText, TrendingUp, BarChart3,
  Clock, Bot, PhoneCall, Star, Globe, Cpu, Lock, Layers,
  ChevronDown, LayoutDashboard, Bell
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";

/* ─── Hooks ─────────────────────────────────────────────── */
function useTypewriter(texts: string[], speed = 52, pause = 2300) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = texts[idx];
    if (!del && char < cur.length) { const t = setTimeout(() => setChar(c => c + 1), speed); return () => clearTimeout(t); }
    if (!del && char === cur.length) { const t = setTimeout(() => setDel(true), pause); return () => clearTimeout(t); }
    if (del && char > 0) { const t = setTimeout(() => setChar(c => c - 1), speed / 2.2); return () => clearTimeout(t); }
    if (del && char === 0) { setDel(false); setIdx(i => (i + 1) % texts.length); }
  }, [char, del, idx, texts, speed, pause]);
  useEffect(() => { setDisplay(texts[idx].slice(0, char)); }, [char, idx, texts]);
  return display;
}

function useCountUp(target: number | undefined, dur = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!target) return;
    setV(0);
    const s = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - s) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 400);
    return () => clearTimeout(t);
  }, [target, dur]);
  return v;
}

/* ─── Live Ticker ───────────────────────────────────────── */
const EVENTS = [
  { icon: PhoneCall,   text: "Edison Pharmacy just called MediVoice AI",    color: "text-emerald-400" },
  { icon: Package,     text: "New stock request: Amoxicillin 500mg ×200",    color: "text-blue-400" },
  { icon: Star,        text: "New offer added: 15% off Paracetamol",         color: "text-amber-400" },
  { icon: CheckCircle, text: "Order #RX-2941 marked as Delivered",           color: "text-emerald-400" },
  { icon: Bot,         text: "AI processed Metformin stock enquiry",         color: "text-violet-400" },
  { icon: TrendingUp,  text: "CVS Newark placed a reorder via AI call",      color: "text-cyan-400" },
];
function LiveTicker() {
  const [cur, setCur] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const fn = () => { setVis(false); setTimeout(() => { setCur(i => (i + 1) % EVENTS.length); setVis(true); }, 360); };
    const id = setInterval(fn, 3200);
    return () => clearInterval(id);
  }, []);
  const ev = EVENTS[cur]; const Icon = ev.icon;
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium select-none">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink flex-shrink-0" />
      <span className="text-white/40 flex-shrink-0 font-semibold tracking-wide uppercase text-[10px]">Live</span>
      <div className={`flex items-center gap-1.5 transition-all duration-300 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${ev.color}`} />
        <span className="text-white/70 truncate max-w-[240px]">{ev.text}</span>
      </div>
    </div>
  );
}

/* ─── Feature Data ──────────────────────────────────────── */
const FEATURES = [
  { icon: Radio,         title: "24/7 AI Voice Hotline",       desc: "Pharmacists call in anytime — GPT-4 handles stock queries, pricing, and reorders instantly over a Twilio line.",     color: "from-purple-500 to-indigo-500" },
  { icon: Brain,         title: "Natural Language Processing",  desc: "No menus, no scripts. Pharmacists speak naturally and the AI understands complex medicine requests in real time.",   color: "from-blue-500 to-cyan-500" },
  { icon: LayoutDashboard, title: "Live Dealer Dashboard",     desc: "Dealers see every call, order, and inventory alert in real time — with live Recharts graphs and CSV exports.",        color: "from-violet-500 to-purple-500" },
  { icon: Package,       title: "Inventory Intelligence",       desc: "Automatic stock tracking with low-stock alerts, critical flags, and medicine availability across all SKUs.",          color: "from-emerald-500 to-teal-500" },
  { icon: TrendingUp,    title: "Order Pipeline",               desc: "Track every order from placement to delivery. Status updates flow from AI call to dashboard with zero manual input.", color: "from-orange-500 to-amber-500" },
  { icon: Lock,          title: "Secure & Compliant",           desc: "MongoDB Atlas encryption, HTTPS-only endpoints, and session-based auth protect all pharmacy and dealer data.",        color: "from-rose-500 to-pink-500" },
];

/* ─── How It Works ──────────────────────────────────────── */
const STEPS = [
  { step: "01", icon: Radio,      title: "Pharmacist Calls In",      desc: "Dials the MediVoice AI hotline via Twilio — available 24/7 from any phone, anywhere.",        color: "from-purple-500 to-indigo-600",  detail: "Twilio Voice SDK routes the call to the AI pipeline in under 2 seconds." },
  { step: "02", icon: Brain,      title: "AI Processes the Call",    desc: "OpenAI Whisper transcribes speech; GPT-4 understands stock levels, pricing and reorders.",    color: "from-blue-500 to-cyan-500",      detail: "'Do you have 200 units of Amoxicillin at 15% off?' — handled perfectly." },
  { step: "03", icon: Database,   title: "Data Saved Instantly",     desc: "Full conversation, AI responses and any orders created are stored in MongoDB Atlas live.",    color: "from-emerald-500 to-teal-500",   detail: "New orders appear in the dealer dashboard the moment the call ends." },
  { step: "04", icon: TrendingUp, title: "Dealer Reviews Analytics", desc: "Live charts, call logs, order pipelines and inventory health displayed on the dashboard.",    color: "from-orange-500 to-amber-500",   detail: "Recharts dashboards with CSV export — zero manual reporting needed." },
];
function HowItWorksSection() {
  const [active, setActive] = useState<number | null>(null);
  const [auto, setAuto] = useState(0);
  useEffect(() => {
    if (active !== null) return;
    const t = setInterval(() => setAuto(s => (s + 1) % STEPS.length), 2400);
    return () => clearInterval(t);
  }, [active]);
  const hl = active ?? auto;
  return (
    <section className="px-6 py-24 bg-slate-50 dark:bg-zinc-950 border-y border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-5 tracking-wide uppercase">
            <Zap className="h-3 w-3" /> End-to-End AI Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">How MediVoice AI Works</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            The full pipeline from phone call to dealer dashboard — powered by OpenAI, Twilio, and MongoDB.
          </p>
        </div>

        {/* Step connector layout */}
        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-purple-500/30 via-blue-500/30 via-emerald-500/30 to-orange-500/30" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ step, icon: Icon, title, desc, color, detail }, i) => {
              const isActive = hl === i;
              return (
                <div
                  key={step}
                  onClick={() => setActive(active === i ? null : i)}
                  className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 group animate-fade-in-up ${
                    isActive
                      ? "border-primary/30 bg-card shadow-xl shadow-black/6 -translate-y-1"
                      : "border-border bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-black/4 hover:-translate-y-0.5"
                  }`}
                  style={{ animationDelay: `${i * 90}ms` }}
                  data-testid={`card-how-it-works-${step}`}
                >
                  {/* Step dot on top for connector */}
                  <div className={`absolute -top-[9px] left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-background bg-gradient-to-br ${color} hidden lg:block transition-transform duration-300 ${isActive ? "scale-125" : ""}`} />

                  <div className="flex items-start justify-between mb-5 mt-2">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className={`text-4xl font-black leading-none transition-colors duration-300 ${isActive ? "text-primary/25" : "text-muted-foreground/12"}`}>{step}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-2 leading-snug">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                      <p className="text-xs text-primary font-medium leading-relaxed">{detail}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${hl === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Tech Stack ────────────────────────────────────────── */
const TECH = [
  { name: "OpenAI",            desc: "GPT-4 + Whisper for voice AI",  color: "from-emerald-500 to-teal-600",   icon: Brain },
  { name: "Twilio",            desc: "Voice & SMS infrastructure",     color: "from-red-500 to-pink-600",       icon: Phone },
  { name: "MongoDB Atlas",     desc: "Cloud-native database",          color: "from-green-500 to-emerald-600",  icon: Database },
  { name: "React + Vite",      desc: "Blazing-fast frontend",          color: "from-cyan-500 to-blue-600",      icon: Zap },
  { name: "Node.js + Express", desc: "REST API backend",               color: "from-lime-500 to-green-600",     icon: Globe },
  { name: "Raspberry Pi",      desc: "Edge device integration",        color: "from-pink-500 to-rose-600",      icon: Cpu },
];

/* ─── Portal Features ───────────────────────────────────── */
const DEALER_F = [
  { icon: Package,       label: "Medicine catalogue & full inventory" },
  { icon: Tag,           label: "Offers & promotions management" },
  { icon: MessageSquare, label: "AI call analytics & transcripts" },
  { icon: Activity,      label: "Real-time order pipeline" },
  { icon: BarChart3,     label: "Live dashboard charts & CSV export" },
  { icon: Bell,          label: "Low-stock & critical alerts" },
];
const PHARMACY_F = [
  { icon: Package,       label: "Browse & order medicines by catalogue" },
  { icon: Phone,         label: "MediVoice AI 24/7 phone hotline" },
  { icon: FileText,      label: "Printable PDF invoices" },
  { icon: Shield,        label: "Full order & delivery tracking" },
  { icon: MessageSquare, label: "Complete AI call history" },
  { icon: Layers,        label: "Payment methods management" },
];

/* ─── Stat Item ─────────────────────────────────────────── */
function StatItem({ label, value, icon: Icon, gradient, suffix = "" }: any) {
  const v = useCountUp(value);
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-8 px-6 text-center group">
      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="h-4.5 w-4.5 text-white" />
      </div>
      <p className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
        {value === undefined ? <span className="text-2xl text-muted-foreground">—</span> : `${v}${suffix}`}
      </p>
      <p className="text-xs text-muted-foreground max-w-[110px] leading-snug">{label}</p>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────── */
export default function Landing() {
  const { data: stats } = useQuery<any>({ queryKey: ["/api/stats"] });
  const typed = useTypewriter(["Pharmacy Intelligence", "AI-Powered Ordering", "Voice-First Supply Chain", "Real-Time Analytics"], 52, 2200);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ══════════════ NAVBAR ══════════════ */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-white/6 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Mic className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-gray-950 animate-blink" />
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="font-black text-[15px] text-white tracking-tight">MediVoice AI</span>
              <span className="text-[10px] text-gray-600 font-medium tracking-wide">PHARMACY INTELLIGENCE</span>
            </div>
          </div>

          {/* Nav links + CTAs */}
          <nav className="flex items-center gap-2">
            {/* Status chip */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15 mr-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink flex-shrink-0" />
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">AI ONLINE</span>
            </div>

            {/* Dealer — outline pill */}
            <Link href="/dealer">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-semibold hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-300 transition-all duration-200"
                data-testid="link-dealer-header"
              >
                <Store className="h-3.5 w-3.5" />
                Dealer
              </button>
            </Link>

            {/* Pharmacist — solid pill */}
            <Link href="/pharmacy">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/22 hover:border-emerald-500/45 hover:text-emerald-300 transition-all duration-200"
                data-testid="link-pharmacy-header"
              >
                <Building2 className="h-3.5 w-3.5" />
                Pharmacist
              </button>
            </Link>

            <div className="w-px h-5 bg-white/8 mx-1" />
            <div className="[&_button]:text-gray-500 [&_button:hover]:text-gray-300">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-purple-700/12 blur-3xl animate-float-slow" />
          <div className="absolute top-20 -right-24 w-[500px] h-[500px] rounded-full bg-indigo-700/10 blur-3xl animate-float-slow delay-300" />
          <div className="absolute -bottom-16 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-700/8 blur-3xl animate-float-slow delay-500" />
          {/* Dot grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-28 max-w-6xl mx-auto">
          {/* Live ticker */}
          <div className="mb-8 animate-fade-in-down">
            <LiveTicker />
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.04] mb-6 animate-fade-in-up"
            data-testid="text-hero-title"
          >
            The Future of<br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent animate-gradient" style={{ backgroundSize: "200% 200%" }}>
              {typed}
              <span className="animate-blink border-r-[3px] border-violet-400 ml-1">&nbsp;</span>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            MediVoice AI connects medicine dealers and pharmacists through an intelligent voice platform —
            automating stock enquiries, reorders, and analytics around the clock using{" "}
            <span className="text-white/80 font-semibold">OpenAI GPT-4</span>,{" "}
            <span className="text-white/80 font-semibold">Twilio Voice</span>, and{" "}
            <span className="text-white/80 font-semibold">MongoDB Atlas</span>.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <Link href="/dealer">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-200 btn-pop" data-testid="button-hero-dealer">
                <Store className="h-4 w-4" /> Dealer Portal <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
            <Link href="/pharmacy">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/8 border border-white/12 text-white text-sm font-bold hover:bg-white/12 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200" data-testid="button-hero-pharmacy">
                <Building2 className="h-4 w-4" /> Pharmacist Portal <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>

          {/* Tech pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {[
              { label: "OpenAI GPT-4",    dot: "bg-emerald-400", cls: "border-emerald-500/20 text-emerald-400" },
              { label: "Twilio Voice",    dot: "bg-red-400",     cls: "border-red-500/20 text-red-400" },
              { label: "MongoDB Atlas",   dot: "bg-green-400",   cls: "border-green-500/20 text-green-400" },
              { label: "24/7 AI Hotline", dot: "bg-blue-400 animate-blink", cls: "border-blue-500/20 text-blue-400" },
              { label: "React + Vite",    dot: "bg-cyan-400",    cls: "border-cyan-500/20 text-cyan-400" },
            ].map(b => (
              <span key={b.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border bg-white/4 ${b.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${b.dot}`} />{b.label}
              </span>
            ))}
          </div>

          {/* Scroll nudge */}
          <div className="mt-16 animate-fade-in-up opacity-40" style={{ animationDelay: "400ms" }}>
            <ChevronDown className="h-5 w-5 text-white animate-float mx-auto" />
          </div>
        </div>
      </section>

      {/* ══════════════ STATS BAR ══════════════ */}
      <section className="border-b border-border bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border animate-fade-in-up">
          <StatItem label="Pharmacies Connected" value={stats?.pharmacies}    icon={Building2}  gradient="from-purple-500 to-indigo-600" />
          <StatItem label="AI Calls Recorded"    value={stats?.conversations} icon={Phone}      gradient="from-blue-500 to-cyan-500" />
          <StatItem label="Active Offers"        value={stats?.offers}        icon={Star}       gradient="from-amber-500 to-orange-500" />
          <StatItem label="Orders Tracked"       value={stats?.pendingOrders !== undefined ? (stats.pendingOrders + 5) : undefined} icon={Clock} gradient="from-emerald-500 to-teal-600" />
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="px-6 py-24 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-5 tracking-wide uppercase">
              <Zap className="h-3 w-3" /> Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Everything You Need</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
              A complete AI-powered platform for modern medicine distribution — built for speed, accuracy, and scale.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:border-border/80 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-sm mb-2 leading-snug">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PORTAL CARDS ══════════════ */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-5 tracking-wide uppercase">
              <Layers className="h-3 w-3" /> Choose Your Portal
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">Two Portals. One Platform.</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
              Separate, tailored experiences for medicine dealers and pharmacists — each optimised for their workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Dealer */}
            <Link href="/dealer">
              <div
                className="group relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/7 hover:border-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/12 hover:-translate-y-1"
                data-testid="card-dealer-portal"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-7">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:scale-105 transition-transform duration-300">
                      <Store className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-purple-500/25 text-purple-400 bg-purple-500/8 mt-1">
                      For Dealers
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Dealer Portal</h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-7">
                    Complete medicine distribution management — control inventory, handle orders, review AI call transcripts, and track live analytics from a single dashboard.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 mb-8">
                    {DEALER_F.map(({ icon: FIcon, label }) => (
                      <div key={label} className="flex items-center gap-2.5 text-xs text-gray-500 group-hover:text-gray-300 transition-colors duration-200">
                        <div className="h-5 w-5 rounded-md bg-purple-500/12 flex items-center justify-center flex-shrink-0">
                          <FIcon className="h-3 w-3 text-purple-400" />
                        </div>
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5 text-sm font-bold text-purple-400 group-hover:gap-4 transition-all duration-300">
                    Enter Dealer Portal <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Pharmacist */}
            <Link href="/pharmacy">
              <div
                className="group relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/7 hover:border-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/12 hover:-translate-y-1"
                data-testid="card-pharmacist-portal"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-7">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                      <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-emerald-500/25 text-emerald-400 bg-emerald-500/8 mt-1">
                      For Pharmacists
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Pharmacist Portal</h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-7">
                    A single-pharmacy focused experience — browse the medicine catalogue, place orders, manage invoices, and connect with dealers through the 24/7 AI voice hotline.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 mb-8">
                    {PHARMACY_F.map(({ icon: FIcon, label }) => (
                      <div key={label} className="flex items-center gap-2.5 text-xs text-gray-500 group-hover:text-gray-300 transition-colors duration-200">
                        <div className="h-5 w-5 rounded-md bg-emerald-500/12 flex items-center justify-center flex-shrink-0">
                          <FIcon className="h-3 w-3 text-emerald-400" />
                        </div>
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-400 group-hover:gap-4 transition-all duration-300">
                    Enter Pharmacist Portal <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <HowItWorksSection />

      {/* ══════════════ TECH STACK ══════════════ */}
      <section className="px-6 py-20 bg-background border-b border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Built With Enterprise Tech</h2>
            <p className="text-muted-foreground text-sm">The same stack trusted by the world's leading companies</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TECH.map(({ name, desc, color, icon: Icon }, i) => (
              <div
                key={name}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 hover:border-border/80 transition-all duration-200 cursor-default text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
                data-testid={`badge-tech-${name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-snug">{name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="px-6 py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[300px] rounded-full bg-purple-700/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[250px] rounded-full bg-emerald-700/8 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center shadow-xl shadow-purple-500/30 mb-6 mx-auto">
            <Mic className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Ready to transform pharmacy operations?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Join MediVoice AI today. Dealers get real-time order management and AI analytics. Pharmacists get instant access to stock and 24/7 voice ordering.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dealer">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 btn-pop" data-testid="button-cta-dealer">
                <Store className="h-4 w-4" /> Dealer Portal
              </button>
            </Link>
            <Link href="/pharmacy">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 btn-pop" data-testid="button-cta-pharmacy">
                <Building2 className="h-4 w-4" /> Pharmacist Portal
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-white/6 bg-gray-950 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-black text-sm text-white leading-tight">MediVoice AI</p>
              <p className="text-[11px] text-gray-600">Masters Research Project · AI + Voice + Pharmacy</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>OpenAI</span><span className="text-gray-800">·</span>
            <span>Twilio</span><span className="text-gray-800">·</span>
            <span>MongoDB Atlas</span><span className="text-gray-800">·</span>
            <span>React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
