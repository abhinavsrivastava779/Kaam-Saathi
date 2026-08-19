import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';

import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import FloatingBackButton from './components/FloatingBackButton';
import AIChatButton from './components/AIChatButton';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import WorkerSignup from './pages/WorkerSignup';
import WorkerDashboard from './pages/WorkerDashboard';
import EmployerSearch from './pages/EmployerSearch';
import EmployerResults from './pages/EmployerResults';
import WorkerDetail from './pages/WorkerDetail';
import Helpline from './pages/Helpline';
import WhatsappOnboarding from './pages/WhatsappOnboarding';
import MissedCall from './pages/MissedCall';
import IvrSimulator from './pages/IvrSimulator';
import AdminDashboard from './pages/AdminDashboard';
import EmployerLogin from './pages/EmployerLogin';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminLogin from './pages/AdminLogin';
import AIChat from './pages/AIChat';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <Router>

              <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">

                {/* Header */}
                <Header />

                {/* Main Content */}
                <main className="flex-1 max-w-md w-full mx-auto px-3.5 pt-3 pb-24">

                  <Routes>

                    {/* Home */}
                    <Route
                      path="/"
                      element={<Home />}
                    />

                    {/* Worker */}
                    <Route
                      path="/worker/signup"
                      element={<WorkerSignup />}
                    />

                    <Route
                      path="/worker/otp"
                      element={<WorkerSignup />}
                    />

                    <Route
                      path="/worker/profile"
                      element={<WorkerSignup />}
                    />

                    <Route
                      path="/worker/dashboard"
                      element={<WorkerDashboard />}
                    />

                    <Route
                      path="/worker/:id"
                      element={<WorkerDetail />}
                    />

                    {/* Employer */}
                    <Route
                      path="/employer/login"
                      element={<EmployerLogin />}
                    />

                    <Route
                      path="/employer/dashboard"
                      element={<EmployerDashboard />}
                    />

                    <Route
                      path="/employer/search"
                      element={<EmployerSearch />}
                    />

                    <Route
                      path="/employer/results"
                      element={<EmployerResults />}
                    />

                    {/* Help / Communication */}
                    <Route
                      path="/help"
                      element={<Helpline />}
                    />

                    <Route
                      path="/whatsapp"
                      element={<WhatsappOnboarding />}
                    />

                    <Route
                      path="/missed-call"
                      element={<MissedCall />}
                    />

                    <Route
                      path="/ivr"
                      element={<IvrSimulator />}
                    />

                    {/* Admin */}
                    <Route
                      path="/admin"
                      element={<AdminLogin />}
                    />

                    <Route
                      path="/admin/login"
                      element={<AdminLogin />}
                    />

                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />

                    {/* AI Chat */}
                    <Route
                      path="/ai-chat"
                      element={<AIChat />}
                    />

                  </Routes>

                </main>

                {/* AI Chat Floating Button */}
                <AIChatButton />

                {/* One-Step Floating Back Button */}
                <FloatingBackButton />

                {/* Sticky Bottom Navigation */}
                <BottomNavigation />

              </div>

            </Router>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}