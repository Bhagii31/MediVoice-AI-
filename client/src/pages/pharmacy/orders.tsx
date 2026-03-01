import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, User, Calendar, CreditCard, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function OrderCard({ order }: { order: any }) {
  return (
    <Card data-testid={`card-order-${order._id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{order.order_id || `Order #${String(order._id).slice(-6).toUpperCase()}`}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <User className="h-3 w-3" />
              <span>Pharmacy: {order.pharmacist_id || "—"}</span>
            </div>
            {order.order_timestamp && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>{new Date(order.order_timestamp).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"}`}>
            {order.status}
          </span>
        </div>

        {order.items?.length > 0 && (
          <div className="space-y-1">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span>{item.medicine_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span>×{item.quantity}</span>
                  {item.unit_price && (
                    <span className="font-medium text-foreground">${(item.unit_price * item.quantity).toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t">
          {order.total_amount !== undefined ? (
            <p className="font-semibold text-sm">Total: ${order.total_amount.toFixed(2)}</p>
          ) : <span />}
          {order.payment_status && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              <span>{order.payment_status}</span>
              {order.mode_of_payment && <span>· {order.mode_of_payment}</span>}
            </div>
          )}
        </div>

        {order.delivery_date && (
          <p className="text-xs text-muted-foreground">
            {order.status === "Delivered" ? `Delivered: ${order.delivery_date}` : `Expected: ${order.delivery_date}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function PharmacyOrders() {
  const { data: orders = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/stock-requests"] });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">My Orders</h1>
        <p className="text-muted-foreground text-sm">Medicine orders placed through MediVoice AI</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-md" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No orders yet. Browse the medicine catalogue or call MediVoice AI to place an order.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {orders.map((o: any) => <OrderCard key={o._id} order={o} />)}
        </div>
      )}
    </div>
  );
}
