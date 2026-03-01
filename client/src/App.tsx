import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import PharmacistPortal from "@/pages/pharmacist-portal";
import DealerPortal from "@/pages/dealer-portal";
import Conversations from "@/pages/conversations";
import ConversationDetail from "@/pages/conversation-detail";
import Inventory from "@/pages/inventory";
import Medicines from "@/pages/medicines";
import StockRequests from "@/pages/stock-requests";
import Offers from "@/pages/offers";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pharmacist" component={PharmacistPortal} />
      <Route path="/dealer" component={DealerPortal} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/conversations/:id" component={ConversationDetail} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/medicines" component={Medicines} />
      <Route path="/stock-requests" component={StockRequests} />
      <Route path="/offers" component={Offers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <span className="font-semibold text-sm text-muted-foreground hidden sm:block">MediVoice AI</span>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
