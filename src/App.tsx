import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CropPlanning from "./pages/CropPlanning";
import Weather from "./pages/Weather";
import Insurance from "./pages/Insurance";
import Advisory from "./pages/Advisory";
import CropHealth from "./pages/CropHealth";
import MarketPrices from "./pages/MarketPrices";
import LoanEligibility from "./pages/LoanEligibility";
import VoiceAssistant from "./pages/VoiceAssistant";
import NotFound from "./pages/NotFound";
import Footer from '@/components/Footer';
import FloatingVoiceAssistant from '@/components/FloatingVoiceAssistant';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

function LayoutWithConditionalNavFooter({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNavFooter = location.pathname === '/auth';
  return (
    <>
      {!hideNavFooter && <Navbar />}
      {children}
      {!hideNavFooter && <Footer />}
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Loading KrishakSure...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function DefaultRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Loading KrishakSure...</p>
      </div>
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/auth" replace />;
}

const App = () => (
  <ErrorBoundary>
    <React.StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <LayoutWithConditionalNavFooter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/crop-planning" element={<ProtectedRoute><CropPlanning /></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
              <Route path="/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
              <Route path="/advisory" element={<ProtectedRoute><Advisory /></ProtectedRoute>} />
              <Route path="/crop-health" element={<ProtectedRoute><CropHealth /></ProtectedRoute>} />
              <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
              <Route path="/loan-eligibility" element={<ProtectedRoute><LoanEligibility /></ProtectedRoute>} />
              <Route path="/voice-assistant" element={<ProtectedRoute><VoiceAssistant /></ProtectedRoute>} />
              <Route path="/" element={<DefaultRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingVoiceAssistant />
          </LayoutWithConditionalNavFooter>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </React.StrictMode>
  </ErrorBoundary>
);

export default App;
