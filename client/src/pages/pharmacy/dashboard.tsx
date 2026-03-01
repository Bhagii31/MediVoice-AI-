import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, Package, MessageSquare, User, ChevronRight, Mic, TrendingUp, Activity, Star, Zap } from "lucide-react";
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
    <Card className="hover-elevate cursor-pointer overflow-hidden group relative border-0 shadow-md animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
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
          <p className="text-4xl font-bold tracking-tight">{value}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Activity className="h-3 w-3" /> Live data
        </p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

const QUICK_ACTIONS = [
  { label: "Browse medicines", href: "/pharmacy/catalogue", icon: Package, color: "text-emerald-500", desc: "View full catalogue" },
  { label: "My orders", href: "/pharmacy/orders", icon: ChevronRight, color: "text-orange-500", desc: "Track deliveries" },
  { label: "Call history", href: "/pharmacy/conversations", icon: MessageSquare, color: "text-blue-500", desc: "View AI calls" },
  { label: "My profile", href: "/pharmacy/profile", icon: User, color: "text-violet-500", desc: "Pharmacy info" },
];

export default function PharmacyDashboard() {
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/stats"] });
  const { data: convsData, isLoading: convsLoading } = useQuery<any>({ queryKey: ["/api/conversations"] });
  const { data: orders, isLoading: ordersLoading } = useQuery<any[]>({ queryKey: ["/api/orders"] });

  const conversations = convsData?.conversations || [];
  const recentConvs = conversations.slice(0, 3);
  const pendingOrders = orders?.filter((o: any) => o.status === "Pending" || o.status === "Processing") || [];

  return (
    <div className="p-6 space-y-7">
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-blink" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pharmacist Portal</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome — your pharmacy intelligence hub</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Orders" target={orders?.length} icon={Package} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" href="/pharmacy/orders" delay={0} />
        <StatCard title="AI Calls" target={convsData?.total} icon={MessageSquare} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" href="/pharmacy/conversations" delay={80} />
        <StatCard title="Pending" target={pendingOrders.length} icon={TrendingUp} gradient="bg-gradient-to-br from-orange-500 to-amber-500" href="/pharmacy/orders" delay={160} />
        <StatCard title="Offers" target={stats?.offers} icon={Star} gradient="bg-gradient-to-br from-violet-500 to-purple-600" href="/pharmacy/catalogue" delay={240} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Link href="/pharmacy/voice">
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 animate-scale-in">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/3 translate-x-1/3 animate-float-slow" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/3 -translate-x-1/3 animate-float-slow delay-300" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-blink" />
                      AI Ready
                    </div>
                    <h2 className="text-2xl font-bold text-white">Talk to MediVoice AI</h2>
                    <p className="text-emerald-100 text-sm mt-2 leading-relaxed max-w-sm">
                      Ask about medicine availability, pricing, and current promotional offers in real-time.
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:animate-pulse-ring transition-all flex-shrink-0">
                    <Mic className="h-8 w-8 text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1 items-end h-8">
                    {[28, 40, 20, 36, 24].map((h, i) => (
                      <div key={i} className="wave-bar bg-emerald-200 rounded-full" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-emerald-200">Powered by OpenAI GPT-4</p>
                      <p className="text-xs text-emerald-300">Conversations saved automatically</p>
                    </div>
                    <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-xs gap-1 shadow-md">
                      <Zap className="h-3 w-3" /> Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm animate-fade-in">Recent AI Conversations</h2>
              <Link href="/pharmacy/conversations">
                <span className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer">View all <ChevronRight className="h-3 w-3" /></span>
              </Link>
            </div>
            {convsLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : recentConvs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  <MessageSquare className="h-7 w-7 mx-auto mb-2 opacity-30" />No calls yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recentConvs.map((c: any, i: number) => (
                  <Link key={c._id} href={`/pharmacy/conversations/${c._id}`}>
                    <Card className="hover-elevate cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <CardContent className="flex items-center gap-3 py-3 px-4">
                        <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{c.pharmacy_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.ai_response?.slice(0, 60) || "—"}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm animate-slide-right">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {QUICK_ACTIONS.map(({ label, href, icon: Icon, color, desc }, i) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors group animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-background transition-colors">
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {!ordersLoading && pendingOrders.length > 0 && (
            <Card className="border-0 shadow-sm animate-slide-right delay-150">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Active Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {pendingOrders.slice(0, 3).map((order: any, i: number) => (
                  <div key={order._id || i} className="flex items-center gap-2 text-xs animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${order.status === "Processing" ? "bg-blue-500 animate-blink" : "bg-orange-400"}`} />
                    <span className="font-medium truncate">{order.order_id || `#${i + 1}`}</span>
                    <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-medium ${order.status === "Processing" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
