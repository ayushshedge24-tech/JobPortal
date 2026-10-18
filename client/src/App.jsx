import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { SuspenseFallback } from "./components/ui/SuspenseFallback";

// Eager Core Pages for Instant FCP
import { HomePage } from "./pages/HomePage";
import { FindJobsPage } from "./pages/FindJobsPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { ApplyJobPage } from "./pages/ApplyJobPage";

// Lazy-Loaded Candidate Ecosystem Modules
const CandidateDashboard = lazy(() =>
  import("./pages/CandidateDashboard").then((m) => ({ default: m.CandidateDashboard }))
);
const CandidateProfile = lazy(() =>
  import("./pages/candidate/CandidateProfile").then((m) => ({ default: m.CandidateProfile }))
);
const ResumeManagement = lazy(() =>
  import("./pages/candidate/ResumeManagement").then((m) => ({ default: m.ResumeManagement }))
);
const ResumeBuilder = lazy(() =>
  import("./pages/candidate/ResumeBuilder").then((m) => ({ default: m.ResumeBuilder }))
);
const ResumeAnalyzer = lazy(() =>
  import("./pages/candidate/ResumeAnalyzer").then((m) => ({ default: m.ResumeAnalyzer }))
);
const SkillIntelligence = lazy(() =>
  import("./pages/candidate/SkillIntelligence").then((m) => ({ default: m.SkillIntelligence }))
);
const JobMatchPage = lazy(() =>
  import("./pages/candidate/JobMatchPage").then((m) => ({ default: m.JobMatchPage }))
);
const CareerIntelligencePage = lazy(() =>
  import("./pages/candidate/CareerIntelligencePage").then((m) => ({ default: m.CareerIntelligencePage }))
);
const RecommendedJobsPage = lazy(() =>
  import("./pages/candidate/RecommendedJobsPage").then((m) => ({ default: m.RecommendedJobsPage }))
);
const SavedJobsPage = lazy(() =>
  import("./pages/candidate/SavedJobsPage").then((m) => ({ default: m.SavedJobsPage }))
);
const ApplicationsPage = lazy(() =>
  import("./pages/candidate/ApplicationsPage").then((m) => ({ default: m.ApplicationsPage }))
);
const ApplicationDetailsPage = lazy(() =>
  import("./pages/candidate/ApplicationDetailsPage").then((m) => ({ default: m.ApplicationDetailsPage }))
);
const NotificationsPage = lazy(() =>
  import("./pages/candidate/NotificationsPage").then((m) => ({ default: m.NotificationsPage }))
);
const CandidateMessagesPage = lazy(() =>
  import("./pages/candidate/CandidateMessagesPage").then((m) => ({ default: m.CandidateMessagesPage }))
);

// Lazy-Loaded Recruiter Ecosystem Modules
const EmployerDashboard = lazy(() =>
  import("./pages/EmployerDashboard").then((m) => ({ default: m.EmployerDashboard }))
);
const RecruiterDashboard = lazy(() =>
  import("./pages/recruiter/RecruiterDashboard").then((m) => ({ default: m.RecruiterDashboard }))
);
const RecruiterJobsPage = lazy(() =>
  import("./pages/recruiter/RecruiterJobsPage").then((m) => ({ default: m.RecruiterJobsPage }))
);
const JobCreationPage = lazy(() =>
  import("./pages/recruiter/JobCreationPage").then((m) => ({ default: m.JobCreationPage }))
);
const JobEditPage = lazy(() =>
  import("./pages/recruiter/JobEditPage").then((m) => ({ default: m.JobEditPage }))
);
const RecruiterPipelinePage = lazy(() =>
  import("./pages/recruiter/RecruiterPipelinePage").then((m) => ({ default: m.RecruiterPipelinePage }))
);
const RecruiterApplicationDetailsPage = lazy(() =>
  import("./pages/recruiter/RecruiterApplicationDetailsPage").then((m) => ({ default: m.RecruiterApplicationDetailsPage }))
);
const CompanyProfilePage = lazy(() =>
  import("./pages/recruiter/CompanyProfilePage").then((m) => ({ default: m.CompanyProfilePage }))
);
const RecruiterMessagesPage = lazy(() =>
  import("./pages/recruiter/RecruiterMessagesPage").then((m) => ({ default: m.RecruiterMessagesPage }))
);

// Lazy-Loaded Admin SaaS Console Modules
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminUsersPage = lazy(() =>
  import("./pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage }))
);
const AdminUserDetailsPage = lazy(() =>
  import("./pages/admin/AdminUserDetailsPage").then((m) => ({ default: m.AdminUserDetailsPage }))
);
const AdminJobsPage = lazy(() =>
  import("./pages/admin/AdminJobsPage").then((m) => ({ default: m.AdminJobsPage }))
);
const AdminJobDetailsPage = lazy(() =>
  import("./pages/admin/AdminJobDetailsPage").then((m) => ({ default: m.AdminJobDetailsPage }))
);
const AdminApplicationsPage = lazy(() =>
  import("./pages/admin/AdminApplicationsPage").then((m) => ({ default: m.AdminApplicationsPage }))
);
const AdminApplicationDetailsPage = lazy(() =>
  import("./pages/admin/AdminApplicationDetailsPage").then((m) => ({ default: m.AdminApplicationDetailsPage }))
);
const AdminReportsPage = lazy(() =>
  import("./pages/admin/AdminReportsPage").then((m) => ({ default: m.AdminReportsPage }))
);
const AdminAuditLogsPage = lazy(() =>
  import("./pages/admin/AdminAuditLogsPage").then((m) => ({ default: m.AdminAuditLogsPage }))
);

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const location = useLocation();
  const isBuilderRoute = location.pathname.includes("/candidate/resumes/") && location.pathname.endsWith("/edit");

  return (
    <ErrorBoundary>
      <div className="app-container">
        <ScrollToTop />
        <Navbar />
        <main className="main-content" style={isBuilderRoute ? { padding: 0, margin: 0, maxWidth: "100%" } : {}}>
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<FindJobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/jobs/:id/apply" element={<ApplyJobPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Candidate Workstation Routes */}
              <Route
                path="/candidate-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resumes"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <ResumeManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resumes/:id"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <ResumeBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resumes/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <ResumeBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resumes/:id/analyze"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <ResumeAnalyzer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/skills"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <SkillIntelligence />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resumes/:id/skills"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <SkillIntelligence />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs/:jobId/match"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <JobMatchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/career-intelligence"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <CareerIntelligencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs/recommended"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <RecommendedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs/saved"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications/:id"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <ApplicationDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resumes/:id/analyzer"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <ResumeAnalyzer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/notifications"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/messages"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <CandidateMessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/messages/:id"
                element={
                  <ProtectedRoute allowedRoles={["JOB_SEEKER", "ADMIN"]}>
                    <CandidateMessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Recruiter Workspace */}
              <Route
                path="/employer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <JobCreationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <JobEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:jobId/applications"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterPipelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/applications"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterPipelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/applications/:id"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterApplicationDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/company"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <CompanyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/messages"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterMessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/messages/:id"
                element={
                  <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "employer"]}>
                    <RecruiterMessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin SaaS Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUserDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/candidates"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUsersPage defaultRole="JOB_SEEKER" pageTitle="Candidate Directory" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/recruiters"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUsersPage defaultRole="RECRUITER" pageTitle="Recruiter Directory" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminJobDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications/:id"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminApplicationDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminAuditLogsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all fallback to Home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>
        {!isBuilderRoute && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
