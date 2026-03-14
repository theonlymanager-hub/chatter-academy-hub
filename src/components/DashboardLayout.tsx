import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* OM Watermark */}
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0 overflow-hidden">
            <span
              className="text-[20rem] font-black tracking-tight select-none"
              style={{ opacity: 0.06, color: "#94a3b8" }}
            >
              OM
            </span>
          </div>
          <header className="h-14 flex items-center border-b border-border/50 px-4 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight">
                <span style={{ color: "#00BCD4" }}>O</span>
                <span className="text-slate-300">M</span>
              </span>
              <span className="text-sm font-medium text-muted-foreground">The Only Board</span>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto relative z-[1]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
