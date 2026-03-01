import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Phone, MapPin, Plus, Search, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function PharmacyCard({ pharmacy }: { pharmacy: any }) {
  return (
    <Card className="hover-elevate" data-testid={`card-pharmacy-${pharmacy._id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">{pharmacy.name}</p>
              <p className="text-xs text-muted-foreground">{pharmacy.ownerName || "—"}</p>
            </div>
          </div>
          <Badge variant={pharmacy.isActive ? "default" : "secondary"} className="text-xs">
            {pharmacy.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="mt-3 space-y-1">
          {pharmacy.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{pharmacy.phone}</span>
            </div>
          )}
          {(pharmacy.city || pharmacy.state) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{[pharmacy.city, pharmacy.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {pharmacy.dealerId && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Dealer: {pharmacy.dealerId?.name || "—"}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddPharmacyDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", ownerName: "", email: "", address: "", city: "", state: "", pincode: "", licenseNumber: "" });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/pharmacies", form);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Pharmacy added successfully" });
      setOpen(false);
      setForm({ name: "", phone: "", ownerName: "", email: "", address: "", city: "", state: "", pincode: "", licenseNumber: "" });
    },
    onError: () => toast({ title: "Failed to add pharmacy", variant: "destructive" }),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-pharmacy"><Plus className="h-4 w-4 mr-2" />Add Pharmacy</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Pharmacy</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>Pharmacy Name *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="City Pharma" data-testid="input-pharmacy-name" />
          </div>
          <div className="space-y-1">
            <Label>Phone *</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="+91 9876543210" data-testid="input-pharmacy-phone" />
          </div>
          <div className="space-y-1">
            <Label>Owner Name</Label>
            <Input value={form.ownerName} onChange={set("ownerName")} placeholder="Dr. Ramesh" data-testid="input-pharmacy-owner" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={form.email} onChange={set("email")} type="email" placeholder="pharmacy@email.com" />
          </div>
          <div className="space-y-1">
            <Label>License Number</Label>
            <Input value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="MH-12345" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Address</Label>
            <Input value={form.address} onChange={set("address")} placeholder="123 Main Street" />
          </div>
          <div className="space-y-1">
            <Label>City</Label>
            <Input value={form.city} onChange={set("city")} placeholder="Mumbai" />
          </div>
          <div className="space-y-1">
            <Label>State</Label>
            <Input value={form.state} onChange={set("state")} placeholder="Maharashtra" />
          </div>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!form.name || !form.phone || mutation.isPending} className="w-full mt-2" data-testid="button-save-pharmacy">
          {mutation.isPending ? "Saving..." : "Save Pharmacy"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function PharmacistPortal() {
  const [search, setSearch] = useState("");
  const { data: pharmacies = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/pharmacies"] });

  const filtered = pharmacies.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Pharmacist Portal</h1>
          <p className="text-muted-foreground text-sm">Manage pharmacies and their profiles</p>
        </div>
        <AddPharmacyDialog />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search pharmacies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          data-testid="input-search-pharmacy"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 rounded-md" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {search ? "No pharmacies match your search." : "No pharmacies yet. Add your first pharmacy to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any) => <PharmacyCard key={p._id} pharmacy={p} />)}
        </div>
      )}
    </div>
  );
}
