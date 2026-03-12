import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  Star,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Clock,
  UserCircle,
  Heart,
  BookOpen,
  Palette,
  Settings,
  LogOut,
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
      { title: "Team Members", url: "/team", icon: Users, roles: ['admin', 'supervisor', 'data_entry'] },
      { title: "Quality Checks", url: "/quality", icon: Star, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Mark Tasks", url: "/tasks", icon: ClipboardList, roles: ['admin', 'supervisor', 'data_entry'] },
      { title: "Chatter Tasks", url: "/weekly-tasks", icon: ClipboardList, roles: ['admin', 'supervisor', 'data_entry'] },
    ],
  },
  {
    label: "Training",
    items: [
      { title: "Training", url: "/training", icon: GraduationCap, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen, roles: ['admin', 'supervisor', 'data_entry'] },
    ],
  },
  {
    label: "Calendar",
    items: [
      { title: "Shift Calendar", url: "/calendar", icon: CalendarDays, roles: ['admin', 'supervisor', 'data_entry', 'chatter'] },
      { title: "Shift Scheduler", url: "/shifts", icon: Clock, roles: ['admin', 'supervisor', 'data_entry'] },
      { title: "Mass Messages", url: "/messages", icon: MessageSquare, roles: ['admin', 'supervisor', 'data_entry'] },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Customs Board", url: "/customs", icon: Palette, roles: ['admin', 'supervisor', 'data_entry'] },
    ],
  },
  {
    label: "Profiles",
    items: [
      { title: "Client Profiles", url: "/clients", icon: UserCircle, roles: ['admin', 'supervisor', 'data_entry'] },
      { title: "Fan Profiles", url: "/fans", icon: Heart, roles: ['admin', 'supervisor', 'data_entry'] },
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
              <h1 className="text-lg font-bold gradient-text">The Only Board</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome, {user?.displayName}</p>
            </div>
          ) : (
            <span className="text-xl font-bold text-primary block text-center">OB</span>
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
