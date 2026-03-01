import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ClipboardList, Building2, Store, Calendar, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    processing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    dispatched: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
}

const STATUS_FLOW = ["pending", "confirmed", "processing", "dispatched", "delivered"];

function StockRequestCard({ request }: { request: any }) {
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

  const currentIdx = STATUS_FLOW.indexOf(request.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1];

  return (
    <Card data-testid={`card-request-${request._id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{request.pharmacyId?.name || request.pharmacyName || "—"}</span>
            </div>
            {request.dealerId && (
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{request.dealerId?.name || request.dealerId?.companyName}</span>
              </div>
            )}
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="space-y-1">
          {request.medicines?.map((med: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1">
              <span>{med.medicineName}</span>
              <span className="text-muted-foreground">×{med.quantity} {med.unit}</span>
              {med.totalPrice && <span className="font-medium">₹{med.totalPrice}</span>}
            </div>
          ))}
        </div>

        {request.totalAmount && (
          <div className="flex justify-end">
            <span className="font-semibold text-sm">Total: ₹{request.totalAmount}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
          {nextStatus && request.status !== "cancelled" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => mutation.mutate(nextStatus)}
              disabled={mutation.isPending}
              data-testid={`button-advance-status-${request._id}`}
            >
              Mark as {nextStatus}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StockRequests() {
  const [statusFilter, setStatusFilter] = useState("all");

  const params: Record<string, string> = {};
  if (statusFilter !== "all") params.status = statusFilter;

  const { data: requests = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/stock-requests", params] });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Stock Requests</h1>
          <p className="text-muted-foreground text-sm">Medicine reorder requests from pharmacies</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="dispatched">Dispatched</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-md" />)}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No stock requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r: any) => <StockRequestCard key={r._id} request={r} />)}
        </div>
      )}
    </div>
  );
}
