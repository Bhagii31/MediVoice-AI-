import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Building2, MessageSquare, AlertTriangle, ClipboardList, Pill, Tag, Phone, TrendingUp, ChevronRight, Activity, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function useCountUp(target: number | undefined, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === undefined) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function StatCard({ title, target, icon: Icon, gradient, href, delay = 0 }: {
  title: string; target?: number; icon: any; gradient: string; href?: string; delay?: number;
}) {
  const value = useCountUp(target);
  const content = (
    <Card
      className="hover-elevate cursor-pointer overflow-hidden group relative border-0 shadow-md animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient}`} />
      <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2.5 rounded-xl text-white shadow-md ${gradient}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {target === undefined ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-4xl font-bold tracking-tight" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>{value}</p>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>Live data</span>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

const QUICK_ACTIONS = [
  { label: "View all pharmacies", href: "/dealer/pharmacies", icon: Building2, color: "text-purple-500" },
  { label: "Manage medicine catalogue", href: "/dealer/medicines", icon: Pill, color: "text-green-500" },
  { label: "Process pending orders", href: "/dealer/orders", icon: ClipboardList, color: "text-orange-500" },
  { label: "Create new offer", href: "/dealer/offers", icon: Tag, color: "text-blue-500" },
  { label: "View call logs", href: "/dealer/conversations", icon: MessageSquare, color: "text-violet-500" },
];

const OUTBOUND_STEPS = [
  "Raspberry Pi detects low-stock keywords",
  "Whisper converts speech to text in real-time",
  "MediVoice AI dials the pharmacy via Twilio",
  "AI discusses reorders & active promo offers",
  "Order & conversation stored automatically",
];

export default function DealerDashboard() {
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/stats"] });

  return (
    <div className="p-6 space-y-7">
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-blink" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dealer Portal</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your medicine distribution overview — live data from MongoDB Atlas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pharmacies Served" target={stats?.pharmacies} icon={Building2} gradient="bg-gradient-to-br from-purple-500 to-indigo-600" href="/dealer/pharmacies" delay={0} />
        <StatCard title="Pending Orders" target={stats?.pendingOrders} icon={ClipboardList} gradient="bg-gradient-to-br from-orange-500 to-red-500" href="/dealer/orders" delay={80} />
        <StatCard title="Total AI Calls" target={stats?.conversations} icon={MessageSquare} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" href="/dealer/conversations" delay={160} />
        <StatCard title="Low Stock Alerts" target={stats?.lowStock} icon={AlertTriangle} gradient="bg-gradient-to-br from-amber-500 to-orange-500" href="/dealer/inventory" delay={240} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base animate-fade-in">Recent AI Calls</h2>
            <Link href="/dealer/conversations">
              <span className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">View all <ChevronRight className="h-3 w-3" /></span>
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : !stats?.recentCalls?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No call logs yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {stats.recentCalls.map((call: any, i: number) => (
                <Link key={call._id} href={`/dealer/conversations/${call._id}`}>
                  <Card
                    className="hover-elevate cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                    data-testid={`card-call-${call._id}`}
                  >
                    <CardContent className="flex items-center justify-between py-3 px-4 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{call.pharmacy_name || "Unknown Pharmacy"}</p>
                          <p className="text-xs text-muted-foreground truncate">{call.ai_response?.slice(0, 55) || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(call.timestamp || call.createdAt).toLocaleDateString()}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm animate-slide-right">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }, i) => (
                <Link key={href} href={href}>
                  <div
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted text-sm cursor-pointer transition-colors group animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="font-medium">{label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm animate-slide-right delay-150">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" /> Outbound Call Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="relative">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-purple-400 to-transparent" />
                <div className="space-y-3">
                  {OUTBOUND_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 pl-1 animate-fade-in-up"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-400 text-xs flex items-center justify-center font-bold z-10">
                        {i + 1}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed pt-1">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
