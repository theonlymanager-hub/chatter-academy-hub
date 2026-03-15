import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Clock,
  UserCircle,
  Star,
  Heart,
  BookOpen,
  Palette,
  Settings,
  LogOut,
  Trophy,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const getAllSections = () => [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Team Members", url: "/team", icon: Users, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Quality Checks", url: "/quality", icon: Star, roles: ['admin', 'supervisor', 'data_entry'] },
      { title: "Chat Feedback", url: "/chat-feedback", icon: MessageSquare, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Chatter Tasks", url: "/tasks", icon: ClipboardList, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Mass Messages", url: "/messages", icon: MessageSquare, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Quality Checks", url: "/quality", icon: BarChart3, roles: ['admin', 'supervisor', 'data_entry'] },
      { title: "Customs Board", url: "/customs", icon: Palette, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Content Ideas", url: "/content-ideas", icon: Lightbulb, roles: ['admin', 'supervisor', 'data_entry'] },
      { title: "Strike Tracker", url: "/strikes", icon: ShieldAlert, roles: ['admin', 'supervisor'] },
      { title: "Scorecards", url: "/scorecards", icon: Trophy, roles: ['admin', 'supervisor'] },
    ],
  },
  {
    label: "Profiles",
    items: [
      { title: "Fan Profiles", url: "/fans", icon: Heart, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Client Profiles", url: "/clients", icon: UserCircle, roles: ['admin', 'supervisor', 'data_entry'] },
    ],
  },
  {
    label: "Calendar",
    items: [
      { title: "Shift Calendar", url: "/calendar", icon: CalendarDays, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
    ],
  },
  {
    label: "Training",
    items: [
      { title: "Training", url: "/training", icon: GraduationCap, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Training Results", url: "/training-results", icon: Trophy, roles: ['admin', 'supervisor'] },
      { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "User Management", url: "/users", icon: Settings, roles: ['admin'] },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();

  const sections = getAllSections().map(section => ({
    ...section,
    items: section.items.filter(item => user && item.roles.includes(user.role))
  })).filter(section => section.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`px-4 py-5 ${collapsed ? "px-2" : ""}`}>
          {!collapsed ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight">
                  <span style={{ color: "#00BCD4" }}>O</span>
                  <span className="text-slate-300">M</span>
                </span>
                <h1 className="text-lg font-bold text-primary">The Only Board</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Welcome, {user?.displayName}</p>
            </div>
          ) : (
            <span className="text-xl font-black block text-center">
              <span style={{ color: "#00BCD4" }}>O</span>
              <span className="text-slate-300">M</span>
            </span>
          )}
        </div>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
