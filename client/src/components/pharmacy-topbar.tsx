import { useState } from "react";
import { useLocation, Link } from "wouter";
import { LogOut, Building2, Menu, X, ArrowLeftRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-provider";
import { usePharmacyContext } from "@/lib/pharmacy-context";

export function PharmacyTopbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pharmacyName, pharmacyCode, clearPharmacy } = usePharmacyContext();

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/stock-requests", pharmacyCode],
    queryFn: async () => {
      const params = pharmacyCode ? `?pharmacist_id=${encodeURIComponent(pharmacyCode)}` : "";
      const res = await fetch(`/api/stock-requests${params}`);
      return res.json();
    },
    enabled: !!pharmacyCode,
    refetchInterval: 30000,
  });

  const pendingOrders = orders.filter((o: any) => o.status === "Pending" || o.status === "Processing").length;
  const unpaidInvoices = orders.filter((o: any) => o.payment_status === "Unpaid" || o.payment_status === "Pending").length;

  const NAV_ITEMS = [
    { title: "Dashboard",    url: "/pharmacy",               exact: true },
    { title: "My Orders",    url: "/pharmacy/orders",        badge: pendingOrders,   badgeColor: "orange" },
    { title: "Invoices",     url: "/pharmacy/invoices",      badge: unpaidInvoices,  badgeColor: "amber" },
    { title: "Catalogue",    url: "/pharmacy/catalogue" },
    { title: "Call Bot",     url: "/pharmacy/voice",         highlight: true },
    { title: "Call History", url: "/pharmacy/conversations" },
  ];

  return (
    <header className="sticky top-0 z-50 h-12 border-b bg-background/98 backdrop-blur flex items-center px-5 gap-0">

      <Link href="/pharmacy">
        <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0 mr-5" data-testid="link-pharmacy-brand">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Building2 className="text-white h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-sm truncate max-w-[130px]">
            {pharmacyName || "MediVoice AI"}
          </span>
        </div>
      </Link>

      <div className="h-4 w-px bg-border mr-5 flex-shrink-0 hidden md:block" />

      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-5 flex-shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Pharmacy
      </span>

      <nav className="hidden md:flex items-center gap-0 flex-1 overflow-x-auto no-scrollbar">
        {NAV_ITEMS.map(item => {
          const isActive = item.exact ? location === item.url : location.startsWith(item.url);
          const badge = item.badge ?? 0;
          const badgeCls = item.badgeColor === "amber" ? "bg-amber-500" : "bg-orange-500";
          return (
            <Link key={item.url} href={item.url}>
              <div
                className={`relative flex items-center gap-1.5 px-3 h-12 text-[13px] font-medium transition-colors duration-150 cursor-pointer select-none whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 border-emerald-500"
                    : item.highlight
                    ? "text-emerald-600 dark:text-emerald-400 border-transparent hover:border-emerald-300 dark:hover:border-emerald-700"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                }`}
                data-testid={`link-pharmacy-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.title}
                {item.highlight && !isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink flex-shrink-0" />
                )}
                {badge > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full ${badgeCls} text-white text-[10px] font-bold leading-none`}>
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1 flex-shrink-0">
        {pharmacyName && (
          <button
            onClick={clearPharmacy}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="button-switch-pharmacy"
            title="Switch pharmacy"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        )}
        <ThemeToggle />
        <Link href="/">
          <button
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="link-pharmacy-exit"
            title="Exit portal"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </Link>
        <button
          className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(o => !o)}
          data-testid="button-mobile-menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-12 left-0 right-0 border-b bg-background shadow-lg px-3 py-2 space-y-0.5 z-50 animate-fade-in-down">
          {NAV_ITEMS.map(item => {
            const isActive = item.exact ? location === item.url : location.startsWith(item.url);
            const badge = item.badge ?? 0;
            const badgeCls = item.badgeColor === "amber" ? "bg-amber-500" : "bg-orange-500";
            return (
              <Link key={item.url} href={item.url}>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                      : item.highlight
                      ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`link-pharmacy-mobile-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.title}</span>
                    {item.highlight && !isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink" />}
                  </div>
                  {badge > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full ${badgeCls} text-white text-[10px] font-bold`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          {pharmacyName && (
            <button
              onClick={() => { clearPharmacy(); setMobileOpen(false); }}
              className="flex w-full items-center gap-2 mt-1 pt-2 border-t px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              data-testid="button-switch-pharmacy-mobile"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Switch Pharmacy
            </button>
          )}
        </div>
      )}
    </header>
  );
}
