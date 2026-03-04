import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  Star,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Team Members", url: "/team", icon: Users },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Tasks", url: "/tasks", icon: ClipboardList },
  { title: "Weekly Tasks", url: "/weekly-tasks", icon: ClipboardList },
  { title: "Quality Checks", url: "/quality", icon: Star },
  { title: "Shift Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Mass Messages", url: "/messages", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`px-4 py-5 ${collapsed ? "px-2" : ""}`}>
          {!collapsed ? (
            <h1 className="text-lg font-bold gradient-text">Chatting University</h1>
          ) : (
            <span className="text-xl font-bold text-primary block text-center">CU</span>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
