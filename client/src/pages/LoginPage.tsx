import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, AlertCircle, Loader2, Eye, EyeOff, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch } from "wouter";

function DashboardIllustration() {
  return (
    <svg
      viewBox="0 0 520 330"
      role="img"
      aria-label="Illustration of a laptop showing a tuition management dashboard"
      className="w-full max-w-[520px] h-auto text-blue-600 animate-float-slow"
    >
      <defs>
        <linearGradient id="laptop-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef4ff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="laptop-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe6ff" />
        </linearGradient>
        <linearGradient id="screen-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f7df3" />
          <stop offset="1" stopColor="#6656e8" />
        </linearGradient>
        <linearGradient id="metric-positive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dff8ee" />
          <stop offset="1" stopColor="#b8ebda" />
        </linearGradient>
        <filter id="illustration-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#7284c8" floodOpacity="0.18" />
        </filter>
      </defs>

      <ellipse cx="263" cy="300" rx="180" ry="15" fill="#cbd6f4" opacity="0.35" />

      <g
        filter="url(#illustration-shadow)"
        transform="rotate(-3.5 260 165) skewX(-2)"
      >
        <path
          d="M136 53c0-10 8-18 18-18h226c10 0 18 8 18 18v153H136V53Z"
          fill="url(#laptop-screen)"
          stroke="#c8d5f3"
          strokeWidth="3"
        />
        <path d="M151 54h232v137H151z" fill="white" />
        <rect x="151" y="54" width="232" height="27" fill="#f7f9ff" />
        <circle cx="164" cy="67.5" r="3" fill="#d7def4" />
        <circle cx="174" cy="67.5" r="3" fill="#d7def4" />
        <circle cx="184" cy="67.5" r="3" fill="#d7def4" />

        <rect x="163" y="92" width="40" height="87" rx="3" fill="url(#screen-accent)" />
        <rect x="171" y="101" width="22" height="5" rx="2.5" fill="white" opacity="0.9" />
        <rect x="171" y="116" width="17" height="4" rx="2" fill="white" opacity="0.45" />
        <rect x="171" y="127" width="23" height="4" rx="2" fill="white" opacity="0.45" />
        <rect x="171" y="138" width="19" height="4" rx="2" fill="white" opacity="0.45" />
        <rect x="171" y="158" width="23" height="4" rx="2" fill="white" opacity="0.45" />

        <rect x="216" y="93" width="72" height="34" rx="5" fill="#f5f7ff" stroke="#e6ebfb" />
        <rect x="225" y="102" width="25" height="5" rx="2.5" fill="#1d2f70" opacity="0.7" />
        <rect x="225" y="113" width="42" height="5" rx="2.5" fill="#a8b7dc" />
        <rect x="296" y="93" width="72" height="34" rx="5" fill="#f5f7ff" stroke="#e6ebfb" />
        <rect x="305" y="102" width="27" height="5" rx="2.5" fill="#1d2f70" opacity="0.7" />
        <rect x="305" y="113" width="37" height="5" rx="2.5" fill="#a8b7dc" />

        <rect x="216" y="139" width="152" height="40" rx="5" fill="#f5f7ff" stroke="#e6ebfb" />
        <path d="M229 166v-11M243 166v-18M257 166v-8M271 166v-24M285 166v-14" stroke="#6a6be9" strokeWidth="6" strokeLinecap="round" />
        <circle cx="356" cy="101" r="4" fill="#7d8ef1" opacity="0.7" />
        <path d="M310 165c0-13 10-23 23-23s23 10 23 23h-23Z" fill="url(#metric-positive)" />
        <path d="M333 142v23h23" fill="none" stroke="#4f7df3" strokeWidth="3" />
        <path d="M308 151c11-3 19-7 27-13 7 5 12 9 20 11" fill="none" stroke="#9ba8f6" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

        <path d="M92 208h350l35 20H57l35-20Z" fill="url(#laptop-base)" stroke="#c1cff0" strokeWidth="3" />
        <path d="M57 228h420l-27 12H84l-27-12Z" fill="#d1dcf5" stroke="#b9c8ec" strokeWidth="2" />
        <rect x="231" y="216" width="70" height="5" rx="2.5" fill="#b8c7ea" />
      </g>

      <g opacity="0.9">
        <rect x="64" y="207" width="49" height="11" rx="2" fill="#9aa9f4" transform="rotate(-5 64 207)" />
        <rect x="70" y="196" width="47" height="11" rx="2" fill="#b8c3ff" transform="rotate(-5 70 196)" />
        <rect x="78" y="185" width="42" height="11" rx="2" fill="#d1d8ff" transform="rotate(-5 78 185)" />
      </g>

      <g transform="translate(100 117)" opacity="0.95">
        <rect width="78" height="30" rx="15" fill="white" stroke="#e1e7fb" />
        <circle cx="17" cy="15" r="7" fill="#e4e8ff" />
        <path d="M13 15h8M17 11v8" stroke="#6576e8" strokeWidth="2" strokeLinecap="round" />
        <rect x="30" y="11" width="34" height="4" rx="2" fill="#6c7ce8" opacity="0.8" />
        <rect x="30" y="18" width="24" height="3" rx="1.5" fill="#bdc8e8" />
      </g>

      <g transform="translate(414 152)">
        <path d="M28 90c-2-22-3-42-2-65" fill="none" stroke="#9a8be2" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 52c-18-5-24-17-22-28 15 1 24 10 22 28Z" fill="#a99bea" />
        <path d="M27 68c17-8 25-20 23-31-14 2-23 14-23 31Z" fill="#8d81dc" />
        <path d="M26 37C12 29 8 17 12 8c13 4 18 15 14 29Z" fill="#c0b7f3" />
        <path d="M28 83c16-4 23-12 24-22-13-1-22 7-24 22Z" fill="#b0a4ec" />
        <ellipse cx="27" cy="92" rx="22" ry="9" fill="#9384de" />
        <path d="M8 90h39l-6 23H14L8 90Z" fill="#f2cdb7" stroke="#e3b49b" strokeWidth="2" />
      </g>
    </svg>
  );
}

