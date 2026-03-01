import { useLocation, Link } from "wouter";
import { LayoutDashboard, Building2, MessageSquare, Pill, ClipboardList, Phone, User, LogOut, Zap } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Overview", items: [
    { title: "Dashboard", url: "/pharmacy", icon: LayoutDashboard, exact: true },
    { title: "My Profile", url: "/pharmacy/profile", icon: User },
  ]},
  { label: "Medicines", items: [
    { title: "Browse Catalogue", url: "/pharmacy/catalogue", icon: Pill },
    { title: "My Orders", url: "/pharmacy/orders", icon: ClipboardList },
  ]},
  { label: "MediVoice AI", items: [
    { title: "Call AI Assistant", url: "/pharmacy/voice", icon: Phone },
    { title: "Call History", url: "/pharmacy/conversations", icon: MessageSquare },
  ]},
];

export function PharmacistSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4 border-b">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Building2 className="text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background animate-blink" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Pharmacist Portal</p>
            <p className="text-xs text-muted-foreground">MediVoice AI</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {navItems.map((group, gi) => (
          <SidebarGroup key={group.label} className="animate-fade-in-up" style={{ animationDelay: `${gi * 60}ms` }}>
            <SidebarGroupLabel className="text-xs font-semibold tracking-wider px-3 uppercase text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, ii) => {
                  const isActive = item.exact ? location === item.url : location.startsWith(item.url);
                  const isVoice = item.url === "/pharmacy/voice";
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="relative group transition-all duration-200"
                      >
                        <Link
                          href={item.url}
                          data-testid={`link-pharmacy-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${(gi * 5 + ii) * 40}ms` }}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-emerald-500" />
                          )}
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            isActive ? "bg-emerald-100 dark:bg-emerald-900/60" :
                            isVoice ? "bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40" :
                            "bg-transparent group-hover:bg-muted"
                          }`}>
                            <item.icon className={`h-3.5 w-3.5 ${
                              isActive ? "text-emerald-600 dark:text-emerald-400" :
                              isVoice ? "text-emerald-500" :
                              "text-muted-foreground"
                            }`} />
                          </div>
                          <span className={`font-medium ${
                            isActive ? "text-emerald-700 dark:text-emerald-300" :
                            isVoice ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""
                          }`}>{item.title}</span>
                          {isVoice && !isActive && (
                            <div className="ml-auto flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink" />
                            </div>
                          )}
                          {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 animate-blink" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t">
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 mb-2 border border-emerald-100 dark:border-emerald-900/60">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">AI Connected</p>
            <p className="text-xs text-muted-foreground truncate">OpenAI + Twilio</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-blink flex-shrink-0" />
        </div>
        <Link href="/">
          <button
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 w-full px-2 py-2 rounded-lg"
            data-testid="link-pharmacy-exit"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch Portal</span>
          </button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
