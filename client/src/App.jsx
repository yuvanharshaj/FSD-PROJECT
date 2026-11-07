import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import FindParking from './pages/FindParking';
import LotDetails from './pages/LotDetails';
import BookingConfirm from './pages/BookingConfirm';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import LoginRegister from './pages/LoginRegister';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Root application component configuring React Router, Auth and Theme providers, and layout structure
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
            
            {/* Global Sticky Navigation Header */}
            <Navbar />

            {/* Application Main Content Router */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/find" element={<FindParking />} />
                <Route path="/lots/:id" element={<LotDetails />} />
                
                {/* Protected Driver Routes */}
                <Route
                  path="/book/confirm"
                  element={
                    <ProtectedRoute>
                      <BookingConfirm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Only Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginRegister initialMode="login" />} />
                <Route path="/register" element={<LoginRegister initialMode="register" />} />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Floating 60-Second Help Guide */}
            <HelpModal />

            {/* Notification Toaster */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'text-xs font-semibold rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
                duration: 4000
              }}
            />

          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
