import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, AlertCircle, Loader2, Eye, EyeOff, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch } from "wouter";

/* -----------------------------------------------------
   BASE NUMBERS (starting values)
----------------------------------------------------- */
const BASE = {
  students: 22140,
  emails: 97850,
  whatsapp: 251320,
  sms: 112480,
};

/* -----------------------------------------------------
   ISO YEAR-WEEK KEY  e.g. "2026-W12"
----------------------------------------------------- */
function getISOWeekKey(): string {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${week}`;
}

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* -----------------------------------------------------
   WEEKLY ORGANIC GROWTH HOOK
----------------------------------------------------- */
function useOrganicStats() {
  const [stats, setStats] = useState(BASE);

  useEffect(() => {
    const currentWeek = getISOWeekKey();
    const storedWeek = localStorage.getItem("tsm_v2_week") ?? "";

    const parse = (key: string): number => {
      const raw = localStorage.getItem(key);
      if (raw === null) return NaN;
      const n = parseInt(raw, 10);
      return isNaN(n) ? NaN : n;
    };

    let s = parse("tsm_v2_students");
    let e = parse("tsm_v2_emails");
    let w = parse("tsm_v2_whatsapp");
    let m = parse("tsm_v2_sms");

    // First visit or any key missing/corrupt — seed with base numbers, no growth
    if (!storedWeek || isNaN(s) || isNaN(e) || isNaN(w) || isNaN(m)) {
      s = BASE.students;
      e = BASE.emails;
      w = BASE.whatsapp;
      m = BASE.sms;
      localStorage.setItem("tsm_v2_students", s.toString());
      localStorage.setItem("tsm_v2_emails", e.toString());
      localStorage.setItem("tsm_v2_whatsapp", w.toString());
      localStorage.setItem("tsm_v2_sms", m.toString());
      localStorage.setItem("tsm_v2_week", currentWeek);
      setStats({ students: s, emails: e, whatsapp: w, sms: m });
      return;
    }

    // New week → apply growth once
    if (storedWeek !== currentWeek) {
      s += Math.max(15, randBetween(20, 60));
      e += Math.max(60, randBetween(80, 200));
      w += Math.max(150, randBetween(200, 500));
      m += Math.max(60, randBetween(80, 180));

      localStorage.setItem("tsm_v2_students", s.toString());
      localStorage.setItem("tsm_v2_emails", e.toString());
      localStorage.setItem("tsm_v2_whatsapp", w.toString());
      localStorage.setItem("tsm_v2_sms", m.toString());
      localStorage.setItem("tsm_v2_week", currentWeek);
    }

    setStats({ students: s, emails: e, whatsapp: w, sms: m });
  }, []);

  return stats;
}

/* -----------------------------------------------------
   ROTATING STATS COMPONENT
----------------------------------------------------- */
const ANIM_MS = 400;
const STAT_DURATIONS = [2500, 2500, 2500, 2500, 2500, 5000];

interface StatItem {
  value: string | null;
  label: string;
}

function RotatingStats({ stats }: { stats: typeof BASE }) {
  const statList: StatItem[] = [
    {
      value: stats.students.toLocaleString("en-IN") + "+",
      label: "Students Managed",
    },
    {
      value: stats.emails.toLocaleString("en-IN") + "+",
      label: "Emails Delivered",
    },
    {
      value: stats.whatsapp.toLocaleString("en-IN") + "+",
      label: "WhatsApp Notifications Sent",
    },
    {
      value: stats.sms.toLocaleString("en-IN") + "+",
      label: "SMS Notifications Sent",
    },
    { value: null, label: "Present in 5+ Cities" },
    { value: null, label: "Growing Every Month" },
  ];

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">(
    "entering",
  );

  useEffect(() => {
    if (phase === "entering") {
      const t = setTimeout(() => setPhase("visible"), ANIM_MS);
      return () => clearTimeout(t);
    }
    if (phase === "visible") {
      const visibleMs = Math.max(100, STAT_DURATIONS[index] - ANIM_MS * 2);
      const t = setTimeout(() => setPhase("exiting"), visibleMs);
      return () => clearTimeout(t);
    }
    if (phase === "exiting") {
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % statList.length);
        setPhase("entering");
      }, ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [phase, index]);

  const current = statList[index];

  const animClass =
    phase === "entering"
      ? "stat-entering"
      : phase === "exiting"
        ? "stat-exiting"
        : "stat-visible";

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400/90">
        Platform Usage Across All Institutes
      </p>

      <div className={`stat-container ${animClass}`}>
        {current.value !== null ? (
          <>
            <p className="text-[58px] font-extrabold leading-none tracking-tight text-blue-600">
              {current.value}
            </p>
            <p className="text-[17px] font-medium text-gray-500 mt-3 leading-snug">
              {current.label}
            </p>
          </>
        ) : (
          <p className="text-[36px] font-bold text-gray-700 leading-snug">
            {current.label}
          </p>
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   MAIN PAGE
----------------------------------------------------- */
export default function LoginPage({ onLogin }: any) {
  const stats = useOrganicStats();
  const search = useSearch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("reason") === "session_expired") {
      setSessionExpired(true);
      // Clean the param from the URL without triggering a navigation
      window.history.replaceState({}, "", "/");
    }
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await onLogin(username, password);
    } catch (err: any) {
      const msg = err.message || "Login failed";
      setError(msg);
      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950" />

      {/* BLOBS */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute top-10 left-20 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-indigo-400/40 rounded-full blur-3xl animate-float-slower" />
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        .animate-float        { animation: float 4s ease-in-out infinite; }
        .animate-float-slow   { animation: float 6s ease-in-out infinite; }
        .animate-float-slower { animation: float 9s ease-in-out infinite; }

        @keyframes shimmer {
          0%   { opacity: 0.3; }
          50%  { opacity: 1; }
          100% { opacity: 0.3; }
        }
        .animate-shimmer { animation: shimmer 2.4s ease-in-out infinite; }

        @keyframes stat-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stat-exit {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-8px); }
        }
        .stat-entering { animation: stat-enter ${ANIM_MS}ms ease-out forwards; }
        .stat-visible  { opacity: 1; transform: translateY(0); }
        .stat-exiting  { animation: stat-exit ${ANIM_MS}ms ease-in forwards; }
        .stat-container { min-height: 100px; }
      `}</style>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-20">
        {/* LEFT — ROTATING STATS */}
        <div className="hidden md:flex flex-col justify-center w-[45%] pl-6 animate-in fade-in duration-700">
          <RotatingStats stats={stats} />
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
                {sessionExpired && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                      Your session has expired. Please log in again.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSessionExpired(false)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pr-10"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex={-1}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
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

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  <Link
                    href="/privacy-policy"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    data-testid="link-privacy-policy"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-xs text-gray-400">•</span>
                  <Link
                    href="/terms-conditions"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    data-testid="link-terms-conditions"
                  >
                    Terms & Conditions
                  </Link>
                  <span className="text-xs text-gray-400">•</span>
                  <Link
                    href="/refund-policy"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    data-testid="link-refund-policy"
                  >
                    Refund Policy
                  </Link>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  © 2026 Tuition Management System. All rights reserved.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
