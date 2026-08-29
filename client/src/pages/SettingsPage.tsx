import { useEffect, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock3,
  CreditCard,
  DatabaseBackup,
  FileText,
  LockKeyhole,
  Settings as SettingsIcon,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ChangeCredentialsDialog from "@/components/ChangeCredentialsDialog";
import HelpSupportSection from "@/components/HelpSupportSection";
import {
  authApi,
  dailyBackupApi,
  statsApi,
  type DailyBackupStatus,
  type TeacherStats,
  type User,
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

type SettingsSectionKey =
  | "institute"
  | "account"
  | "documents"
  | "subscription"
  | "help";

interface SettingsPageProps {
  section?: string;
}

interface SettingsSectionDefinition {
  key: SettingsSectionKey;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

const settingsSections: SettingsSectionDefinition[] = [
  {
    key: "institute",
    title: "Institute",
    description: "View the institute information connected to your account.",
    icon: Building2,
    badge: "Read-only",
  },
  {
    key: "account",
    title: "Account",
    description: "Manage your login details and account security.",
    icon: UserRound,
    badge: "Available",
  },
  {
    key: "documents",
    title: "Certificates & Documents",
    description: "Keep certificates, templates, and institute documents organized.",
    icon: FileText,
    badge: "Coming soon",
  },
  {
    key: "subscription",
    title: "Subscription & Billing",
    description: "Review your plan and optional TMS features in one place.",
    icon: CreditCard,
    badge: "Available",
  },
  {
    key: "help",
    title: "Help & Support",
    description: "Find answers and get help when you need it.",
    icon: CircleHelp,
    badge: "Available",
  },
];

function SettingsShell({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 flex flex-col">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto w-full px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-3 text-muted-foreground hover:text-foreground"
            data-testid="button-settings-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto w-full px-6 lg:px-8 py-8 md:py-10 flex-1">
        {children}
      </main>

      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-4">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © 2026 Tuition Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SettingsPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100/80 bg-white/75 px-5 py-5 shadow-sm dark:border-blue-900/50 dark:bg-gray-900/55 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl dark:bg-blue-900/20" />
      <div className="relative flex items-start gap-4 sm:gap-5">
        <div className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md ring-4 ring-blue-50 dark:ring-blue-950/40">
          <SettingsIcon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase leading-4 tracking-[0.16em] text-primary">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {eyebrow}
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsHome({ onOpenSection }: { onOpenSection: (key: SettingsSectionKey) => void }) {
  return (
    <>
      <div className="mb-8">
        <SettingsPageHeader
          eyebrow="Workspace preferences"
          title="Settings"
          description="Manage your account and find the tools that help you run your institute."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.key}
              className="group overflow-hidden border-border/70 bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => onOpenSection(section.key)}
                className="w-full text-left p-5 sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                data-testid={`settings-card-${section.key}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-base text-foreground">
                        {section.title}
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-muted-foreground/60 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                {section.badge && (
                  <Badge
                    variant="outline"
                    className="mt-5 text-[11px] font-medium text-muted-foreground"
                  >
                    {section.badge}
                  </Badge>
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function DetailHeader({
  section,
  onBack,
}: {
  section: SettingsSectionDefinition;
  onBack: () => void;
}) {
  return (
    <div className="mb-7">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="-ml-3 mb-5 text-muted-foreground hover:text-foreground"
        data-testid="button-settings-section-back"
      >
        <ArrowLeft className="h-4 w-4" />
        All Settings
      </Button>
      <SettingsPageHeader
        eyebrow="Settings"
        title={section.title}
        description={section.description}
      />
    </div>
  );
}

function formatCreatedDate(value?: string | null) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function InformationGrid({
  details,
  columns = "sm:grid-cols-3",
}: {
  details: Array<{ label: string; value?: string | null }>;
  columns?: string;
}) {
  const availableDetails = details.filter(
    (detail): detail is { label: string; value: string } =>
      Boolean(detail.value?.trim()),
  );

  if (availableDetails.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 ${columns} gap-4`}>
      {availableDetails.map((detail) => (
        <div
          key={detail.label}
          className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3.5"
        >
          <p className="text-xs font-medium text-muted-foreground">{detail.label}</p>
          <p className="mt-1.5 text-sm font-medium text-foreground break-words">
            {detail.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function AccountStatusCard({ isActive }: { isActive: boolean }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isActive
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              : "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-foreground">Account status</h2>
            <Badge
              variant="outline"
              className={
                isActive
                  ? "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400"
                  : "border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-400"
              }
            >
              {isActive ? "Active" : "Suspended"}
            </Badge>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Your teacher account is currently {isActive ? "active" : "suspended"}.
          </p>
        </div>
      </div>
    </Card>
  );
}

function InstituteSection({ user }: { user?: User }) {
  const details = [
    { label: "Institute name", value: user?.instituteName },
    { label: "Institute email", value: user?.email },
    { label: "Phone number", value: user?.phone },
    {
      label: "Account status",
      value: user ? (user.isActive ? "Active" : "Suspended") : undefined,
    },
    { label: "Joined date", value: formatCreatedDate(user?.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-6">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-foreground">Institute information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This information is connected to your teacher account.
            </p>
          </div>
        </div>
        <InformationGrid details={details} />
      </Card>
      <Card className="p-5 sm:p-6 border-blue-200/70 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <LockKeyhole className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-foreground">Managed by your administrator</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Institute information is managed by your administrator. Contact them if any
              of these details need to be updated.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AccountSection({
  user,
  onChangeCredentials,
}: {
  user?: User;
  onChangeCredentials: () => void;
}) {
  const profileDetails = [
    { label: "Full name", value: user?.fullName },
    { label: "Username", value: user?.username },
    { label: "Role", value: user?.role === "teacher" ? "Teacher" : user?.role },
    { label: "Email", value: user?.email },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold text-foreground">Profile information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Information connected to your teacher account.
          </p>
        </div>
        <InformationGrid details={profileDetails} columns="sm:grid-cols-2" />
      </Card>
      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold text-foreground">Login &amp; security</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the username or password you use to sign in.
          </p>
        </div>
        <div className="divide-y divide-border rounded-lg border border-border/70">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Change username</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the username used to sign in.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onChangeCredentials}
              data-testid="button-change-username"
            >
              Change username
            </Button>
          </div>
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Change password</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your account secure with a strong password.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onChangeCredentials}
              data-testid="button-change-password"
            >
              Change password
            </Button>
          </div>
        </div>
      </Card>
      {user && <AccountStatusCard isActive={user.isActive} />}
    </div>
  );
}

interface TeacherBackupInfo {
  enabled: boolean;
  lastBackup: DailyBackupStatus | null;
}

function formatBackupDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available yet";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })
    .format(date)
    .replace(/\b(am|pm)\b/gi, (period) => period.toUpperCase());
}

function formatSubscriptionDate(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getNextBackupAt(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const getPart = (type: "year" | "month" | "day") =>
    Number(parts.find((part) => part.type === type)?.value);
  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  const scheduledAt = new Date(Date.UTC(year, month - 1, day, 17, 30));
  if (scheduledAt.getTime() <= now.getTime()) {
    scheduledAt.setUTCDate(scheduledAt.getUTCDate() + 1);
  }

  return scheduledAt;
}

function AddOnStatus({
  name,
  enabled,
}: {
  name: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="text-sm font-medium text-foreground">{name}</span>
      <Badge
        variant="outline"
        className={
          enabled
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
            : "border-border bg-muted/40 text-muted-foreground"
        }
      >
        {enabled ? "Active" : "Not Active"}
      </Badge>
    </div>
  );
}

function SubscriptionSection({
  user,
  stats,
  backupInfo,
}: {
  user?: User;
  stats?: TeacherStats;
  backupInfo?: TeacherBackupInfo;
}) {
  const hasUser = Boolean(user);
  const studentLimit = user?.studentLimit;
  const formattedStudentLimit = !hasUser
    ? "Not available"
    : studentLimit == null
      ? "Unlimited"
      : studentLimit.toLocaleString("en-IN");
  const formattedUsage =
    stats?.studentCount == null
      ? "Not available"
      : stats.studentCount.toLocaleString("en-IN");
  const formattedBuffer = !hasUser
    ? "Not available"
    : user?.studentBuffer == null
      ? "Not set"
      : user.studentBuffer.toLocaleString("en-IN");
  const formattedTotalAllowed = !hasUser
    ? "Not available"
    : studentLimit == null
      ? "Unlimited"
      : (studentLimit + (user?.studentBuffer ?? 0)).toLocaleString("en-IN");
  const formattedSubscriptionEndDate = !hasUser
    ? "Not available"
    : formatSubscriptionDate(user?.subscriptionEndDate);
  const backupEnabled = backupInfo?.enabled ?? user?.dailyBackupEnabled ?? false;
  const lastBackupAt =
    backupInfo?.lastBackup?.emailSentAt ?? backupInfo?.lastBackup?.generatedAt;

  const subscriptionDetails = [
    { label: "Billing cycle", value: "Yearly" },
    { label: "Student Allowed", value: formattedStudentLimit },
    { label: "Current Usage", value: formattedUsage },
    { label: "Buffer", value: formattedBuffer },
    { label: "Total Allowed", value: formattedTotalAllowed },
    { label: "Subscription End Date", value: formattedSubscriptionEndDate },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Subscription overview</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your yearly plan and current student allowance.
            </p>
          </div>
        </div>
        <InformationGrid
          details={subscriptionDetails}
          columns="sm:grid-cols-2 lg:grid-cols-3"
        />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Subscription allowances and dates are managed by your administrator.
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-foreground">Add-ons</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Features enabled for your institute by the administrator.
          </p>
        </div>
        <div className="divide-y divide-border rounded-lg border border-border/70">
          <AddOnStatus name="SMS Notifications" enabled={user?.whatsappEnabled ?? false} />
          <AddOnStatus name="WhatsApp Business" enabled={user?.waBusinessEnabled ?? false} />
          <AddOnStatus
            name="Fee Collection Assistance"
            enabled={user?.feeCollectionEnabled ?? false}
          />
        </div>
      </Card>

      <Card
        className={
          backupEnabled
            ? "border-emerald-200/80 bg-emerald-50/45 p-5 dark:border-emerald-900/70 dark:bg-emerald-950/15 sm:p-6"
            : "p-5 sm:p-6"
        }
        data-testid="subscription-daily-backup"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              backupEnabled
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <DatabaseBackup className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-foreground">Daily TMS Backup</h2>
              <Badge
                variant="outline"
                className={
                  backupEnabled
                    ? "border-emerald-200 bg-white/70 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "text-muted-foreground"
                }
              >
                {backupEnabled ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                  </span>
                ) : (
                  "Not Active"
                )}
              </Badge>
            </div>

            {backupEnabled ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your TMS data is automatically backed up daily.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-emerald-200/70 bg-white/70 px-4 py-3 dark:border-emerald-900/60 dark:bg-gray-900/40">
                    <p className="text-xs font-medium text-muted-foreground">Backup Time</p>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                      11:00 PM IST
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-200/70 bg-white/70 px-4 py-3 dark:border-emerald-900/60 dark:bg-gray-900/40">
                    <p className="text-xs font-medium text-muted-foreground">Last Backup</p>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                      {lastBackupAt
                        ? formatBackupDateTime(lastBackupAt)
                        : "Not available yet"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-200/70 bg-white/70 px-4 py-3 dark:border-emerald-900/60 dark:bg-gray-900/40">
                    <p className="text-xs font-medium text-muted-foreground">Next Backup</p>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                      {formatBackupDateTime(getNextBackupAt())}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Daily TMS Backup is not active for your institute.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ComingSoonSection({ section }: { section: SettingsSectionDefinition }) {
  return (
    <Card className="p-8 sm:p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Clock3 className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">
        This section is coming soon
      </h2>
      <p className="mt-2 mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
        We’re preparing a simple way to manage {section.title.toLowerCase()}. This area
        will become available in a future update.
      </p>
      <Badge variant="outline" className="mt-5 text-[11px] font-medium">
        Coming soon
      </Badge>
    </Card>
  );
}

export default function SettingsPage({ section }: SettingsPageProps) {
  const [, setLocation] = useLocation();
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const selectedSection = settingsSections.find((item) => item.key === section);
  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.me,
    retry: false,
  });
  const { data: teacherStats } = useQuery({
    queryKey: ["/api/stats/teacher"],
    queryFn: statsApi.teacher,
    enabled: selectedSection?.key === "subscription",
    retry: false,
  });
  const { data: backupInfo } = useQuery({
    queryKey: ["/api/profile/daily-backup"],
    queryFn: dailyBackupApi.getStatus,
    enabled: selectedSection?.key === "subscription",
    retry: false,
  });
  const user = userData?.user;

  useEffect(() => {
    if (section && !selectedSection) {
      setLocation("/settings");
    }
  }, [section, selectedSection, setLocation]);

  const openSection = (key: SettingsSectionKey) => {
    setLocation(`/settings/${key}`);
  };

  return (
    <SettingsShell onBack={() => setLocation("/")}>
      {!selectedSection ? (
        <SettingsHome onOpenSection={openSection} />
      ) : (
        <>
          <DetailHeader
            section={selectedSection}
            onBack={() => setLocation("/settings")}
          />
          {selectedSection.key === "institute" && <InstituteSection user={user} />}
          {selectedSection.key === "account" && (
            <AccountSection
              user={user}
              onChangeCredentials={() => setCredentialsDialogOpen(true)}
            />
          )}
          {selectedSection.key === "subscription" && (
            <SubscriptionSection
              user={user}
              stats={teacherStats}
              backupInfo={backupInfo}
            />
          )}
          {selectedSection.key !== "institute" &&
            selectedSection.key !== "account" &&
            selectedSection.key !== "subscription" &&
            selectedSection.key !== "help" && (
              <ComingSoonSection section={selectedSection} />
            )}
          {selectedSection.key === "help" && <HelpSupportSection />}
        </>
      )}

      <ChangeCredentialsDialog
        open={credentialsDialogOpen}
        onOpenChange={setCredentialsDialogOpen}
        currentUsername={user?.username || ""}
        onSuccess={() => {
          queryClient.setQueryData(["/api/auth/me"], null);
          queryClient.clear();
          setLocation("/");
        }}
      />
    </SettingsShell>
  );
}