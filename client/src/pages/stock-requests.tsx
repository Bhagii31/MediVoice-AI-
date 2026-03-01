import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ClipboardList, User, Calendar, CreditCard, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

const NEXT_STATUS: Record<string, string> = {
  Pending: "Processing",
  Processing: "Delivered",
};

function OrderCard({ request }: { request: any }) {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PUT", `/api/stock-requests/${request._id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Order status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const nextStatus = NEXT_STATUS[request.status];

  return (
    <Card data-testid={`card-order-${request._id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{request.order_id || `#${String(request._id).slice(-6).toUpperCase()}`}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Pharmacy ID: {request.pharmacist_id || "—"}</span>
            </div>
            {request.order_timestamp && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(request.order_timestamp).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <StatusBadge status={request.status} />
        </div>

        {request.items?.length > 0 && (
          <div className="space-y-1">
            {request.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span>{item.medicine_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>×{item.quantity}</span>
                  {item.unit_price && <span className="font-medium text-foreground">${(item.unit_price * item.quantity).toFixed(2)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5">
            {request.total_amount !== undefined && (
              <p className="font-semibold text-sm">Total: ${request.total_amount.toFixed(2)}</p>
            )}
            {request.payment_status && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                <span>{request.payment_status} · {request.mode_of_payment || ""}</span>
              </div>
            )}
          </div>
          {nextStatus && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => mutation.mutate(nextStatus)}
              disabled={mutation.isPending}
              data-testid={`button-advance-status-${request._id}`}
            >
              Mark {nextStatus}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StockRequests() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/stock-requests", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/stock-requests${params}`);
      return res.json();
    }
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Orders</h1>
          <p className="text-muted-foreground text-sm">Medicine orders from pharmacies</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-md" />)}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No orders found{statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r: any) => <OrderCard key={r._id} request={r} />)}
        </div>
      )}
    </div>
  );
}
