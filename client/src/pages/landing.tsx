import { Link } from "wouter";
import { Mic, Store, Building2, ArrowRight, Phone, Package, Tag, MessageSquare, Activity, Shield, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";

const DEALER_FEATURES = [
  { icon: Package, label: "Medicine catalogue & inventory" },
  { icon: Tag, label: "Offers & promotions management" },
  { icon: MessageSquare, label: "AI call analytics & logs" },
  { icon: Activity, label: "Real-time order tracking" },
];

const PHARMACIST_FEATURES = [
  { icon: Package, label: "Browse & enquire medicines" },
  { icon: Phone, label: "Live chat with MediVoice AI" },
  { icon: MessageSquare, label: "Full call history" },
  { icon: Shield, label: "Order & delivery tracking" },
];

function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col overflow-hidden relative">
      <FloatingOrb className="w-96 h-96 bg-purple-400/10 dark:bg-purple-500/8 top-[-80px] left-[-60px] animate-float-slow" />
      <FloatingOrb className="w-80 h-80 bg-emerald-400/10 dark:bg-emerald-500/8 top-40 right-[-40px] animate-float-slow delay-300" />
      <FloatingOrb className="w-64 h-64 bg-blue-400/8 dark:bg-blue-500/6 bottom-20 left-1/3 animate-float-slow delay-500" />

      <header className="flex items-center justify-between px-6 py-5 relative z-10 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl dealer-gradient flex items-center justify-center shadow-lg">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-blink" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight tracking-tight">MediVoice AI</p>
            <p className="text-xs text-muted-foreground">Pharmacy Intelligence Platform</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative z-10">
        <div className="text-center mb-14 max-w-2xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 border border-primary/20">
            <Zap className="h-3 w-3" />
            Powered by OpenAI + Twilio + MongoDB Atlas
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text" data-testid="text-hero-title">
            Welcome to<br />MediVoice AI
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            AI-powered voice intelligence connecting dealers and pharmacists across the medicine supply chain. Choose your portal below.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/dealer">
            <div
              className="group portal-card rounded-2xl border border-border bg-card p-8 cursor-pointer shadow-sm hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500"
              data-testid="card-dealer-portal"
            >
              <div className="relative mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:animate-pulse-ring-purple transition-all">
                  <Store className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">D</span>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2">Dealer Portal</h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Manage medicine stock, process pharmacy orders, view AI call logs, and configure promotional offers.
              </p>

              <div className="space-y-2.5 mb-7">
                {DEALER_FEATURES.map(({ icon: Icon, label }, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
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
              className="group portal-card rounded-2xl border border-border bg-card p-8 cursor-pointer shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 delay-150 animate-fade-in-up"
              data-testid="card-pharmacist-portal"
            >
              <div className="relative mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:animate-pulse-ring transition-all">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">P</span>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2">Pharmacist Portal</h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Browse medicines, place orders, talk to MediVoice AI, and manage your pharmacy profile.
              </p>

              <div className="space-y-2.5 mb-7">
                {PHARMACIST_FEATURES.map(({ icon: Icon, label }, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
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

        <div className="mt-12 flex items-center gap-8 animate-fade-in delay-700">
          {[
            { value: "12+", label: "Live Conversations" },
            { value: "4", label: "Connected Pharmacies" },
            { value: "AI", label: "Powered Calls" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
