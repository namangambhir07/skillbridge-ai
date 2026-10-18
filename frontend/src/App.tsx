import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { JobsPage } from './pages/public/JobsPage';
import { JobDetailPage } from './pages/public/JobDetailPage';
import { StartupsPage } from './pages/public/StartupsPage';
import { MentorsPage } from './pages/public/MentorsPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Candidate Pages
import { DashboardPage as CandidateDashboard } from './pages/candidate/DashboardPage';
import { MatchesPage } from './pages/candidate/MatchesPage';
import { ApplicationsPage } from './pages/candidate/ApplicationsPage';
import { GrowthDashboardPage } from './pages/candidate/GrowthDashboardPage';
import { ProfilePage } from './pages/candidate/ProfilePage';

// Trace Engine Pages
import { AssessmentEditorPage } from './pages/trace/AssessmentEditorPage';
import { EvidenceReportPage } from './pages/trace/EvidenceReportPage';

// Employer Pages
import { EmployerDashboardPage } from './pages/employer/EmployerDashboardPage';
import { CreateJobPage } from './pages/employer/CreateJobPage';
import { ManageJobsPage } from './pages/employer/ManageJobsPage';
import { JobApplicantsPage } from './pages/employer/JobApplicantsPage';
import { AnalyticsPage } from './pages/employer/AnalyticsPage';
import { VerificationPage } from './pages/employer/VerificationPage';

// Mentor Pages
import { MentorRequestsPage } from './pages/mentor/MentorRequestsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('candidate' | 'employer' | 'mentor' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's primary dashboard
    if (user.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'mentor') return <Navigate to="/mentor/requests" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/community/startups" element={<StartupsPage />} />
        <Route path="/community/mentors" element={<MentorsPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Candidate Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/matches"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <MatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/growth"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <GrowthDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Trace Assessment Engine Routes */}
        <Route
          path="/trace/assessment/:id"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <AssessmentEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trace/evidence/:sessionId"
          element={
            <ProtectedRoute allowedRoles={['candidate', 'employer', 'admin']}>
              <EvidenceReportPage />
            </ProtectedRoute>
          }
        />

        {/* Employer / Recruiter Routes */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <EmployerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/new"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <ManageJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/applicants"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <JobApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/analytics"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/verification"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <VerificationPage />
            </ProtectedRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor/requests"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Moderation Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Convenient Aliases */}
        <Route path="/growth" element={<Navigate to="/candidate/growth" replace />} />
        <Route path="/dashboard" element={<Navigate to="/candidate/dashboard" replace />} />

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
export default App;
