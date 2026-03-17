import { useState } from "react";
import { useLocation, Link } from "wouter";
import { LogOut, Store, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-provider";

const NAV_ITEMS = [
  { title: "Dashboard",  url: "/dealer",               exact: true },
  { title: "Pharmacies", url: "/dealer/pharmacies" },
  { title: "Medicines",  url: "/dealer/medicines" },
  { title: "Inventory",  url: "/dealer/inventory",     badgeKey: "lowStock",      badgeColor: "amber" },
  { title: "Orders",     url: "/dealer/orders",        badgeKey: "pendingOrders", badgeColor: "orange" },
  { title: "Offers",     url: "/dealer/offers" },
  { title: "Call Logs",  url: "/dealer/conversations" },
];

export function DealerTopbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: stats } = useQuery<any>({ queryKey: ["/api/stats"], refetchInterval: 30000 });
  const counts: Record<string, number> = {
    pendingOrders: stats?.pendingOrders || 0,
    lowStock: stats?.lowStock || 0,
  };

  return (
    <header className="sticky top-0 z-50 h-12 border-b bg-background/98 backdrop-blur flex items-center px-5 gap-0">

      <Link href="/dealer">
        <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0 mr-5" data-testid="link-dealer-brand">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Store className="text-white h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-sm">MediVoice AI</span>
        </div>
      </Link>

      <div className="h-4 w-px bg-border mr-5 flex-shrink-0 hidden md:block" />

      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-5 flex-shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        Dealer
      </span>

      <nav className="hidden md:flex items-center gap-0 flex-1 overflow-x-auto no-scrollbar">
        {NAV_ITEMS.map(item => {
          const isActive = item.exact ? location === item.url : location.startsWith(item.url);
          const badge = item.badgeKey ? counts[item.badgeKey] : 0;
          const badgeCls = item.badgeColor === "amber"
            ? "bg-amber-500"
            : item.badgeColor === "orange"
            ? "bg-orange-500"
            : "bg-red-500";
          return (
            <Link key={item.url} href={item.url}>
              <div
                className={`relative flex items-center gap-1.5 px-3 h-12 text-[13px] font-medium transition-colors duration-150 cursor-pointer select-none whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-purple-600 dark:text-purple-400 border-purple-500"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                }`}
                data-testid={`link-dealer-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.title}
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
        <ThemeToggle />
        <Link href="/">
          <button
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="link-dealer-exit"
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
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;
            const badgeCls = item.badgeColor === "amber" ? "bg-amber-500" : item.badgeColor === "orange" ? "bg-orange-500" : "bg-red-500";
            return (
              <Link key={item.url} href={item.url}>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`link-dealer-mobile-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span>{item.title}</span>
                  {badge > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full ${badgeCls} text-white text-[10px] font-bold`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
