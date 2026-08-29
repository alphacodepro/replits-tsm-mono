import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, DatabaseBackup } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  dailyBackupApi,
  feeCollectionApi,
  teacherApi,
  waBusinessApi,
  whatsappApi,
  type DailyBackupStatus,
  type User,
} from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface TeacherSubscriptionCardProps {
  teacher: User;
  studentCount?: number;
  lastBackup: DailyBackupStatus | null;
}

type SubscriptionFeature = "sms" | "whatsapp" | "feeCollection" | "backup";

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

function formatBackupDate(value?: string | null) {
  if (!value) return "Not run yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not run yet";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
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
  const scheduledAt = new Date(
    Date.UTC(getPart("year"), getPart("month") - 1, getPart("day"), 17, 30),
  );
  if (scheduledAt.getTime() <= now.getTime()) {
    scheduledAt.setUTCDate(scheduledAt.getUTCDate() + 1);
  }
  return scheduledAt;
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      }
    >
      {enabled ? "Active" : "Not Active"}
    </Badge>
  );
}

export default function TeacherSubscriptionCard({
  teacher,
  studentCount,
  lastBackup,
}: TeacherSubscriptionCardProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [bufferInput, setBufferInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const refreshTeacher = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/teachers", teacher.id] });
    queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const updateSubscriptionMutation = useMutation({
    mutationFn: (data: {
      studentBuffer: number | null;
      subscriptionEndDate: string | null;
    }) => teacherApi.updateSubscription(teacher.id, data),
    onSuccess: () => {
      refreshTeacher();
      setEditing(false);
      setFormError(null);
      toast({ title: "Subscription details updated." });
    },
    onError: (error: Error) => {
      setFormError(error.message);
      toast({
        title: "Failed to update subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: ({
      feature,
      enabled,
    }: {
      feature: SubscriptionFeature;
      enabled: boolean;
    }) => {
      if (feature === "sms") {
        return whatsappApi.toggleEnabled(teacher.id, enabled);
      }
      if (feature === "whatsapp") {
        return waBusinessApi.toggleEnabled(teacher.id, enabled);
      }
      if (feature === "feeCollection") {
        return feeCollectionApi.toggleEnabled(teacher.id, enabled);
      }
      return dailyBackupApi.toggleEnabled(teacher.id, enabled);
    },
    onSuccess: (_response, variables) => {
      refreshTeacher();
      toast({
        title: `${variables.enabled ? "Enabled" : "Disabled"} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not update feature",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const runBackupMutation = useMutation({
    mutationFn: () => dailyBackupApi.runNow(teacher.id),
    onSuccess: (response) => {
      toast({
        title: response.result === "started" ? "Backup started" : "Daily backup",
        description: response.message,
      });
      window.setTimeout(refreshTeacher, 2500);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not start backup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startEditing = () => {
    setBufferInput(teacher.studentBuffer?.toString() ?? "");
    setEndDateInput(teacher.subscriptionEndDate ?? "");
    setFormError(null);
    setEditing(true);
  };

  const saveSubscription = () => {
    const trimmedBuffer = bufferInput.trim();
    const buffer = trimmedBuffer === "" ? null : Number(trimmedBuffer);
    if (
      buffer !== null &&
      (!Number.isInteger(buffer) || buffer < 0 || buffer > 2_147_483_647)
    ) {
      setFormError(
        "Buffer must be a whole number between 0 and 2,147,483,647.",
      );
      return;
    }

    const endDate = endDateInput.trim() || null;
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      setFormError("Enter a valid subscription end date.");
      return;
    }

    setFormError(null);
    updateSubscriptionMutation.mutate({
      studentBuffer: buffer,
      subscriptionEndDate: endDate,
    });
  };

  const baseLimit = teacher.studentLimit;
  const effectiveBuffer = teacher.studentBuffer ?? 0;
  const totalAllowed =
    baseLimit == null
      ? "Unlimited"
      : (baseLimit + effectiveBuffer).toLocaleString("en-IN");
  const latestBackupAt = lastBackup?.emailSentAt ?? lastBackup?.generatedAt;
  const features: Array<{
    feature: SubscriptionFeature;
    label: string;
    enabled: boolean;
  }> = [
    { feature: "sms", label: "SMS Notifications", enabled: teacher.whatsappEnabled },
    {
      feature: "whatsapp",
      label: "WhatsApp Business",
      enabled: teacher.waBusinessEnabled,
    },
    {
      feature: "feeCollection",
      label: "Fee Collection Assistance",
      enabled: teacher.feeCollectionEnabled ?? false,
    },
  ];

  return (
    <Card className="p-4" data-testid="card-teacher-subscription">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4" />
            Subscription
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Yearly plan allowance and optional features.
          </p>
        </div>
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={startEditing}
            data-testid="button-edit-subscription"
          >
            Edit Subscription
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="subscription-buffer">Student Buffer</Label>
              <Input
                id="subscription-buffer"
                type="number"
                min="0"
                max="2147483647"
                step="1"
                value={bufferInput}
                onChange={(event) => setBufferInput(event.target.value)}
                placeholder="Blank = Not set"
                data-testid="input-subscription-buffer"
              />
              <p className="text-xs text-muted-foreground">
                Added to the existing Student Allowed limit.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subscription-end-date">
                Subscription End Date
              </Label>
              <Input
                id="subscription-end-date"
                type="date"
                value={endDateInput}
                onChange={(event) => setEndDateInput(event.target.value)}
                data-testid="input-subscription-end-date"
              />
              <p className="text-xs text-muted-foreground">
                Blank keeps the subscription date Not set.
              </p>
            </div>
          </div>
          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={saveSubscription}
              disabled={updateSubscriptionMutation.isPending}
              data-testid="button-save-subscription"
            >
              {updateSubscriptionMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setFormError(null);
              }}
              disabled={updateSubscriptionMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Billing cycle</div>
            <div className="mt-1 font-medium">Yearly</div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Student Allowed</div>
            <div className="mt-1 font-medium">
              {baseLimit == null ? "Unlimited" : baseLimit.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Current Usage</div>
            <div className="mt-1 font-medium">
              {studentCount == null
                ? "Not available"
                : studentCount.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Buffer</div>
            <div className="mt-1 font-medium">
              {teacher.studentBuffer == null
                ? "Not set"
                : teacher.studentBuffer.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Total Allowed</div>
            <div className="mt-1 font-medium">{totalAllowed}</div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">
              Subscription End Date
            </div>
            <div className="mt-1 font-medium">
              {formatSubscriptionDate(teacher.subscriptionEndDate)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 border-t pt-4">
        <h4 className="mb-2 text-sm font-semibold">Add-ons</h4>
        <div className="divide-y rounded-lg border">
          {features.map((item) => (
            <div
              key={item.feature}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.label}</span>
                <StatusBadge enabled={item.enabled} />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggleFeatureMutation.mutate({
                    feature: item.feature,
                    enabled: !item.enabled,
                  })
                }
                disabled={toggleFeatureMutation.isPending}
              >
                {item.enabled ? "Disable" : "Enable"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <DatabaseBackup className="h-4 w-4" />
              <h4 className="text-sm font-semibold">Daily TMS Backup</h4>
              <StatusBadge enabled={teacher.dailyBackupEnabled} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Scheduled daily at 11:00 PM IST.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toggleFeatureMutation.mutate({
                  feature: "backup",
                  enabled: !teacher.dailyBackupEnabled,
                })
              }
              disabled={toggleFeatureMutation.isPending}
            >
              {teacher.dailyBackupEnabled ? "Disable" : "Enable"}
            </Button>
            {teacher.dailyBackupEnabled && (
              <Button
                size="sm"
                onClick={() => runBackupMutation.mutate()}
                disabled={runBackupMutation.isPending}
              >
                {runBackupMutation.isPending ? "Starting..." : "Backup Now"}
              </Button>
            )}
          </div>
        </div>

        {teacher.dailyBackupEnabled && (
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="text-muted-foreground">Last Backup</div>
              <div className="mt-1 flex items-center gap-1.5 font-medium">
                {lastBackup?.status === "sent" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
                {formatBackupDate(latestBackupAt)}
              </div>
            </div>
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="text-muted-foreground">Next Backup</div>
              <div className="mt-1 font-medium">
                {formatBackupDate(getNextBackupAt().toISOString())}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}