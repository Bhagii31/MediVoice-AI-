import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ClipboardList, Phone, MessageSquare, Pill, ArrowRight, Mic } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PharmacyDashboard() {
  const { data: stats } = useQuery<any>({ queryKey: ["/api/stats"] });
  const { data: conversations } = useQuery<any>({ queryKey: ["/api/conversations"] });
  const recentCalls = conversations?.conversations?.slice(0, 3) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Pharmacy Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome to MediVoice AI — your pharmacy assistant</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/pharmacy/orders">
          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Orders</CardTitle>
              <div className="p-2 rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                <ClipboardList className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {stats === undefined ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-3xl font-bold" data-testid="stat-orders">{stats?.pendingOrders ?? 0}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">pending</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pharmacy/conversations">
          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
              <div className="p-2 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                <MessageSquare className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {stats === undefined ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-3xl font-bold" data-testid="stat-calls">{stats?.conversations ?? 0}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">with MediVoice AI</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pharmacy/catalogue">
          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Medicines</CardTitle>
              <div className="p-2 rounded-md bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400">
                <Pill className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" data-testid="stat-medicines">—</p>
              <p className="text-xs text-muted-foreground mt-1">in catalogue</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Link href="/pharmacy/voice">
        <Card className="hover-elevate cursor-pointer border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20" data-testid="card-call-ai">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">Call MediVoice AI</p>
                <p className="text-sm text-muted-foreground">Ask about stock, place orders, or get medicine info</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Start Call</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <div>
        <h2 className="font-semibold mb-3 text-base">Recent Calls</h2>
        {recentCalls.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No calls yet. Use "Call MediVoice AI" above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentCalls.map((call: any) => (
              <Link key={call._id} href={`/pharmacy/conversations/${call._id}`}>
                <Card className="hover-elevate cursor-pointer" data-testid={`card-call-${call._id}`}>
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{call.pharmacy_name || "Your Pharmacy"}</p>
                        <p className="text-xs text-muted-foreground">{call.ai_response?.slice(0, 60) || "—"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(call.timestamp).toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
