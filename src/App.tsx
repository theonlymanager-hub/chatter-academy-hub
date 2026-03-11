import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import PasswordGate from "./components/PasswordGate";
import Index from "./pages/Index";
import TeamMembers from "./pages/TeamMembers";
import Training from "./pages/Training";
import Tasks from "./pages/Tasks";
import QualityChecks from "./pages/QualityChecks";
import ShiftCalendar from "./pages/ShiftCalendar";
import MassMessageCalendar from "./pages/MassMessageCalendar";
import WeeklyTasks from "./pages/WeeklyTasks";
import Analytics from "./pages/Analytics";
import Shifts from "./pages/Shifts";
import ClientProfiles from "./pages/ClientProfiles";
import FanProfiles from "./pages/FanProfiles";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PasswordGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
          <Route path="/team" element={<DashboardLayout><TeamMembers /></DashboardLayout>} />
          <Route path="/training" element={<DashboardLayout><Training /></DashboardLayout>} />
          <Route path="/knowledge-base" element={<DashboardLayout><KnowledgeBase /></DashboardLayout>} />
          <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
          <Route path="/weekly-tasks" element={<DashboardLayout><WeeklyTasks /></DashboardLayout>} />
          <Route path="/quality" element={<DashboardLayout><QualityChecks /></DashboardLayout>} />
          <Route path="/calendar" element={<DashboardLayout><ShiftCalendar /></DashboardLayout>} />
          <Route path="/messages" element={<DashboardLayout><MassMessageCalendar /></DashboardLayout>} />
          <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/shifts" element={<DashboardLayout><Shifts /></DashboardLayout>} />
          <Route path="/clients" element={<DashboardLayout><ClientProfiles /></DashboardLayout>} />
          <Route path="/fans" element={<DashboardLayout><FanProfiles /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </PasswordGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
