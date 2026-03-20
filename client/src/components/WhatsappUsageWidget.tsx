import { useQuery } from "@tanstack/react-query";
import { MessageSquare, AlertTriangle, Zap, Mail, MessagesSquare } from "lucide-react";
import { smsApi, waBusinessApi } from "@/lib/api";

interface UsageInfo {
  enabled: boolean;
  used: number;
  limit: number;
  remaining: number;
  warningThreshold: boolean;
  resetDate: string;
}

interface Props {
  smsUsage?: UsageInfo | null;
  waUsage?: UsageInfo | null;
  isLoading?: boolean;
}

function UsageBar({ usage, label, color }: { usage: UsageInfo; label: string; color: string }) {
  const usagePercent = Math.round((usage.used / usage.limit) * 100);
  const isExhausted = usage.remaining === 0;
  const isNearFull = usagePercent >= 95;
  const barColor = isExhausted || isNearFull ? "bg-destructive" : usage.warningThreshold ? "bg-orange-500" : color;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">
          <span className="font-medium">{usage.used}</span>/{usage.limit}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted/80 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${Math.max(Math.min(usagePercent, 100), 2)}%` }}
        />
      </div>
    </div>
  );
}

export default function WhatsappUsageWidget({ smsUsage: propSms, waUsage: propWa, isLoading: propLoading }: Props = {}) {
  const { data: querySms, isLoading: smsLoading } = useQuery({
    queryKey: ["/api/whatsapp/usage"],
    queryFn: () => smsApi.getUsage(),
    enabled: propSms === undefined,
  });

  const { data: queryWa, isLoading: waLoading } = useQuery({
    queryKey: ["/api/wa-business/usage"],
    queryFn: () => waBusinessApi.getUsage(),
    enabled: propWa === undefined,
  });

  const smsUsage = propSms !== undefined ? propSms : querySms;
  const waUsage = propWa !== undefined ? propWa : queryWa;
  const isLoading = propLoading !== undefined ? propLoading : (smsLoading || waLoading);

  const smsActive = !!smsUsage?.enabled;
  const waActive = !!waUsage?.enabled;
  const bothActive = smsActive && waActive;
  const noneActive = !smsActive && !waActive;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-5 bg-muted rounded w-10" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-2 bg-muted rounded-full w-full" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (noneActive) {
    return (
      <div className="space-y-3" data-testid="messaging-upsell-widget">
        <Zap className="w-5 h-5 text-muted-foreground/50" />
        <p className="text-sm font-semibold text-muted-foreground">Enable Notifications</p>
        <p className="text-xs text-muted-foreground/70">
          Activate SMS or WhatsApp to notify students automatically.
        </p>
      </div>
    );
  }

  if (bothActive) {
    const totalLimit = (smsUsage?.limit ?? 0) + (waUsage?.limit ?? 0);
    const totalUsed = (smsUsage?.used ?? 0) + (waUsage?.used ?? 0);
    const totalRemaining = (smsUsage?.remaining ?? 0) + (waUsage?.remaining ?? 0);
    const isLow = totalRemaining < totalLimit * 0.2;
    const isExhausted = totalRemaining === 0;
    const resetDate = smsUsage?.resetDate ?? waUsage?.resetDate;

    return (
      <div className="space-y-4" data-testid="messaging-center-widget">
        <div className="flex items-start gap-2.5">
          <MessagesSquare className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isExhausted ? "text-destructive" : isLow ? "text-orange-500" : "text-emerald-500"}`} />
          <div>
            <p className="text-sm font-semibold leading-tight">Messaging Center</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground">
              {totalUsed} / {totalLimit} used
            </span>
            <span className="text-[10px] text-muted-foreground">{totalRemaining} left</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {smsUsage && <UsageBar usage={smsUsage} label="SMS" color="bg-blue-500" />}
          {waUsage && <UsageBar usage={waUsage} label="WhatsApp" color="bg-emerald-500" />}
        </div>

        {isLow && !isExhausted && (
          <div className="flex items-start gap-1.5 text-xs text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Only {totalRemaining} messages left this month.</span>
          </div>
        )}
        {isExhausted && (
          <div className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Limit reached. Resets {resetDate}.</span>
          </div>
        )}
        {resetDate && !isExhausted && (
          <p className="text-[11px] text-muted-foreground">Resets on {resetDate}</p>
        )}
      </div>
    );
  }

  const usage = smsActive ? smsUsage! : waUsage!;
  const usagePercent = Math.round((usage.used / usage.limit) * 100);
  const isLow = usage.warningThreshold;
  const isExhausted = usage.remaining === 0;
  const isNearFull = usagePercent >= 95;

  const barColor = isExhausted || isNearFull ? "bg-destructive" : isLow ? "bg-orange-500" : "bg-emerald-500";
  const iconColor = isExhausted ? "text-destructive" : isLow ? "text-orange-500" : "text-emerald-500";
  const Icon = smsActive ? Mail : MessageSquare;
  const title = smsActive ? "SMS Notifications" : "WhatsApp Notifications";

  return (
    <div className="space-y-4" data-testid="messaging-usage-widget">
      <div className="flex items-start gap-2.5">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          <p className="text-sm font-semibold leading-tight">{title}</p>
        </div>
      </div>

      <div>
        <div className="w-full h-2 rounded-full bg-muted/80 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${Math.max(Math.min(usagePercent, 100), 2)}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-1 mt-1.5">
          <span className="text-[11px] text-muted-foreground">
            <span className="font-medium">{usage.used}</span> used
          </span>
          <span className="text-[11px] text-muted-foreground">
            <span className="font-medium">{usage.remaining}</span> left
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {usage.limit.toLocaleString()} messages / month
        </p>
      </div>

      {usage.resetDate && !isExhausted && (
        <p className="text-[11px] text-muted-foreground">Resets on {usage.resetDate}</p>
      )}

      {isLow && !isExhausted && (
        <div className="flex items-start gap-1.5 text-xs text-orange-600 dark:text-orange-400">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Only {usage.remaining} messages left this month.</span>
        </div>
      )}
      {isExhausted && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Limit reached. Resumes {usage.resetDate}.</span>
        </div>
      )}
    </div>
  );
}
