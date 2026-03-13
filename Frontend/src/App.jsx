import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { SnackbarProvider } from './context/SnackbarContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import DashboardSkeleton from './pages/DashboardSkeleton';
import AuthSkeleton from './pages/AuthSkeleton';
import './index.css';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResumeUpload = lazy(() => import('./pages/ResumeUpload'));
const ResumeEditor = lazy(() => import('./pages/ResumeEditor'));
const ResumeSelection = lazy(() => import('./pages/ResumeSelection'));
const ResumeTemplates = lazy(() => import('./pages/ResumeTemplates'));
const JobDescription = lazy(() => import('./pages/JobDescription'));
const Roadmap = lazy(() => import('./pages/Roadmap'));

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import CustomCursor from './components/CustomCursor';

const AppContent = () => {
  const { loading } = useUser();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
        <div className="noise-overlay" />
        <CustomCursor />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={
              <Suspense fallback={<AuthSkeleton />}>
                <Login />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<AuthSkeleton />}>
                <Register />
              </Suspense>
            } />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/resume-selection" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <ResumeSelection />
              </Suspense>
            } />
            <Route path="/job-description" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <JobDescription />
              </Suspense>
            } />
            <Route path="/resume-templates" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <ResumeTemplates />
              </Suspense>
            } />
            <Route path="/resume-upload" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <ResumeUpload />
              </Suspense>
            } />
            <Route path="/resume-editor" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <ResumeEditor />
              </Suspense>
            } />
            <Route path="/roadmap" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Roadmap />
              </Suspense>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <SnackbarProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </SnackbarProvider>
  );
};

export default App;
