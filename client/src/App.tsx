import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DealerSidebar } from "@/components/dealer-sidebar";
import { PharmacistSidebar } from "@/components/pharmacist-sidebar";
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider";
import { PharmacyProvider, usePharmacyContext } from "@/lib/pharmacy-context";

import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

import DealerDashboard from "@/pages/dealer/dashboard";
import DealerPortal from "@/pages/dealer-portal";
import PharmaciesPage from "@/pages/dealer/pharmacies";
import Medicines from "@/pages/medicines";
import Inventory from "@/pages/inventory";
import StockRequests from "@/pages/stock-requests";
import Offers from "@/pages/offers";
import Conversations from "@/pages/conversations";
import ConversationDetail from "@/pages/conversation-detail";

import PharmacyDashboard from "@/pages/pharmacy/dashboard";
import PharmacyProfile from "@/pages/pharmacy/profile";
import PharmacyCatalogue from "@/pages/pharmacy/catalogue";
import PharmacyOrders from "@/pages/pharmacy/orders";
import PharmacyVoice from "@/pages/pharmacy/voice";
import PharmacyConversations from "@/pages/pharmacy/conversations";
import PharmacyInvoices from "@/pages/pharmacy/invoices";
import PharmacySelector from "@/pages/pharmacy/selector";

function DealerRouter() {
  return (
    <Switch>
      <Route path="/dealer" component={DealerDashboard} />
      <Route path="/dealer/pharmacies" component={PharmaciesPage} />
      <Route path="/dealer/medicines" component={Medicines} />
      <Route path="/dealer/inventory" component={Inventory} />
      <Route path="/dealer/orders" component={StockRequests} />
      <Route path="/dealer/offers" component={Offers} />
      <Route path="/dealer/conversations" component={Conversations} />
      <Route path="/dealer/conversations/:id" component={ConversationDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PharmacyRouter() {
  return (
    <Switch>
      <Route path="/pharmacy" component={PharmacyDashboard} />
      <Route path="/pharmacy/profile" component={PharmacyProfile} />
      <Route path="/pharmacy/catalogue" component={PharmacyCatalogue} />
      <Route path="/pharmacy/orders" component={PharmacyOrders} />
      <Route path="/pharmacy/invoices" component={PharmacyInvoices} />
      <Route path="/pharmacy/voice" component={PharmacyVoice} />
      <Route path="/pharmacy/conversations" component={PharmacyConversations} />
      <Route path="/pharmacy/conversations/:id" component={ConversationDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DealerLayout() {
  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };
  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <DealerSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="font-semibold text-sm text-muted-foreground hidden sm:block">Dealer Portal · MediVoice AI</span>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <DealerRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function PharmacyLayoutInner() {
  const { pharmacyId } = usePharmacyContext();
  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  if (!pharmacyId) {
    return <PharmacySelector />;
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <PharmacistSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-sm text-muted-foreground hidden sm:block">Pharmacist Portal · MediVoice AI</span>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <PharmacyRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function PharmacyLayout() {
  return (
    <PharmacyProvider>
      <PharmacyLayoutInner />
    </PharmacyProvider>
  );
}

function AppRouter() {
  const [location] = useLocation();

  if (location === "/") return <Landing />;
  if (location.startsWith("/dealer")) return <DealerLayout />;
  if (location.startsWith("/pharmacy")) return <PharmacyLayout />;
  return <Landing />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppRouter />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
