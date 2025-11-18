import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authApi } from "@/lib/api";
import { useEffect } from "react";
import LoginPage from "@/pages/LoginPage";
import TeacherDashboard from "@/pages/TeacherDashboard";
import BatchDetailsPage from "@/pages/BatchDetailsPage";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import StudentRegistrationPage from "@/pages/StudentRegistrationPage";
import TermsAcceptancePage from "@/pages/TermsAcceptancePage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsConditions from "@/pages/TermsConditions";
import RefundPolicy from "@/pages/RefundPolicy";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  
  const { data: userData, isLoading } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const user = userData?.user;

  // Handle terms acceptance redirect - must be called before any early returns
  useEffect(() => {
    if (user && !user.hasAcceptedTerms && location !== "/accept-terms" && !location.startsWith("/privacy-policy") && !location.startsWith("/terms-conditions") && !location.startsWith("/refund-policy") && !location.startsWith("/register/")) {
      // Store the intended destination
      sessionStorage.setItem("redirectAfterTerms", location);
      setLocation("/accept-terms");
    }
  }, [user, location, setLocation]);

  const handleLogin = async (username: string, password: string) => {
    try {
      await authApi.login(username, password);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/register/:token" component={StudentRegistrationPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/accept-terms">
        {() => {
          if (!user) return <LoginPage onLogin={handleLogin} />;
          return <TermsAcceptancePage />;
        }}
      </Route>
      <Route path="/batch/:id">
        {(params) => {
          if (!user) return <LoginPage onLogin={handleLogin} />;
          if (!user.hasAcceptedTerms) return null;
          return <BatchDetailsPage batchId={params.id} />;
        }}
      </Route>
      <Route path="/">
        {() => {
          if (!user) {
            return <LoginPage onLogin={handleLogin} />;
          }
          if (!user.hasAcceptedTerms) return null;
          if (user.role === 'superadmin') {
            return <SuperAdminDashboard />;
          }
          return <TeacherDashboard />;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
