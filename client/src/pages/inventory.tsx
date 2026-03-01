import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, Plus, Search, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StockBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    normal: { label: "Normal", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    low: { label: "Low", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    critical: { label: "Critical", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    out_of_stock: { label: "Out of Stock", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  };
  const c = config[status] || config.normal;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.className}`}>{c.label}</span>;
}

function InventoryRow({ item }: { item: any }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0" data-testid={`row-inventory-${item._id}`}>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">{item.medicineName}</p>
        <p className="text-xs text-muted-foreground">{item.pharmacyId?.name || "—"} · {item.pharmacyId?.city || ""}</p>
      </div>
      <div className="flex items-center gap-4 text-sm flex-shrink-0">
        <div className="text-right">
          <p className="font-semibold">{item.currentStock}</p>
          <p className="text-xs text-muted-foreground">{item.unit}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Min: {item.minimumStock}</p>
        </div>
        <StockBadge status={item.status} />
      </div>
    </div>
  );
}

function AddInventoryDialog({ pharmacies }: { pharmacies: any[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pharmacyId: "", medicineName: "", currentStock: "", minimumStock: "10", unit: "strips", status: "normal" });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/inventory", {
        ...form,
        currentStock: Number(form.currentStock),
        minimumStock: Number(form.minimumStock),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Inventory item added" });
      setOpen(false);
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
            <Label>Pharmacy</Label>
            <Select value={form.pharmacyId} onValueChange={v => setForm(f => ({ ...f, pharmacyId: v }))}>
              <SelectTrigger data-testid="select-pharmacy"><SelectValue placeholder="Select pharmacy" /></SelectTrigger>
              <SelectContent>
                {pharmacies.map((p: any) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Medicine Name</Label>
            <Input value={form.medicineName} onChange={set("medicineName")} placeholder="Paracetamol 500mg" data-testid="input-medicine-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Current Stock</Label>
              <Input type="number" value={form.currentStock} onChange={set("currentStock")} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label>Minimum Stock</Label>
              <Input type="number" value={form.minimumStock} onChange={set("minimumStock")} placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="strips">Strips</SelectItem>
                  <SelectItem value="tablets">Tablets</SelectItem>
                  <SelectItem value="bottles">Bottles</SelectItem>
                  <SelectItem value="vials">Vials</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!form.pharmacyId || !form.medicineName || mutation.isPending} className="w-full" data-testid="button-save-inventory">
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: allInventory = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/inventory"] });
  const { data: lowStock = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/low-stock"] });
  const { data: pharmacies = [] } = useQuery<any[]>({ queryKey: ["/api/pharmacies"] });

  const filtered = allInventory.filter((item: any) =>
    item.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
    item.pharmacyId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Inventory</h1>
          <p className="text-muted-foreground text-sm">Track medicine stock across all pharmacies</p>
        </div>
        <AddInventoryDialog pharmacies={pharmacies} />
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
            <Input className="pl-9" placeholder="Search medicine or pharmacy..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-inventory" />
          </div>
          <Card>
            {isLoading ? (
              <CardContent className="p-0"><div className="space-y-px">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-none" />)}</div></CardContent>
            ) : filtered.length === 0 ? (
              <CardContent className="py-14 text-center">
                <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No inventory items found.</p>
              </CardContent>
            ) : (
              <CardContent className="p-0 divide-y">{filtered.map((item: any) => <InventoryRow key={item._id} item={item} />)}</CardContent>
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
              <CardContent className="p-0 divide-y">{lowStock.map((item: any) => <InventoryRow key={item._id} item={item} />)}</CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
