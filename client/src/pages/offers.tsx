import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tag, Plus, Percent, Calendar, Users, Megaphone, Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Expired: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function OfferCard({ offer }: { offer: any }) {
  const isExpired = offer.valid_to && new Date(offer.valid_to) < new Date();
  const displayStatus = isExpired ? "Expired" : (offer.status || "Active");

  return (
    <Card className="hover-elevate" data-testid={`card-offer-${offer._id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
              <Tag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-sm" data-testid={`text-offer-name-${offer._id}`}>{offer.offer_name}</p>
              {offer.target_group && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{offer.target_group} tier</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {offer.discount_percent && (
              <div className="flex items-center gap-0.5 text-green-700 dark:text-green-400 font-bold text-xl">
                <Percent className="h-4 w-4" />{offer.discount_percent}
              </div>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[displayStatus] || "bg-muted text-muted-foreground"}`}>
              {displayStatus}
            </span>
          </div>
        </div>

        {offer.description && <p className="text-xs text-muted-foreground">{offer.description}</p>}

        {offer.applicable_medicines?.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Pill className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{offer.applicable_medicines.join(", ")}</span>
          </div>
        )}

        {offer.promotion_channel?.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Megaphone className="h-3 w-3" />
            <span>{offer.promotion_channel.join(", ")}</span>
          </div>
        )}

        {(offer.valid_from || offer.valid_to) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{offer.valid_from} → {offer.valid_to}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddOfferDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    offer_name: "", description: "", discount_percent: "", target_group: "Silver",
    valid_from: "", valid_to: "", applicable_medicines: "", promotion_channel: "Outbound Calls", status: "Active"
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/offers", {
        ...form,
        discount_percent: form.discount_percent ? Number(form.discount_percent) : undefined,
        applicable_medicines: form.applicable_medicines ? form.applicable_medicines.split(",").map(s => s.trim()) : [],
        promotion_channel: form.promotion_channel ? form.promotion_channel.split(",").map(s => s.trim()) : [],
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({ title: "Offer created" });
      setOpen(false);
      setForm({ offer_name: "", description: "", discount_percent: "", target_group: "Silver", valid_from: "", valid_to: "", applicable_medicines: "", promotion_channel: "Outbound Calls", status: "Active" });
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
            <Label>Offer Name *</Label>
            <Input value={form.offer_name} onChange={set("offer_name")} placeholder="Winter Immunity Offer" data-testid="input-offer-name" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={set("description")} placeholder="10% off on Vitamin C during winter" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Discount %</Label>
              <Input type="number" value={form.discount_percent} onChange={set("discount_percent")} placeholder="10" />
            </div>
            <div className="space-y-1">
              <Label>Target Group</Label>
              <Input value={form.target_group} onChange={set("target_group")} placeholder="Gold / Silver / Bronze" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Valid From</Label>
              <Input value={form.valid_from} onChange={set("valid_from")} placeholder="2025-11-01" />
            </div>
            <div className="space-y-1">
              <Label>Valid To</Label>
              <Input value={form.valid_to} onChange={set("valid_to")} placeholder="2026-01-31" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Applicable Medicines (comma-separated IDs)</Label>
            <Input value={form.applicable_medicines} onChange={set("applicable_medicines")} placeholder="M001, M002, M003" />
          </div>
          <div className="space-y-1">
            <Label>Promotion Channel</Label>
            <Input value={form.promotion_channel} onChange={set("promotion_channel")} placeholder="Outbound Calls, SMS" />
          </div>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!form.offer_name || mutation.isPending} className="w-full" data-testid="button-save-offer">
          {mutation.isPending ? "Saving..." : "Create Offer"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Offers() {
  const { data: offers = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/offers"] });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Offers</h1>
          <p className="text-muted-foreground text-sm">Medicine promotions discussed during AI calls</p>
        </div>
        <AddOfferDialog />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-44 rounded-md" />)}
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No offers found in the database.</p>
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
