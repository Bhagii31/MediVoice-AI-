import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pill, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function MedicineCard({ medicine }: { medicine: any }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0" data-testid={`row-medicine-${medicine._id}`}>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
          <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-medium text-sm">{medicine.name}</p>
          <p className="text-xs text-muted-foreground">{medicine.genericName || "—"} · {medicine.manufacturer || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {medicine.category && <Badge variant="outline" className="text-xs">{medicine.category}</Badge>}
        <span className="text-sm text-muted-foreground">{medicine.unit}</span>
        {medicine.pricePerUnit && <span className="text-sm font-medium">₹{medicine.pricePerUnit}</span>}
      </div>
    </div>
  );
}

function AddMedicineDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", genericName: "", manufacturer: "", category: "", unit: "strips", pricePerUnit: "" });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/medicines", {
        ...form,
        pricePerUnit: form.pricePerUnit ? Number(form.pricePerUnit) : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({ title: "Medicine added" });
      setOpen(false);
      setForm({ name: "", genericName: "", manufacturer: "", category: "", unit: "strips", pricePerUnit: "" });
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
            <Label>Brand Name *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Crocin 500mg" data-testid="input-medicine-brand" />
          </div>
          <div className="space-y-1">
            <Label>Generic Name</Label>
            <Input value={form.genericName} onChange={set("genericName")} placeholder="Paracetamol" />
          </div>
          <div className="space-y-1">
            <Label>Manufacturer</Label>
            <Input value={form.manufacturer} onChange={set("manufacturer")} placeholder="GSK" />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Input value={form.category} onChange={set("category")} placeholder="Analgesic" />
          </div>
          <div className="space-y-1">
            <Label>Unit</Label>
            <Input value={form.unit} onChange={set("unit")} placeholder="strips" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Price per Unit (₹)</Label>
            <Input type="number" value={form.pricePerUnit} onChange={set("pricePerUnit")} placeholder="25" />
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
  const { data: medicines = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/medicines"] });

  const filtered = medicines.filter((m: any) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(search.toLowerCase()) ||
    m.manufacturer?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Medicines</h1>
          <p className="text-muted-foreground text-sm">Medicine catalog managed by dealers</p>
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
        ) : filtered.length === 0 ? (
          <CardContent className="py-14 text-center">
            <Pill className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{search ? "No medicines match your search." : "No medicines in the catalog yet."}</p>
          </CardContent>
        ) : (
          <CardContent className="p-0 divide-y">{filtered.map((m: any) => <MedicineCard key={m._id} medicine={m} />)}</CardContent>
        )}
      </Card>
    </div>
  );
}
