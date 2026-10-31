import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/student/StudentDashboard';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CertificatesPage from './pages/CertificatesPage';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-950">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/certificates" element={<CertificatesPage />} />

                {/* Protected Student Portal */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'organizer', 'admin']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Organizer Studio */}
                <Route
                  path="/organizer"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Console */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

