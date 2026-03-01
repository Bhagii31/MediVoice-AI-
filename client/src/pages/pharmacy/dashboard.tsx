import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Phone, Package, MessageSquare, FileText, ChevronRight,
  Activity, Star, Zap, PhoneCall, Clock, Bot, Building2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePharmacyContext } from "@/lib/pharmacy-context";

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
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
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
  { label: "My Orders", href: "/pharmacy/orders", icon: Package, color: "text-emerald-500", desc: "Track your order status" },
  { label: "Invoices", href: "/pharmacy/invoices", icon: FileText, color: "text-blue-500", desc: "View & print invoices" },
  { label: "Browse Medicines", href: "/pharmacy/catalogue", icon: Star, color: "text-violet-500", desc: "Full product catalogue" },
  { label: "Call History", href: "/pharmacy/conversations", icon: MessageSquare, color: "text-orange-500", desc: "Past AI call transcripts" },
];

export default function PharmacyDashboard() {
  const { pharmacyName } = usePharmacyContext();
  const { data: stats } = useQuery<any>({ queryKey: ["/api/stats"] });
  const { data: convsData, isLoading: convsLoading } = useQuery<any>({ queryKey: ["/api/conversations"] });
  const { data: orders } = useQuery<any[]>({ queryKey: ["/api/stock-requests"] });
  const { data: twilioStatus } = useQuery<any>({ queryKey: ["/api/twilio/status"] });

  const conversations = convsData?.conversations || [];
  const recentConvs = conversations.slice(0, 3);
  const pendingOrders = orders?.filter((o: any) => o.status === "Pending" || o.status === "Processing") || [];
  const totalOwed = orders?.filter((o: any) => o.payment_status !== "Paid").reduce((s: number, o: any) => s + (o.total_amount || 0), 0) || 0;

  return (
    <div className="p-6 space-y-7">
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-blink" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pharmacist Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{pharmacyName || "Dashboard"}</h1>
            <p className="text-muted-foreground text-sm">Your pharmacy intelligence hub</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" target={orders?.length} icon={Package} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" href="/pharmacy/orders" delay={0} />
        <StatCard title="AI Calls" target={convsData?.total} icon={MessageSquare} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" href="/pharmacy/conversations" delay={80} />
        <StatCard title="Pending Orders" target={pendingOrders.length} icon={Clock} gradient="bg-gradient-to-br from-orange-500 to-amber-500" href="/pharmacy/orders" delay={160} />
        <StatCard title="Active Offers" target={stats?.offers} icon={Star} gradient="bg-gradient-to-br from-violet-500 to-purple-600" href="/pharmacy/catalogue" delay={240} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Link href="/pharmacy/voice">
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-7 shadow-lg hover:shadow-2xl transition-shadow duration-300 animate-scale-in">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/3 animate-float" />
                <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3 animate-float delay-300" />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-blink" />
                      {twilioStatus?.configured ? `Hotline: ${twilioStatus.phoneNumber}` : "AI Call Bot"}
                    </div>
                    <h2 className="text-xl font-bold text-white">Call MediVoice AI</h2>
                    <p className="text-emerald-100 text-sm mt-1.5 leading-relaxed max-w-xs">
                      Dial our AI call bot to ask about stock, pricing, and current offers — available 24/7.
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5 items-end h-7">
                    {[14, 22, 10, 28, 16, 24, 12, 20].map((h, i) => (
                      <div key={i} className="wave-bar bg-emerald-200/70 rounded-full" style={{ height: `${h}px`, width: "3px" }} />
                    ))}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-xs text-emerald-200">Powered by Twilio + OpenAI</p>
                    <div className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
                      <PhoneCall className="h-3.5 w-3.5" /> View Hotline
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Recent AI Calls</h2>
              <Link href="/pharmacy/conversations">
                <span className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer">
                  View all <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
            {convsLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : recentConvs.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  <Phone className="h-7 w-7 mx-auto mb-2 opacity-30" />No calls yet. Dial the MediVoice AI hotline!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recentConvs.map((c: any, i: number) => (
                  <Link key={c._id} href={`/pharmacy/conversations/${c._id}`}>
                    <Card className="hover-elevate cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <CardContent className="flex items-center gap-3 py-3 px-4">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{c.pharmacy_name || "MediVoice AI Call"}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.ai_response?.slice(0, 60) || c.pharmacist_text?.slice(0, 60) || "—"}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          {c.timestamp ? new Date(c.timestamp).toLocaleDateString() : "—"}
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
              <p className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" /> Quick Actions
              </p>
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

          {totalOwed > 0 && (
            <Link href="/pharmacy/invoices">
              <Card className="border-0 shadow-sm animate-slide-right delay-150 hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Pending Payments</p>
                    <FileText className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${totalOwed.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view invoices</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {pendingOrders.length > 0 && (
            <Card className="border-0 shadow-sm animate-slide-right delay-200">
              <CardHeader className="pb-2">
                <p className="text-sm font-semibold">Active Orders</p>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {pendingOrders.slice(0, 3).map((order: any, i: number) => (
                  <div key={order._id || i} className="flex items-center gap-2 text-xs animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${order.status === "Processing" ? "bg-blue-500 animate-blink" : "bg-orange-400"}`} />
                    <span className="font-medium truncate">{order.order_id || `Order #${i + 1}`}</span>
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
