import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pill, Plus, Search, Package, Calendar, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function MedicineCard({ medicine }: { medicine: any }) {
  const isExpiringSoon = medicine.expiry_date && new Date(medicine.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const isExpired = medicine.expiry_date && new Date(medicine.expiry_date) < new Date();

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0" data-testid={`row-medicine-${medicine._id}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
          <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate" data-testid={`text-medicine-name-${medicine._id}`}>{medicine.name}</p>
          <p className="text-xs text-muted-foreground">{medicine.manufacturer || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2 flex-wrap justify-end">
        {medicine.category && <Badge variant="outline" className="text-xs">{medicine.category}</Badge>}
        {medicine.stock_quantity !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{medicine.stock_quantity} units</span>
          </div>
        )}
        {medicine.discount > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Percent className="h-3 w-3" />
            <span>{medicine.discount}% off</span>
          </div>
        )}
        {medicine.price_per_unit && (
          <span className="text-sm font-semibold">${medicine.price_per_unit.toFixed(2)}</span>
        )}
        {medicine.expiry_date && (
          <div className={`flex items-center gap-1 text-xs ${isExpired ? "text-red-500" : isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}>
            <Calendar className="h-3 w-3" />
            <span>Exp: {medicine.expiry_date}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AddMedicineDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", manufacturer: "", category: "", price_per_unit: "", stock_quantity: "", expiry_date: "", description: "", discount: "0" });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/medicines", {
        ...form,
        price_per_unit: form.price_per_unit ? Number(form.price_per_unit) : undefined,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : undefined,
        discount: form.discount ? Number(form.discount) : 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({ title: "Medicine added successfully" });
      setOpen(false);
      setForm({ name: "", manufacturer: "", category: "", price_per_unit: "", stock_quantity: "", expiry_date: "", description: "", discount: "0" });
    },
    onError: () => toast({ title: "Failed to add medicine", variant: "destructive" }),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-medicine"><Plus className="h-4 w-4 mr-2" />Add Medicine</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Medicine</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>Medicine Name *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Paracetamol 500mg" data-testid="input-medicine-name" />
          </div>
          <div className="space-y-1">
            <Label>Manufacturer</Label>
            <Input value={form.manufacturer} onChange={set("manufacturer")} placeholder="Cipla" />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Input value={form.category} onChange={set("category")} placeholder="Pain Relief" />
          </div>
          <div className="space-y-1">
            <Label>Price per Unit ($)</Label>
            <Input type="number" value={form.price_per_unit} onChange={set("price_per_unit")} placeholder="0.25" />
          </div>
          <div className="space-y-1">
            <Label>Stock Quantity</Label>
            <Input type="number" value={form.stock_quantity} onChange={set("stock_quantity")} placeholder="500" />
          </div>
          <div className="space-y-1">
            <Label>Expiry Date</Label>
            <Input value={form.expiry_date} onChange={set("expiry_date")} placeholder="2026-05-30" />
          </div>
          <div className="space-y-1">
            <Label>Discount (%)</Label>
            <Input type="number" value={form.discount} onChange={set("discount")} placeholder="10" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={set("description")} placeholder="Brief description of the medicine" />
          </div>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending} className="w-full" data-testid="button-save-medicine">
          {mutation.isPending ? "Saving..." : "Save Medicine"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Medicines() {
  const [search, setSearch] = useState("");
  const { data: medicines = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/medicines", search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/medicines${params}`);
      return res.json();
    }
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Medicines</h1>
          <p className="text-muted-foreground text-sm">Medicine catalog — dealer warehouse stock</p>
        </div>
        <AddMedicineDialog />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-medicine" />
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-0">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-none border-b" />)}</CardContent>
        ) : medicines.length === 0 ? (
          <CardContent className="py-14 text-center">
            <Pill className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{search ? "No medicines match your search." : "No medicines in the catalog."}</p>
          </CardContent>
        ) : (
          <CardContent className="p-0">{medicines.map((m: any) => <MedicineCard key={m._id} medicine={m} />)}</CardContent>
        )}
      </Card>
    </div>
  );
}
