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
    <header className="relative sticky top-0 z-50 h-14 bg-gray-950 border-b border-gray-800 flex items-center px-6 gap-0 shadow-sm">

      <Link href="/pharmacy">
        <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0 mr-6" data-testid="link-pharmacy-brand">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-emerald-500/30 group-hover:scale-105 transition-all">
            <Building2 className="text-white h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-sm text-white tracking-tight truncate max-w-[140px]">
            {pharmacyName || "MediVoice AI"}
          </span>
        </div>
      </Link>

      <div className="h-4 w-px bg-gray-700 mr-6 flex-shrink-0 hidden md:block" />

      <span className="hidden md:inline-flex items-center gap-1.5 mr-6 flex-shrink-0">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-wide">
          Pharmacy
        </span>
      </span>

      <nav className="hidden md:flex items-center gap-0 flex-1 overflow-x-auto no-scrollbar h-14">
        {NAV_ITEMS.map(item => {
          const isActive = item.exact ? location === item.url : location.startsWith(item.url);
          const badge = item.badge ?? 0;
          const badgeCls = item.badgeColor === "amber" ? "bg-amber-500" : "bg-orange-500";
          return (
            <Link key={item.url} href={item.url}>
              <div
                className={`relative flex items-center gap-1.5 px-3 h-14 text-[13px] font-medium transition-colors duration-150 cursor-pointer select-none whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-white border-emerald-400"
                    : item.highlight
                    ? "text-emerald-400 hover:text-emerald-300 border-transparent"
                    : "text-gray-400 hover:text-gray-100 border-transparent"
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

      <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
        {pharmacyName && (
          <button
            onClick={clearPharmacy}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            data-testid="button-switch-pharmacy"
            title="Switch pharmacy"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        )}
        <div className="[&_button]:text-gray-400 [&_button:hover]:text-white [&_button:hover]:bg-gray-800 [&_button]:rounded-lg">
          <ThemeToggle />
        </div>
        <Link href="/">
          <button
            className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            data-testid="link-pharmacy-exit"
            title="Exit portal"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </Link>
        <button
          className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          onClick={() => setMobileOpen(o => !o)}
          data-testid="button-mobile-menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-gray-950 border-b border-gray-800 shadow-xl px-4 py-2 space-y-0.5 z-50">
          {NAV_ITEMS.map(item => {
            const isActive = item.exact ? location === item.url : location.startsWith(item.url);
            const badge = item.badge ?? 0;
            const badgeCls = item.badgeColor === "amber" ? "bg-amber-500" : "bg-orange-500";
            return (
              <Link key={item.url} href={item.url}>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : item.highlight
                      ? "text-emerald-400 hover:bg-gray-800/60"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
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
              className="flex w-full items-center gap-2 mt-1 pt-2 border-t border-gray-800 px-3 py-2.5 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 rounded-lg transition-colors"
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
