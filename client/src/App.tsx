import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/LoginPage";
import TeacherDashboard from "@/pages/TeacherDashboard";
import BatchDetailsPage from "@/pages/BatchDetailsPage";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import StudentRegistrationPage from "@/pages/StudentRegistrationPage";
import NotFound from "@/pages/not-found";

function Router() {
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);

  const handleLogin = (username: string, password: string) => {
    console.log('Login attempt:', username);
    if (username === 'admin') {
      setCurrentUser({ role: 'superadmin' });
    } else {
      setCurrentUser({ role: 'teacher' });
    }
  };

  return (
    <Switch>
      <Route path="/">
        {() => {
          if (!currentUser) {
            return <LoginPage onLogin={handleLogin} />;
          }
          if (currentUser.role === 'superadmin') {
            return <SuperAdminDashboard />;
          }
          return <TeacherDashboard />;
        }}
      </Route>
      <Route path="/batch/:id" component={BatchDetailsPage} />
      <Route path="/register/:token" component={StudentRegistrationPage} />
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
