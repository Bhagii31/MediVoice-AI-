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
    <header className="relative sticky top-0 z-50 h-14 bg-gray-950 border-b border-gray-800 flex items-center px-6 gap-0 shadow-sm">

      <Link href="/dealer">
        <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0 mr-6" data-testid="link-dealer-brand">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-purple-500/30 group-hover:scale-105 transition-all">
            <Store className="text-white h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-sm text-white tracking-tight">MediVoice AI</span>
        </div>
      </Link>

      <div className="h-4 w-px bg-gray-700 mr-6 flex-shrink-0 hidden md:block" />

      <span className="hidden md:inline-flex items-center gap-1.5 mr-6 flex-shrink-0">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/25 tracking-wide">
          Dealer
        </span>
      </span>

      <nav className="hidden md:flex items-center gap-0 flex-1 overflow-x-auto no-scrollbar h-14">
        {NAV_ITEMS.map(item => {
          const isActive = item.exact ? location === item.url : location.startsWith(item.url);
          const badge = item.badgeKey ? counts[item.badgeKey] : 0;
          const badgeCls = item.badgeColor === "amber" ? "bg-amber-500" : "bg-orange-500";
          return (
            <Link key={item.url} href={item.url}>
              <div
                className={`relative flex items-center gap-1.5 px-3 h-14 text-[13px] font-medium transition-colors duration-150 cursor-pointer select-none whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-white border-purple-400"
                    : "text-gray-400 hover:text-gray-100 border-transparent"
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

      <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
        <div className="[&_button]:text-gray-400 [&_button:hover]:text-white [&_button:hover]:bg-gray-800 [&_button]:rounded-lg">
          <ThemeToggle />
        </div>
        <Link href="/">
          <button
            className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            data-testid="link-dealer-exit"
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
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;
            const badgeCls = item.badgeColor === "amber" ? "bg-amber-500" : "bg-orange-500";
            return (
              <Link key={item.url} href={item.url}>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
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
