import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, Plus, Search, AlertTriangle, MapPin, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StockBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    in_stock: { label: "In Stock", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    low_stock: { label: "Low Stock", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    out_of_stock: { label: "Out of Stock", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  };
  const c = config[status] || config.in_stock;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.className}`}>{c.label}</span>;
}

function InventoryRow({ item }: { item: any }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0" data-testid={`row-inventory-${item._id}`}>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm" data-testid={`text-inventory-name-${item._id}`}>{item.medicine_name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {item.warehouse_location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{item.warehouse_location}</span>
            </div>
          )}
          {item.next_restock_due && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Restock: {item.next_restock_due}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm flex-shrink-0">
        <div className="text-right">
          <p className="font-semibold">{item.stock_quantity}</p>
          <p className="text-xs text-muted-foreground">units</p>
        </div>
        {item.order_limit && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Min order: {item.order_limit}</p>
          </div>
        )}
        <StockBadge status={item.status} />
      </div>
    </div>
  );
}

function AddInventoryDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    medicine_id: "", medicine_name: "", stock_quantity: "", warehouse_location: "", order_limit: "", status: "in_stock"
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/inventory", {
        ...form,
        stock_quantity: Number(form.stock_quantity),
        order_limit: form.order_limit ? Number(form.order_limit) : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Inventory item added" });
      setOpen(false);
      setForm({ medicine_id: "", medicine_name: "", stock_quantity: "", warehouse_location: "", order_limit: "", status: "in_stock" });
    },
    onError: () => toast({ title: "Failed to add item", variant: "destructive" }),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-inventory"><Plus className="h-4 w-4 mr-2" />Add Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Medicine ID</Label>
            <Input value={form.medicine_id} onChange={set("medicine_id")} placeholder="M001" />
          </div>
          <div className="space-y-1">
            <Label>Medicine Name *</Label>
            <Input value={form.medicine_name} onChange={set("medicine_name")} placeholder="Paracetamol 500mg" data-testid="input-medicine-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Stock Quantity</Label>
              <Input type="number" value={form.stock_quantity} onChange={set("stock_quantity")} placeholder="250" />
            </div>
            <div className="space-y-1">
              <Label>Order Limit</Label>
              <Input type="number" value={form.order_limit} onChange={set("order_limit")} placeholder="50" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Warehouse Location</Label>
            <Input value={form.warehouse_location} onChange={set("warehouse_location")} placeholder="Edison, NJ" />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger data-testid="select-inventory-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!form.medicine_name || mutation.isPending} className="w-full" data-testid="button-save-inventory">
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: allInventory = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/inventory", search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/inventory${params}`);
      return res.json();
    }
  });
  const { data: lowStock = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/low-stock"] });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Inventory</h1>
          <p className="text-muted-foreground text-sm">Dealer warehouse medicine stock levels</p>
        </div>
        <AddInventoryDialog />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low Stock {lowStock.length > 0 && <Badge variant="destructive" className="ml-1 text-xs">{lowStock.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by medicine name..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-inventory" />
          </div>
          <Card>
            {isLoading ? (
              <CardContent className="p-0"><div className="space-y-px">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-none" />)}</div></CardContent>
            ) : allInventory.length === 0 ? (
              <CardContent className="py-14 text-center">
                <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No inventory items found.</p>
              </CardContent>
            ) : (
              <CardContent className="p-0">{allInventory.map((item: any) => <InventoryRow key={item._id} item={item} />)}</CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="low" className="mt-4">
          <Card>
            {lowStock.length === 0 ? (
              <CardContent className="py-14 text-center">
                <Package className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-70" />
                <p className="text-muted-foreground">All stock levels are healthy.</p>
              </CardContent>
            ) : (
              <CardContent className="p-0">{lowStock.map((item: any) => <InventoryRow key={item._id} item={item} />)}</CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
