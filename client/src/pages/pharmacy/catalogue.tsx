import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pill, Search, Calendar, Package, Percent, ShoppingCart, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

function MedicineCard({ medicine, index }: { medicine: any; index: number }) {
  const { toast } = useToast();
  const isExpiringSoon = medicine.expiry_date && new Date(medicine.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const isExpired = medicine.expiry_date && new Date(medicine.expiry_date) < new Date();
  const inStock = medicine.stock_quantity === undefined || medicine.stock_quantity > 0;
  const isLow = medicine.stock_quantity !== undefined && medicine.stock_quantity > 0 && medicine.stock_quantity <= 50;
  const stockPct = medicine.stock_quantity > 0 ? Math.min(100, (medicine.stock_quantity / 500) * 100) : 0;

  return (
    <Card
      className="hover-elevate border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden animate-fade-in-up group"
      style={{ animationDelay: `${index * 50}ms` }}
      data-testid={`card-medicine-${medicine._id}`}
    >
      <div className={`h-1 w-full ${!inStock ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-emerald-400"}`} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${!inStock ? "bg-red-100 dark:bg-red-900/50" : "bg-emerald-100 dark:bg-emerald-900/50"}`}>
              <Pill className={`h-5 w-5 ${!inStock ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" data-testid={`text-medicine-name-${medicine._id}`}>{medicine.name}</p>
              <p className="text-xs text-muted-foreground">{medicine.manufacturer || "—"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {medicine.category && <Badge variant="outline" className="text-xs">{medicine.category}</Badge>}
            {medicine.discount > 0 && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                <Percent className="h-2.5 w-2.5" />{medicine.discount}% off
              </span>
            )}
          </div>
        </div>

        {medicine.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{medicine.description}</p>
        )}

        {medicine.stock_quantity !== undefined && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-medium ${!inStock ? "text-red-500" : isLow ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {!inStock ? "Out of stock" : isLow ? `Low: ${medicine.stock_quantity} units` : `${medicine.stock_quantity} in stock`}
              </span>
              {inStock && <Package className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${!inStock ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: `${stockPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
          <div>
            {medicine.price_per_unit && (
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg">${medicine.price_per_unit.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">/ unit</span>
              </div>
            )}
            {medicine.expiry_date && (
              <div className={`flex items-center gap-1 text-xs mt-0.5 ${isExpired ? "text-red-500" : isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}>
                <Calendar className="h-3 w-3" />
                <span>{isExpired ? "EXPIRED" : `Exp: ${medicine.expiry_date}`}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => toast({
              title: `Enquiry sent for ${medicine.name}`,
              description: "Use Call AI Assistant to confirm availability and pricing.",
            })}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 ${inStock ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            disabled={!inStock}
            data-testid={`button-enquire-${medicine._id}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Enquire
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PharmacyCatalogue() {
  const [search, setSearch] = useState("");
  const { data: medicines = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/medicines", search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/medicines${params}`);
      return res.json();
    }
  });

  const inStock = medicines.filter((m: any) => !m.stock_quantity || m.stock_quantity > 0).length;

  return (
    <div className="p-6 space-y-5">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Medicine Catalogue</h1>
        <p className="text-muted-foreground text-sm">Browse available medicines from your dealer — enquire or use AI assistant to order</p>
      </div>

      {!isLoading && medicines.length > 0 && (
        <div className="flex gap-3 flex-wrap animate-fade-in">
          <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{inStock} available
          </div>
          <Link href="/pharmacy/voice">
            <div className="flex items-center gap-2 text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-900/60 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
              <Zap className="h-3 w-3" />Order via AI assistant
            </div>
          </Link>
        </div>
      )}

      <div className="relative max-w-sm animate-fade-in">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search medicines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          data-testid="input-search-medicine"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : medicines.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Pill className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <p className="text-muted-foreground font-medium">{search ? "No medicines match your search." : "No medicines in the catalogue."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((m: any, i: number) => <MedicineCard key={m._id} medicine={m} index={i} />)}
        </div>
      )}
    </div>
  );
}
