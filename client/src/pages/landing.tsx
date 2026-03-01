import { Link } from "wouter";
import { Mic, Store, Building2, ArrowRight, Phone, Package, Tag, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Mic className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">MediVoice AI</p>
            <p className="text-xs text-muted-foreground">Pharmacy Intelligence Platform</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12 max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight mb-3" data-testid="text-hero-title">
            Welcome to MediVoice AI
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered voice intelligence for the pharmacy supply chain. Choose your portal to get started.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/dealer">
            <div
              className="group relative rounded-2xl border-2 border-transparent bg-white dark:bg-slate-800 p-8 cursor-pointer shadow-sm hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200"
              data-testid="card-dealer-portal"
            >
              <div className="h-14 w-14 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Store className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Dealer Portal</h2>
              <p className="text-muted-foreground text-sm mb-5">
                Manage medicine stock, process pharmacy orders, view AI call logs, and configure promotional offers.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  { icon: Package, label: "Medicine catalogue & inventory" },
                  { icon: Tag, label: "Offers & promotions" },
                  { icon: MessageSquare, label: "AI call analytics" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-purple-500" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all">
                Enter Dealer Portal <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link href="/pharmacy">
            <div
              className="group relative rounded-2xl border-2 border-transparent bg-white dark:bg-slate-800 p-8 cursor-pointer shadow-sm hover:shadow-lg hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-200"
              data-testid="card-pharmacist-portal"
            >
              <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Pharmacist Portal</h2>
              <p className="text-muted-foreground text-sm mb-5">
                Browse medicines, place orders, talk to MediVoice AI, and manage your pharmacy profile.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  { icon: Package, label: "Browse & order medicines" },
                  { icon: Phone, label: "Talk to MediVoice AI" },
                  { icon: MessageSquare, label: "Your call history" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                Enter Pharmacist Portal <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-10 text-xs text-muted-foreground text-center max-w-sm">
          Powered by OpenAI Whisper, Twilio, and MongoDB Atlas. Voice conversations are processed securely.
        </p>
      </main>
    </div>
  );
}
