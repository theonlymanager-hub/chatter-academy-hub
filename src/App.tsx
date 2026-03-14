// The Only Board v2
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Index from "./pages/Index";
import TeamMembers from "./pages/TeamMembers";
import Training from "./pages/Training";
import TrainingResults from "./pages/TrainingResults";
import Tasks from "./pages/Tasks";
import QualityChecks from "./pages/QualityChecks";
import ShiftCalendar from "./pages/ShiftCalendar";
import MassMessageCalendar from "./pages/MassMessageCalendar";
// WeeklyTasks merged into Tasks
import Analytics from "./pages/Analytics";
import Shifts from "./pages/Shifts";
import ClientProfiles from "./pages/ClientProfiles";
import FanProfiles from "./pages/FanProfiles";
import KnowledgeBase from "./pages/KnowledgeBase";
import Customs from "./pages/Customs";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard - All roles */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Index />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Team pages - Admin, Supervisor, Data Entry */}
        <Route 
          path="/team" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <TeamMembers />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <Tasks />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        {/* Weekly tasks merged into /tasks */}

        {/* Training - All roles */}
        <Route 
          path="/training" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Training />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/training-results" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TrainingResults />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/knowledge-base" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <KnowledgeBase />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Quality - All roles (but chatters see filtered data) */}
        <Route 
          path="/quality" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QualityChecks />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Calendar - All roles */}
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ShiftCalendar />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shifts" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <Shifts />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <MassMessageCalendar />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Analytics - Admin, Supervisor, Data Entry */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Operations - Admin, Supervisor, Data Entry */}
        <Route 
          path="/customs" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <Customs />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Profiles - Admin, Supervisor, Data Entry */}
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <ClientProfiles />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fans" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry']}>
              <DashboardLayout>
                <FanProfiles />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* User Management - Admin only */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
