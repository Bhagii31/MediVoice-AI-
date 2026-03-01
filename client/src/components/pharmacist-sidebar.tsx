import { useLocation, Link } from "wouter";
import { LayoutDashboard, Building2, MessageSquare, Package, Pill, ClipboardList, Phone, User, LogOut } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Pharmacist Portal</p>
            <p className="text-xs text-muted-foreground">MediVoice AI</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => {
                  const isActive = item.exact ? location === item.url : location.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} data-testid={`link-pharmacy-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
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

      <SidebarFooter className="px-4 py-3 border-t space-y-2">
        <Link href="/">
          <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full" data-testid="link-pharmacy-exit">
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch Portal</span>
          </button>
        </Link>
        <p className="text-xs text-muted-foreground">Powered by OpenAI + Twilio</p>
      </SidebarFooter>
    </Sidebar>
  );
}
