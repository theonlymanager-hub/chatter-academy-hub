import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Index from "./pages/Index";
import TeamMembers from "./pages/TeamMembers";
import Training from "./pages/Training";
import Tasks from "./pages/Tasks";
import QualityChecks from "./pages/QualityChecks";
import ShiftCalendar from "./pages/ShiftCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
          <Route path="/team" element={<DashboardLayout><TeamMembers /></DashboardLayout>} />
          <Route path="/training" element={<DashboardLayout><Training /></DashboardLayout>} />
          <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
          <Route path="/quality" element={<DashboardLayout><QualityChecks /></DashboardLayout>} />
          <Route path="/calendar" element={<DashboardLayout><ShiftCalendar /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
