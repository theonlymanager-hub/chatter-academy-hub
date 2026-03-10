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

const sections = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Team Members", url: "/team", icon: Users },
      { title: "Quality Checks", url: "/quality", icon: Star },
      { title: "Mark Tasks", url: "/tasks", icon: ClipboardList },
      { title: "Chatter Tasks", url: "/weekly-tasks", icon: ClipboardList },
    ],
  },
  {
    label: "Training",
    items: [
      { title: "Training", url: "/training", icon: GraduationCap },
      { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen },
    ],
  },
  {
    label: "Calendar",
    items: [
      { title: "Shift Calendar", url: "/calendar", icon: CalendarDays },
      { title: "Shift Scheduler", url: "/shifts", icon: Clock },
      { title: "Mass Messages", url: "/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Profiles",
    items: [
      { title: "Client Profiles", url: "/clients", icon: UserCircle },
      { title: "Fan Profiles", url: "/fans", icon: Heart },
    ],
  },
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
    </Sidebar>
  );
}
