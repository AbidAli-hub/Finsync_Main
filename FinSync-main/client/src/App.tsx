import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import GstReturnsPage from "@/pages/gst-returns";
import AnalyticsPage from "@/pages/analytics";
import ReportsPage from "@/pages/reports-new";
import InvoiceUploadPage from "@/pages/invoice-upload";
import SettingsPage from "@/pages/setting";
import CompliancePage from "@/pages/compliance";
import ProfilePage from "@/pages/profile";
import LoadingScreen from "@/components/ui/loading-screen";
import IntroAnimation from "@/components/intro/intro-animation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { NotificationProvider } from "@/hooks/use-notification";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [hasLoggedInThisSession, setHasLoggedInThisSession] = useState(false);
  const [showLoadingAfterLogin, setShowLoadingAfterLogin] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setHasSeenIntro(true);
  };

  const handleLoginSuccess = () => {
    setHasLoggedInThisSession(true);
    // Show loading screen for a full 3 seconds after login
    setShowLoadingAfterLogin(true);
    
    // Ensure loading screen stays for exactly 3 seconds
    setTimeout(() => {
      setShowLoadingAfterLogin(false);
    }, 3000);
  };

  // Always show intro first, regardless of authentication status
  if (showIntro && !hasSeenIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  // After intro, ALWAYS show login page first (even if user exists in storage)
  if (hasSeenIntro && !hasLoggedInThisSession) {
    const AuthPageWrapper = () => (
      <AuthPage onLoginSuccess={handleLoginSuccess} />
    );
    
    return (
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={AuthPageWrapper} />
          <Route path="/auth" component={AuthPageWrapper} />
          <Route component={AuthPageWrapper} />
        </Switch>
      </AnimatePresence>
    );
  }

  // Show loading screen after successful login for exactly 3 seconds
  // Only show this loading screen when specifically triggered by login success
  if (showLoadingAfterLogin) {
    return <LoadingScreen />;
  }

  // User has logged in this session, completed loading, and is authenticated - show app
  if (user && hasLoggedInThisSession && !showLoadingAfterLogin && !isLoading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/gst-returns" component={GstReturnsPage} />
            <Route path="/analytics" component={AnalyticsPage} />
            <Route path="/invoice-upload" component={InvoiceUploadPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/compliance" component={CompliancePage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route component={NotFound} />
          </Switch>
        </AnimatePresence>
      </ProtectedRoute>
    );
  }

  // Show loading screen while checking authentication status
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Fallback - should not reach here normally
  return <LoadingScreen />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen font-inter"
            >
              <AppRouter />
              <Toaster />
            </motion.div>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;