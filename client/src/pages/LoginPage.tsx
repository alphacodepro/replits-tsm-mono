import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  AlertCircle,
  Loader2,
  GraduationCap,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* -----------------------------------------------------
   WEEKLY ORGANIC GROWTH
----------------------------------------------------- */
function useOrganicStats() {
  const [students, setStudents] = useState(2000);
  const [emails, setEmails] = useState(5000);

  useEffect(() => {
    const savedStudents = parseInt(localStorage.getItem("tsm_students_count") || "2000");
    const savedEmails = parseInt(localStorage.getItem("tsm_emails_count") || "5000");
    const lastUpdate = parseInt(localStorage.getItem("tsm_last_update") || "0");

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeksPassed = lastUpdate ? Math.floor((now - lastUpdate) / weekMs) : 1;

    let newStudents = savedStudents;
    let newEmails = savedEmails;

    if (weeksPassed >= 1) {
      for (let i = 0; i < weeksPassed; i++) {
        newStudents += Math.floor(Math.random() * (156 - 80 + 1)) + 80;
        newEmails += Math.floor(Math.random() * (350 - 250 + 1)) + 250;
      }

      localStorage.setItem("tsm_students_count", newStudents.toString());
      localStorage.setItem("tsm_emails_count", newEmails.toString());
      localStorage.setItem("tsm_last_update", now.toString());
    }

    setStudents(newStudents);
    setEmails(newEmails);
  }, []);

  return { students, emails };
}

/* -----------------------------------------------------
   SLOW, LUXURY COUNT-UP WITH MICRO-SCALE AT END
----------------------------------------------------- */
function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(0);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const stepTime = 20;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    let step = 0;
    const totalSteps = duration / stepTime;

    const interval = setInterval(() => {
      step++;
      const progress = easeOut(step / totalSteps);
      const animatedValue = Math.floor(progress * end);

      setDisplay(animatedValue);

      if (step >= totalSteps) {
        clearInterval(interval);
        setDisplay(end);

        // MICRO SCALE POP EFFECT
        setPop(true);
        setTimeout(() => setPop(false), 200);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [value]);

  return { display, pop };
}

/* -----------------------------------------------------
   FORMAT LIKE "2630+"
----------------------------------------------------- */
function formatPlus(num: number) {
  return `${Math.round(num / 10) * 10}+`;
}

/* -----------------------------------------------------
   MAIN PAGE
----------------------------------------------------- */
export default function LoginPage({ onLogin }: any) {
  const { students, emails } = useOrganicStats();
  const { display: animatedStudents, pop: studentPop } = useAnimatedNumber(students);
  const { display: animatedEmails, pop: emailPop } = useAnimatedNumber(emails);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onLogin(username, password);
    } catch (err: any) {
      const msg = err.message || "Login failed";
      setError(msg);
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">

      {/* BACKGROUND LUXURY GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950" />

      {/* PARALLAX BLOB FLOAT */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute top-10 left-20 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-indigo-400/40 rounded-full blur-3xl animate-float-slower" />
      </div>

      {/* CREATE FLOAT ANIMATIONS */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }

          .animate-float-slow { animation: float 6s ease-in-out infinite; }
          .animate-float-slower { animation: float 9s ease-in-out infinite; }

          @keyframes shimmer {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }
          .animate-shimmer { animation: shimmer 2.4s ease-in-out infinite; }
        `}
      </style>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-20">

        {/* LEFT — ULTRA-PREMIUM STATS */}
        <div className="hidden md:flex flex-col gap-8 w-[45%] pl-6 -translate-y-2 animate-in fade-in duration-700">

          {/* SHIMMER GLOW */}
          <div className="absolute left-0 top-28 w-[550px] h-[550px] bg-blue-200/30 blur-3xl rounded-full animate-shimmer"></div>

          {/* STUDENTS */}
          <div className="flex items-center gap-6 animate-in slide-in-from-left-8 duration-1000 delay-150">
            <div className="relative group animate-float">
              <div className="absolute inset-0 bg-blue-200/50 rounded-2xl blur-xl opacity-70 group-hover:opacity-90 transition-all"></div>
              <div className="relative p-4 rounded-2xl bg-white/70 backdrop-blur-xl shadow-lg group-hover:scale-[1.04] transition-all duration-500">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <p
              className={`text-[33px] leading-snug font-extrabold text-gray-900 tracking-tight max-w-[380px] transition-transform ${
                studentPop ? "scale-[1.05]" : "scale-100"
              }`}
            >
              {formatPlus(animatedStudents)} students added so far
            </p>
          </div>

          {/* EMAILS */}
          <div className="flex items-center gap-6 animate-in slide-in-from-left-8 duration-1000 delay-300">
            <div className="relative group animate-float-slow">
              <div className="absolute inset-0 bg-indigo-200/50 rounded-2xl blur-xl opacity-70 group-hover:opacity-90 transition-all"></div>
              <div className="relative p-4 rounded-2xl bg-white/70 backdrop-blur-xl shadow-lg group-hover:scale-[1.04] transition-all duration-500">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <p
              className={`text-[24px] font-semibold text-gray-800 leading-snug tracking-tight transition-transform ${
                emailPop ? "scale-[1.04]" : "scale-100"
              }`}
            >
              {formatPlus(animatedEmails)} emails sent successfully
            </p>
          </div>

          {/* DIVIDER */}
          <div className="w-14 h-[1px] bg-gray-400/40 ml-1 animate-in fade-in duration-700 delay-500"></div>

          {/* TAGLINE */}
          <p className="text-[17px] tracking-wide text-gray-700 font-medium ml-1 mt-2 animate-in fade-in duration-700 delay-650">
            Trusted by educators. Built for teachers.
          </p>
        </div>

        {/* RIGHT — LOGIN CARD */}
        <div className="flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

          <Card className="w-full shadow-2xl border-0 rounded-2xl backdrop-blur-sm bg-white/85">
            <div className="p-8 md:p-10">

              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-6 animate-float">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150 animate-shimmer" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-full shadow-xl">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                  Welcome Back
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Sign in to access your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.03] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t text-center border-gray-200">
                <p className="text-xs text-gray-500">
                  © 2025 Tuition Management System. All rights reserved.
                </p>
              </div>

            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
