import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tag, Plus, Percent, Calendar, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function OfferCard({ offer }: { offer: any }) {
  const isExpired = offer.validUntil && new Date(offer.validUntil) < new Date();
  return (
    <Card className="hover-elevate" data-testid={`card-offer-${offer._id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
              <Tag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">{offer.title}</p>
              {offer.medicineName && <p className="text-xs text-muted-foreground">{offer.medicineName}</p>}
            </div>
          </div>
          {offer.discountPercent && (
            <div className="flex items-center gap-1 text-green-700 dark:text-green-400 font-bold text-lg">
              <Percent className="h-4 w-4" />{offer.discountPercent}
            </div>
          )}
        </div>

        {offer.description && <p className="text-sm text-muted-foreground">{offer.description}</p>}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {offer.dealerId && (
            <div className="flex items-center gap-1">
              <Store className="h-3 w-3" />
              <span>{offer.dealerId.name || offer.dealerId.companyName}</span>
            </div>
          )}
          {offer.validUntil && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{isExpired ? "Expired" : `Until ${new Date(offer.validUntil).toLocaleDateString()}`}</span>
            </div>
          )}
        </div>

        <Badge variant={isExpired ? "secondary" : "default"} className="text-xs">
          {isExpired ? "Expired" : "Active"}
        </Badge>
      </CardContent>
    </Card>
  );
}

function AddOfferDialog({ dealers }: { dealers: any[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", medicineName: "", discountPercent: "", dealerId: "", validUntil: "" });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/offers", {
        ...form,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
        validUntil: form.validUntil || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({ title: "Offer created" });
      setOpen(false);
      setForm({ title: "", description: "", medicineName: "", discountPercent: "", dealerId: "", validUntil: "" });
    },
    onError: () => toast({ title: "Failed to create offer", variant: "destructive" }),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-offer"><Plus className="h-4 w-4 mr-2" />Add Offer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New Offer</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Offer Title *</Label>
            <Input value={form.title} onChange={set("title")} placeholder="Monsoon Stock Clearance" data-testid="input-offer-title" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={set("description")} placeholder="20% off on all antibiotics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Medicine Name</Label>
              <Input value={form.medicineName} onChange={set("medicineName")} placeholder="Amoxicillin" />
            </div>
            <div className="space-y-1">
              <Label>Discount %</Label>
              <Input type="number" value={form.discountPercent} onChange={set("discountPercent")} placeholder="15" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Dealer</Label>
            <Select value={form.dealerId} onValueChange={v => setForm(f => ({ ...f, dealerId: v }))}>
              <SelectTrigger data-testid="select-dealer"><SelectValue placeholder="Select dealer" /></SelectTrigger>
              <SelectContent>
                {dealers.map((d: any) => <SelectItem key={d._id} value={d._id}>{d.name} — {d.companyName || ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Valid Until</Label>
            <Input type="date" value={form.validUntil} onChange={set("validUntil")} />
          </div>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!form.title || !form.dealerId || mutation.isPending} className="w-full" data-testid="button-save-offer">
          {mutation.isPending ? "Saving..." : "Create Offer"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Offers() {
  const { data: offers = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/offers"] });
  const { data: dealers = [] } = useQuery<any[]>({ queryKey: ["/api/dealers"] });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Offers</h1>
          <p className="text-muted-foreground text-sm">Medicine offers and promotions from dealers</p>
        </div>
        <AddOfferDialog dealers={dealers} />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-md" />)}
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No offers yet. Add promotional offers that the AI bot can mention during outbound calls.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o: any) => <OfferCard key={o._id} offer={o} />)}
        </div>
      )}
    </div>
  );
}
