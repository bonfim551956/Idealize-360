import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { UnitFilterProvider } from "@/contexts/UnitFilterContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layouts
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Jornada from "@/pages/Jornada";
import NotFound from "@/pages/NotFound";
import Users from "@/pages/settings/Users";

// Talents
import PublicJobs from "@/pages/talents/PublicJobs";
import JobDetails from "@/pages/talents/JobDetails";
import ApplyJob from "@/pages/talents/ApplyJob";
import JobsList from "@/pages/talents/JobsList";
import CandidatesList from "@/pages/talents/CandidatesList";
import Pipeline from "@/pages/talents/Pipeline";

// People
import EmployeesList from "@/pages/people/EmployeesList";
import EmployeeProfile from "@/pages/people/EmployeeProfile";
import Ranking from "@/pages/people/Ranking";
import Evaluations from "@/pages/people/Evaluations";
import Pdis from "@/pages/people/Pdis";
import DiscResults from "@/pages/people/DiscResults";
import DiscTest from "@/pages/DiscTest";

// Academy
import CoursesList from "@/pages/academy/CoursesList";
import CoursePlayer from "@/pages/academy/CoursePlayer";
import Certificates from "@/pages/academy/Certificates";

// Units & Settings
import UnitsList from "@/pages/units/UnitsList";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <UnitFilterProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/careers" element={<PublicJobs />} />
          <Route path="/careers/:id" element={<JobDetails />} />
          <Route path="/careers/:id/apply" element={<ApplyJob />} />
          <Route path="/disc" element={<DiscTest />} />

          {/* Protected Routes — exigem login */}
          <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jornada" element={<Jornada />} />
            
            {/* Talents */}
            <Route path="/talents/jobs" element={<JobsList />} />
            <Route path="/talents/candidates" element={<CandidatesList />} />
            <Route path="/talents/pipeline" element={<Pipeline />} />
            
            {/* People */}
            <Route path="/people/employees" element={<EmployeesList />} />
            <Route path="/people/employees/:id" element={<EmployeeProfile />} />
            <Route path="/people/evaluations" element={<Evaluations />} />
            <Route path="/people/pdis" element={<Pdis />} />
            <Route path="/people/disc" element={<DiscResults />} />
            <Route path="/people/ranking" element={<Ranking />} />

            {/* Academy */}
            <Route path="/academy/courses" element={<CoursesList />} />
            <Route path="/academy/courses/:id" element={<CoursePlayer />} />
            <Route path="/academy/progress" element={<CoursesList />} />
            <Route path="/academy/certificates" element={<Certificates />} />

            {/* Units */}
            <Route path="/units" element={<UnitsList />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* Usuários — apenas admin/RH */}
            <Route element={<ProtectedRoute allow={["admin", "rh"]} />}>
              <Route path="/settings/users" element={<Users />} />
            </Route>
          </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </UnitFilterProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
