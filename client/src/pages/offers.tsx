import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tag, Plus, Percent, Calendar, Users, Megaphone, Pill, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG: Record<string, { bg: string; dot: string; text: string }> = {
  Active:    { bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900", dot: "bg-emerald-500 animate-blink", text: "Active" },
  Scheduled: { bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900", dot: "bg-blue-500", text: "Scheduled" },
  Expired:   { bg: "bg-muted text-muted-foreground border border-border", dot: "bg-gray-400", text: "Expired" },
};

const TIER_COLORS: Record<string, string> = {
  Gold:   "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400",
  Silver: "bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-400",
  Bronze: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400",
};

function OfferCard({ offer, index }: { offer: any; index: number }) {
  const isExpired = offer.valid_to && new Date(offer.valid_to) < new Date();
  const status = isExpired ? "Expired" : (offer.status || "Active");
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Active;

  return (
    <Card
      className="hover-elevate border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden animate-fade-in-up group"
      style={{ animationDelay: `${index * 60}ms` }}
      data-testid={`card-offer-${offer._id}`}
    >
      <div className={`h-1.5 w-full ${status === "Active" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : status === "Scheduled" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-muted"}`} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${status === "Active" ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-muted"}`}>
              <Tag className={`h-5 w-5 ${status === "Active" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" data-testid={`text-offer-name-${offer._id}`}>{offer.offer_name}</p>
              {offer.target_group && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 inline-block ${TIER_COLORS[offer.target_group] || "bg-muted text-muted-foreground"}`}>
                  {offer.target_group} tier
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {offer.discount_percent && (
              <div className="flex items-center gap-0.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {offer.discount_percent}<Percent className="h-4 w-4 mt-1.5" />
              </div>
            )}
            <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.text}
            </div>
          </div>
        </div>

        {offer.description && <p className="text-xs text-muted-foreground leading-relaxed">{offer.description}</p>}

        {offer.applicable_medicines?.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
            <Pill className="h-3 w-3 mt-0.5 flex-shrink-0 text-emerald-500" />
            <span className="line-clamp-1">{offer.applicable_medicines.join(", ")}</span>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border">
          {offer.promotion_channel?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Megaphone className="h-3 w-3" />
              <span>{offer.promotion_channel.join(", ")}</span>
            </div>
          )}
          {(offer.valid_from || offer.valid_to) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="h-3 w-3" />
              <span>{offer.valid_from} → {offer.valid_to}</span>
            </div>
          )}
        </div>
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
        <Button className="gap-2" data-testid="button-add-offer">
          <Plus className="h-4 w-4" />Add Offer
        </Button>
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
            <Label>Applicable Medicines (comma-separated)</Label>
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
  const active = offers.filter((o: any) => o.status === "Active" && !(o.valid_to && new Date(o.valid_to) < new Date())).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Offers & Promotions</h1>
          <p className="text-muted-foreground text-sm">Medicine promotions discussed during MediVoice AI calls</p>
        </div>
        <AddOfferDialog />
      </div>

      {!isLoading && offers.length > 0 && (
        <div className="flex gap-3 flex-wrap animate-fade-in">
          <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-blink" />
            <Zap className="h-3 w-3" />{active} active offers
          </div>
          <div className="flex items-center gap-2 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
            {offers.length} total
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : offers.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Tag className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <p className="text-muted-foreground font-medium">No offers found in the database.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o: any, i: number) => <OfferCard key={o._id} offer={o} index={i} />)}
        </div>
      )}
    </div>
  );
}
