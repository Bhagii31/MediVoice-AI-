import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Mic, Store, Building2, ArrowRight, Phone, Package, Tag,
  MessageSquare, Activity, Shield, Zap, CheckCircle, ChevronRight,
  Database, Brain, Radio, FileText, TrendingUp, Users, BarChart3, Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";

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

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Radio,
    title: "Pharmacist Calls In",
    desc: "Pharmacist dials the MediVoice AI hotline powered by Twilio. The system answers 24/7.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Processes the Call",
    desc: "OpenAI transcribes speech, understands intent — stock enquiries, pricing, reorder requests.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    step: "03",
    icon: Database,
    title: "Data Saved to MongoDB",
    desc: "The entire conversation, AI response, and any order is stored instantly in MongoDB Atlas.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Dealer Reviews Analytics",
    desc: "Dealer portal shows live charts, call logs, order pipelines and inventory health — all in real time.",
    color: "from-orange-500 to-amber-600",
  },
];

const TECH_STACK = [
  { name: "OpenAI", desc: "GPT-4 + Whisper", color: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  { name: "Twilio", desc: "Voice & SMS", color: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300", dot: "bg-red-500" },
  { name: "MongoDB Atlas", desc: "Cloud Database", color: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300", dot: "bg-green-500" },
  { name: "React + Vite", desc: "Frontend", color: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500" },
  { name: "Node.js + Express", desc: "Backend API", color: "bg-lime-100 dark:bg-lime-900/50 text-lime-700 dark:text-lime-300", dot: "bg-lime-500" },
  { name: "Raspberry Pi", desc: "Edge Device", color: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300", dot: "bg-pink-500" },
];

function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

function LiveStatBadge({ label, value, icon: Icon }: { label: string; value?: number | string; icon: any }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm animate-fade-in-up">
      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none">{value ?? "—"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { data: stats } = useQuery<any>({ queryKey: ["/api/stats"] });

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      <FloatingOrb className="w-[500px] h-[500px] bg-purple-400/8 dark:bg-purple-500/6 top-[-120px] left-[-100px] animate-float-slow" />
      <FloatingOrb className="w-[400px] h-[400px] bg-emerald-400/8 dark:bg-emerald-500/6 top-32 right-[-80px] animate-float-slow delay-300" />
      <FloatingOrb className="w-[300px] h-[300px] bg-blue-400/6 dark:bg-blue-500/4 bottom-40 left-1/3 animate-float-slow delay-500" />

      <header className="flex items-center justify-between px-6 py-5 relative z-10 animate-fade-in-down border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-blink" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight tracking-tight">MediVoice AI</p>
            <p className="text-xs text-muted-foreground">Pharmacy Intelligence Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dealer">
            <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted" data-testid="link-dealer-header">
              Dealer Portal
            </button>
          </Link>
          <Link href="/pharmacy">
            <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted" data-testid="link-pharmacy-header">
              Pharmacist Portal
            </button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <section className="flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20 animate-fade-in-down">
            <Zap className="h-3 w-3" />
            Masters Project — AI-Powered Pharmacy Supply Chain
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5 bg-gradient-to-br from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent animate-fade-in-up" data-testid="text-hero-title">
            The Future of<br />Pharmacy Intelligence
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            MediVoice AI connects medicine dealers and pharmacists through an AI-powered voice platform — automating stock enquiries, reorders, and analytics using OpenAI, Twilio, and MongoDB Atlas.
          </p>

          <div className="grid sm:grid-cols-4 gap-3 mb-12 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <LiveStatBadge label="Pharmacies" value={stats?.pharmacies} icon={Building2} />
            <LiveStatBadge label="AI Calls Made" value={stats?.conversations} icon={Phone} />
            <LiveStatBadge label="Active Offers" value={stats?.offers} icon={Tag} />
            <LiveStatBadge label="Pending Orders" value={stats?.pendingOrders} icon={Clock} />
          </div>

          <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Link href="/dealer">
              <div
                className="group portal-card rounded-2xl border border-border bg-card p-7 cursor-pointer shadow-sm hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 text-left"
                data-testid="card-dealer-portal"
              >
                <div className="relative mb-5">
                  <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/30 transition-shadow">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center border-2 border-background">
                    <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">D</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-1.5">Dealer Portal</h2>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                  Full medicine distribution management — inventory, orders, AI call logs and analytics charts.
                </p>

                <div className="space-y-2 mb-6">
                  {DEALER_FEATURES.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      <div className="h-5 w-5 rounded-md bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:gap-3 transition-all duration-200">
                  Enter Dealer Portal <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link href="/pharmacy">
              <div
                className="group portal-card rounded-2xl border border-border bg-card p-7 cursor-pointer shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 text-left"
                data-testid="card-pharmacist-portal"
              >
                <div className="relative mb-5">
                  <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center border-2 border-background">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">P</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-1.5">Pharmacist Portal</h2>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                  Single-pharmacy focused — browse medicines, track orders, view invoices and call the AI hotline.
                </p>

                <div className="space-y-2 mb-6">
                  {PHARMACIST_FEATURES.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      <div className="h-5 w-5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-3 transition-all duration-200">
                  Enter Pharmacist Portal <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="px-6 py-16 bg-muted/30 border-y border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">How MediVoice AI Works</h2>
              <p className="text-muted-foreground text-sm">End-to-end AI voice pipeline from call to analytics</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }, i) => (
                <div
                  key={step}
                  className="relative bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                  data-testid={`card-how-it-works-${step}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-3xl font-black text-muted-foreground/20">{step}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 z-10">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Built With</h2>
              <p className="text-muted-foreground text-sm">Enterprise-grade technologies powering the platform</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {TECH_STACK.map(({ name, desc, color, dot }) => (
                <div
                  key={name}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border ${color} animate-fade-in-up`}
                  data-testid={`badge-tech-${name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <div>
                    <p className="text-xs font-bold leading-none">{name}</p>
                    <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-10 border-t border-border/50 bg-muted/20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">MediVoice AI</p>
                <p className="text-xs text-muted-foreground">Masters Research Project · AI + Voice + Pharmacy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dealer">
                <button className="px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md" data-testid="button-footer-dealer">
                  Dealer Portal
                </button>
              </Link>
              <Link href="/pharmacy">
                <button className="px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md" data-testid="button-footer-pharmacy">
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