function CornerDecorations() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 360 210"
        className="pointer-events-none absolute -right-10 -top-8 z-0 h-auto w-64 opacity-90 animate-corner-rhythm sm:-right-6 sm:-top-4 sm:w-80 lg:-right-2 lg:top-0 lg:w-[22rem]"
      >
        <path
          d="M137 0h223v172c-38-8-76-26-108-52-35-29-60-69-75-120L137 0Z"
          fill="#e9e7ff"
        />
        <path
          d="M225 0h135v116c-38-13-69-34-91-63-17-22-31-40-44-53Z"
          fill="#d7d3ff"
          opacity="0.72"
        />
        <path
          d="M302 0h58v65c-18-8-33-19-44-33-7-9-11-19-14-32Z"
          fill="#c8c4fb"
          opacity="0.76"
        />
        <path
          d="M94 0h266v12c-55 6-106-1-151-12H94Z"
          fill="#f4f3ff"
          opacity="0.95"
        />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 360 210"
        className="pointer-events-none absolute -bottom-10 -left-10 z-0 h-auto w-64 opacity-90 animate-corner-rhythm sm:-bottom-6 sm:-left-6 sm:w-80 lg:bottom-0 lg:left-0 lg:w-[22rem]"
      >
        <path
          d="M0 40c43 8 81 25 113 53 36 31 62 70 78 117H0V40Z"
          fill="#e9e7ff"
        />
        <path
          d="M0 96c31 8 58 21 80 40 25 21 43 46 54 74H0V96Z"
          fill="#d7d3ff"
          opacity="0.72"
        />
        <path
          d="M0 155c19 6 35 15 49 26 10 8 18 18 24 29H0v-55Z"
          fill="#c8c4fb"
          opacity="0.76"
        />
        <path
          d="M0 0h116C89 20 54 34 0 39V0Z"
          fill="#f4f3ff"
          opacity="0.95"
        />
      </svg>
    </>
  );
}

/* -----------------------------------------------------
   MAIN PAGE
----------------------------------------------------- */
export default function LoginPage({ onLogin }: any) {
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8fbff] via-white to-[#eef1ff] dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />

      {/* BLOBS */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute top-10 left-20 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-indigo-400/40 rounded-full blur-3xl animate-float-slower" />
      </div>

      <CornerDecorations />

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

        @keyframes cornerRhythm {
          0%, 100% {
            opacity: 0.62;
            transform: translateY(0);
            filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.08));
          }
          50% {
            opacity: 1;
            transform: translateY(-6px);
            filter: drop-shadow(0 0 22px rgba(99, 102, 241, 0.24));
          }
        }
        .animate-corner-rhythm {
          animation: cornerRhythm 4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%   { opacity: 0.3; }
          50%  { opacity: 1; }
          100% { opacity: 0.3; }
        }
        .animate-shimmer { animation: shimmer 2.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-slow,
          .animate-float-slower,
          .animate-shimmer,
          .animate-corner-rhythm {
            animation: none !important;
          }
        }

      `}</style>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-16">
        {/* LEFT — TMS BRANDING */}
        <div className="hidden md:flex flex-col justify-center w-[50%] pl-2 lg:pl-6 animate-in fade-in duration-700">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600/80">
            Welcome Back
          </p>
          <h1 className="mt-1 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950 dark:text-white lg:text-[3.5rem] xl:text-6xl">
            <span className="bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:via-blue-100 dark:to-indigo-200">
              Tuition
            </span>
            <br />
            <span className="text-slate-900 dark:text-slate-100 lg:whitespace-nowrap">
              Management System
            </span>
          </h1>
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 mt-6" />
          <p className="text-lg lg:text-xl font-medium text-slate-500 dark:text-gray-400 mt-6 max-w-md leading-relaxed">
            Smart, simple management for modern tuition institutes.
          </p>
          <div className="relative w-full max-w-[480px] mt-8 lg:mt-9">
            <div
              aria-hidden="true"
              className="absolute inset-x-12 bottom-3 h-16 rounded-full bg-blue-200/30 blur-3xl"
            />
            <DashboardIllustration />
          </div>
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
                <h2 className="text-2xl font-medium tracking-[-0.02em] text-gray-900 text-center">
                  Tuition Management System
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Sign in to access your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoComplete="username"
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
                      autoComplete="current-password"
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
