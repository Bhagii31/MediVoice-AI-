import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, MapPin, Globe, Tag, Calendar, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TIER_COLORS: Record<string, string> = {
  Gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  Silver: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Bronze: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | string[] }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-medium">{Array.isArray(value) ? value.join(", ") : value}</p>
      </div>
    </div>
  );
}

export default function PharmacyProfile() {
  const { data: pharmacies = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/pharmacies"] });
  const pharmacy = pharmacies[0];

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">My Pharmacy Profile</h1>
        <p className="text-muted-foreground text-sm">Your pharmacy details from the MediVoice AI system</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !pharmacy ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No pharmacy profile found.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold" data-testid="text-pharmacy-name">{pharmacy.name}</h2>
                    {pharmacy.discount_tier && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[pharmacy.discount_tier] || "bg-muted text-muted-foreground"}`}>
                        {pharmacy.discount_tier} Tier
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{pharmacy.business_type || "Pharmacy"}</p>
                  {pharmacy.pharmacy_id && (
                    <p className="text-xs text-muted-foreground mt-1">ID: {pharmacy.pharmacy_id}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Contact & Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Phone} label="Contact Number" value={pharmacy.contact} />
              <InfoRow icon={MapPin} label="Location" value={pharmacy.location} />
              <InfoRow icon={Globe} label="Language Preference" value={pharmacy.language_preference} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Preferences & History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Package} label="Preferred Brands" value={pharmacy.preferred_brands} />
              <InfoRow icon={Tag} label="Discount Tier" value={pharmacy.discount_tier} />
              <InfoRow icon={Calendar} label="Last Order Date" value={pharmacy.last_order_date} />
            </CardContent>
          </Card>
        </>
      )}

      {pharmacies.length > 1 && (
        <div>
          <h2 className="font-semibold mb-3 text-sm text-muted-foreground">Other Pharmacies in System</h2>
          <div className="space-y-2">
            {pharmacies.slice(1).map((p: any) => (
              <Card key={p._id} data-testid={`card-pharmacy-${p._id}`}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.location} · {p.business_type || "Pharmacy"}</p>
                  </div>
                  {p.discount_tier && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[p.discount_tier] || "bg-muted text-muted-foreground"}`}>
                      {p.discount_tier}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
