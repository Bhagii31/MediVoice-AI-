import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pill, Search, Calendar, Package, Percent, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

function MedicineCard({ medicine }: { medicine: any }) {
  const { toast } = useToast();
  const isExpiringSoon = medicine.expiry_date && new Date(medicine.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const isExpired = medicine.expiry_date && new Date(medicine.expiry_date) < new Date();
  const inStock = !medicine.stock_quantity || medicine.stock_quantity > 0;

  return (
    <Card className="hover-elevate" data-testid={`card-medicine-${medicine._id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
              <Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-sm" data-testid={`text-medicine-name-${medicine._id}`}>{medicine.name}</p>
              <p className="text-xs text-muted-foreground">{medicine.manufacturer || "—"}</p>
            </div>
          </div>
          {medicine.category && <Badge variant="outline" className="text-xs flex-shrink-0">{medicine.category}</Badge>}
        </div>

        {medicine.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{medicine.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="space-y-1">
            {medicine.price_per_unit && (
              <div className="flex items-center gap-1">
                <span className="font-bold text-base">${medicine.price_per_unit.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">/ unit</span>
                {medicine.discount > 0 && (
                  <span className="text-xs text-green-600 flex items-center gap-0.5">
                    <Percent className="h-3 w-3" />{medicine.discount}% off
                  </span>
                )}
              </div>
            )}
            {medicine.stock_quantity !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                <span className={inStock ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {inStock ? `${medicine.stock_quantity} in stock` : "Out of stock"}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => toast({ title: `${medicine.name} added to enquiry`, description: "Contact your dealer or use the AI call to place an order." })}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            disabled={!inStock}
            data-testid={`button-enquire-${medicine._id}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Enquire
          </button>
        </div>

        {medicine.expiry_date && (
          <div className={`flex items-center gap-1 text-xs ${isExpired ? "text-red-500" : isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}>
            <Calendar className="h-3 w-3" />
            <span>{isExpired ? "EXPIRED" : isExpiringSoon ? `Expires soon: ${medicine.expiry_date}` : `Exp: ${medicine.expiry_date}`}</span>
          </div>
        )}
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

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Medicine Catalogue</h1>
        <p className="text-muted-foreground text-sm">Browse available medicines from your dealer</p>
      </div>

      <div className="relative max-w-sm">
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
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-md" />)}
        </div>
      ) : medicines.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Pill className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{search ? "No medicines match your search." : "No medicines in the catalogue."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((m: any) => <MedicineCard key={m._id} medicine={m} />)}
        </div>
      )}
    </div>
  );
}
