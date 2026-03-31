// The Only Board v2
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PageVisitTracker from "./components/PageVisitTracker";
import { PageVisitProvider } from "./hooks/usePageVisitTracker";
import Login from "./components/Login";
import Index from "./pages/Index";
import TeamMembers from "./pages/TeamMembers";
import Training from "./pages/Training";
import TrainingResults from "./pages/TrainingResults";
import TrainingVideos from "./pages/TrainingVideos";
import Tasks from "./pages/Tasks";
import QualityChecks from "./pages/QualityChecks";
import QCInput from "./pages/QCInput";
import TeamList from "./pages/TeamList";
import ShiftCalendar from "./pages/ShiftCalendar";
import MassMessageCalendar from "./pages/MassMessageCalendar";
// WeeklyTasks merged into Tasks
import Analytics from "./pages/Analytics";
import Shifts from "./pages/Shifts";
import ClientProfiles from "./pages/ClientProfiles";
import FanProfiles from "./pages/FanProfiles";
import KnowledgeBase from "./pages/KnowledgeBase";
import Customs from "./pages/Customs";
import ChatFeedback from "./pages/ChatFeedback";
import StrikeTracker from "./pages/StrikeTracker";
import ContentIdeas from "./pages/ContentIdeas";
import GameStrategies from "./pages/GameStrategies";
import ScenarioBoard from "./pages/ScenarioBoard";
import LtvTracker from "./pages/LtvTracker";
import AirbnbTracker from "./pages/AirbnbTracker";
import AirbnbSchedule from "./pages/AirbnbSchedule";
import ShootChecklist from "./pages/ShootChecklist";
import ChatterScorecard from "./pages/ChatterScorecard";
import UserManagement from "./pages/UserManagement";
import DailyChecklist from "./pages/DailyChecklist";
import ClientOnboarding from "./pages/ClientOnboarding";
import ChatterTasks from "./pages/ChatterTasks";
import ChattingPlaybook from "./pages/ChattingPlaybook";
import ClientChecklist from "./pages/ClientChecklist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <PageVisitTracker />
      <Routes>
        {/* Public shoot checklist - NO LOGIN REQUIRED */}
        <Route path="/shoot/:token" element={<ShootChecklist />} />

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
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <TeamMembers />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'chatter', 'demo']}>
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
          path="/training-videos" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TrainingVideos />
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
          path="/chatting-playbook" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'chatter', 'demo']}>
              <DashboardLayout>
                <ChattingPlaybook />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/knowledge-base" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'chatter', 'demo']}>
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

        {/* QC Input - Admin/Supervisor only */}
        <Route 
          path="/qc-input" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QCInput />
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
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <Shifts />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
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
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Chat Feedback - All roles */}
        <Route 
          path="/chat-feedback" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChatFeedback />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Strike Tracker - Admin, Supervisor */}
        <Route 
          path="/strikes" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'demo']}>
              <DashboardLayout>
                <StrikeTracker />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Content Ideas - Admin, Supervisor, Data Entry */}
        <Route 
          path="/content-ideas" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <ContentIdeas />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Game Strategies - All roles */}
        <Route 
          path="/game-strategies" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'chatter', 'demo']}>
              <DashboardLayout>
                <GameStrategies />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Scenario Board - All roles */}
        <Route 
          path="/scenarios" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'chatter', 'demo']}>
              <DashboardLayout>
                <ScenarioBoard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* LTV Tracker - Admin, Supervisor, Data Entry */}
        <Route 
          path="/ltv" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <LtvTracker />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Airbnb Tracker - Admin, Supervisor, Data Entry */}
        <Route 
          path="/airbnb" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <AirbnbTracker />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Airbnb Schedule - All roles (chatters view-only) */}
        <Route 
          path="/airbnb-schedule" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'chatter', 'demo']}>
              <DashboardLayout>
                <AirbnbSchedule />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Chatter Scorecards - Admin, Supervisor */}
        <Route 
          path="/scorecards" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'demo']}>
              <DashboardLayout>
                <ChatterScorecard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Operations - Admin, Supervisor, Data Entry */}
        <Route 
          path="/customs" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
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
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <ClientProfiles />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fans" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'chatter', 'demo']}>
              <DashboardLayout>
                <FanProfiles />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Team List - Admin + Supervisors */}
        <Route 
          path="/team-list" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TeamList />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* User Management - Admin only */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'demo']}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Daily Checklist - Admin + Supervisors + Data Entry */}
        <Route 
          path="/my-day" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <DailyChecklist />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Chatter Task Repetition - Admin + Supervisor */}
        <Route 
          path="/chatter-tasks" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'demo']}>
              <DashboardLayout>
                <ChatterTasks />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Client Onboarding - Admin + Supervisor */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'demo']}>
              <DashboardLayout>
                <ClientOnboarding />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Content Checklist — Dashboard version for team */}
        <Route 
          path="/content-checklist" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'data_entry', 'demo']}>
              <DashboardLayout>
                <ClientChecklist />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Public client-facing page — NO auth, NO layout */}
        <Route path="/client-checklist" element={<ClientChecklist />} />

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
        <PageVisitProvider>
          <AppContent />
        </PageVisitProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
