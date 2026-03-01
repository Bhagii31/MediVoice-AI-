import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Building2, MessageSquare, AlertTriangle, ClipboardList, Pill, Tag, Phone, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, icon: Icon, color, href }: {
  title: string; value?: number; icon: any; color: string; href?: string;
}) {
  const content = (
    <Card className="hover-elevate cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {value === undefined ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>{value}</p>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DealerDashboard() {
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/stats"] });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Dealer Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your medicine distribution overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <StatCard title="Pharmacies Served" value={stats?.pharmacies} icon={Building2} color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400" href="/dealer/pharmacies" />
        <StatCard title="Pending Orders" value={stats?.pendingOrders} icon={ClipboardList} color="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" href="/dealer/orders" />
        <StatCard title="Total AI Calls" value={stats?.conversations} icon={MessageSquare} color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" href="/dealer/conversations" />
        <StatCard title="Low Stock Alerts" value={stats?.lowStock} icon={AlertTriangle} color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400" href="/dealer/inventory" />
      </div>

      <div>
        <h2 className="font-semibold mb-3 text-base">Recent AI Calls</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
          </div>
        ) : !stats?.recentCalls?.length ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No call logs yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {stats.recentCalls.map((call: any) => (
              <Link key={call._id} href={`/dealer/conversations/${call._id}`}>
                <Card className="hover-elevate cursor-pointer" data-testid={`card-call-${call._id}`}>
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{call.pharmacy_name || "Unknown Pharmacy"}</p>
                        <p className="text-xs text-muted-foreground">{call.ai_response?.slice(0, 60) || "—"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(call.timestamp || call.createdAt).toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "View all pharmacies", href: "/dealer/pharmacies", icon: Building2 },
              { label: "Manage medicine catalogue", href: "/dealer/medicines", icon: Pill },
              { label: "Process pending orders", href: "/dealer/orders", icon: ClipboardList },
              { label: "Create new offer", href: "/dealer/offers", icon: Tag },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm cursor-pointer transition-colors">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Outbound Call Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {[
              "Raspberry Pi detects low-stock keywords",
              "Whisper converts speech to text",
              "MediVoice AI calls the pharmacy",
              "AI discusses reorders & active offers",
              "Order is created automatically",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
