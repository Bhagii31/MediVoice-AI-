import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, User, Calendar, CreditCard, Package, TrendingUp, Mic } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { usePharmacyContext } from "@/lib/pharmacy-context";

const STATUS_CONFIG: Record<string, { bg: string; dot: string; label: string; bar: string }> = {
  Pending:    { bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900", dot: "bg-amber-500", label: "Pending", bar: "bg-amber-400" },
  Processing: { bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900", dot: "bg-blue-500 animate-blink", label: "Processing", bar: "bg-blue-400" },
  Delivered:  { bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900", dot: "bg-emerald-500", label: "Delivered", bar: "bg-emerald-400" },
  Cancelled:  { bg: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900", dot: "bg-red-500", label: "Cancelled", bar: "bg-red-400" },
};

const PIPELINE = ["Pending", "Processing", "Delivered"];

function OrderCard({ order, index }: { order: any; index: number }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const pipelineIdx = PIPELINE.indexOf(order.status);

  return (
    <Card
      className="hover-elevate border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
      data-testid={`card-order-${order._id}`}
    >
      <div className={`h-1.5 w-full ${order.status === "Delivered" ? "bg-emerald-500" : order.status === "Processing" ? "bg-blue-500" : order.status === "Cancelled" ? "bg-red-400" : "bg-amber-400"}`} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-sm">{order.order_id || `Order #${String(order._id).slice(-6).toUpperCase()}`}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">ID: {order.pharmacist_id || "—"}</span>
            </div>
            {order.order_timestamp && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>{new Date(order.order_timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border flex-shrink-0 ${cfg.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {order.status}
          </div>
        </div>

        {order.status !== "Cancelled" && pipelineIdx >= 0 && (
          <div className="flex items-center gap-1">
            {PIPELINE.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-1.5 flex-1 rounded-full ${i <= pipelineIdx ? cfg.bar : "bg-muted"}`} />
                {i < PIPELINE.length - 1 && <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${i < pipelineIdx ? cfg.dot : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        )}

        {order.items?.length > 0 && (
          <div className="space-y-1.5">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs bg-muted/60 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{item.medicine_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>×{item.quantity}</span>
                  {item.unit_price && <span className="font-semibold text-foreground">${(item.unit_price * item.quantity).toFixed(2)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div>
            {order.total_amount !== undefined && (
              <p className="font-bold text-base">${order.total_amount.toFixed(2)}</p>
            )}
            {order.payment_status && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                <span>{order.payment_status}{order.mode_of_payment ? ` · ${order.mode_of_payment}` : ""}</span>
              </div>
            )}
          </div>
          {order.delivery_date && (
            <p className={`text-xs ${order.status === "Delivered" ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
              {order.status === "Delivered" ? `✓ ${order.delivery_date}` : `Est: ${order.delivery_date}`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PharmacyOrders() {
  const { pharmacyCode } = usePharmacyContext();
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/stock-requests", pharmacyCode],
    queryFn: async () => {
      const params = pharmacyCode ? `?pharmacist_id=${encodeURIComponent(pharmacyCode)}` : "";
      const res = await fetch(`/api/stock-requests${params}`);
      return res.json();
    },
  });
  const delivered = orders.filter((o: any) => o.status === "Delivered").length;
  const pending = orders.filter((o: any) => o.status === "Pending" || o.status === "Processing").length;

  return (
    <div className="p-6 space-y-5">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">My Orders</h1>
        <p className="text-muted-foreground text-sm">Medicine orders placed through MediVoice AI</p>
      </div>

      {!isLoading && orders.length > 0 && (
        <div className="flex gap-3 flex-wrap animate-fade-in">
          {pending > 0 && (
            <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-blink" />{pending} in progress
            </div>
          )}
          {delivered > 0 && (
            <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{delivered} delivered
            </div>
          )}
          <div className="flex items-center gap-2 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
            <TrendingUp className="h-3 w-3" />{orders.length} total
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <p className="text-muted-foreground font-medium">No orders yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Browse the medicine catalogue or</p>
            <Link href="/pharmacy/voice">
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-1 hover:underline cursor-pointer">
                <Mic className="h-4 w-4" /> call MediVoice AI to place an order
              </span>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {orders.map((o: any, i: number) => <OrderCard key={o._id} order={o} index={i} />)}
        </div>
      )}
    </div>
  );
}
