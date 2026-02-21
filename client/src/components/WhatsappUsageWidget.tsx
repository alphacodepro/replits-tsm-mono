import { useQuery } from "@tanstack/react-query";
import { MessageCircle, AlertTriangle } from "lucide-react";
import { whatsappApi } from "@/lib/api";

interface WhatsappUsage {
  enabled: boolean;
  used: number;
  limit: number;
  remaining: number;
  warningThreshold: boolean;
  resetDate: string;
}

interface Props {
  usage?: WhatsappUsage | null;
  isLoading?: boolean;
}

export default function WhatsappUsageWidget({ usage: propUsage, isLoading: propLoading }: Props = {}) {
  const { data: queryUsage, isLoading: queryLoading } = useQuery({
    queryKey: ["/api/whatsapp/usage"],
    queryFn: () => whatsappApi.getUsage(),
    enabled: propUsage === undefined,
  });

  const usage = propUsage !== undefined ? propUsage : queryUsage;
  const isLoading = propUsage !== undefined ? !!propLoading : queryLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-10"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded-full w-full"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!usage?.enabled) {
    return (
      <div className="space-y-3" data-testid="whatsapp-upsell-widget">
        <MessageCircle className="w-6 h-6 text-muted-foreground/50" />
        <p className="text-sm font-semibold text-muted-foreground">
          WhatsApp Add-on
        </p>
        <p className="text-xs text-muted-foreground/70">
          Activate to send registration and payment notifications to students.
        </p>
      </div>
    );
  }

  const usagePercent = Math.round((usage.used / usage.limit) * 100);
  const isLow = usage.warningThreshold;
  const isExhausted = usage.remaining === 0;
  const isNearFull = usagePercent >= 95;

  const barColor = isExhausted || isNearFull
    ? "bg-destructive"
    : isLow
      ? "bg-orange-500"
      : "bg-emerald-500";

  const iconColor = isExhausted
    ? "text-destructive"
    : isLow
      ? "text-orange-500"
      : "text-emerald-500";

  return (
    <div className="space-y-4" data-testid="whatsapp-usage-widget">
      <div className="flex items-start gap-2.5">
        <MessageCircle className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          <p className="text-sm font-semibold leading-tight" data-testid="text-whatsapp-title">WhatsApp Usage</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-medium" data-testid="text-whatsapp-limit">{usage.limit.toLocaleString()}</span> messages/month
          </p>
        </div>
      </div>

      <div>
        <div className="w-full h-3 rounded-full bg-muted/80 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${Math.max(Math.min(usagePercent, 100), 2)}%` }}
            data-testid="whatsapp-usage-bar"
          />
        </div>
        <div className="flex items-center justify-between gap-1 mt-1.5">
          <span className="text-[11px] text-muted-foreground">
            <span className="font-medium" data-testid="text-whatsapp-used">{usage.used}</span> used
          </span>
          <span className="text-[11px] text-muted-foreground">
            <span className="font-medium" data-testid="text-whatsapp-remaining">{usage.remaining}</span> left
          </span>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground" data-testid="text-whatsapp-reset">
        Resets on {usage.resetDate}
      </div>

      {isLow && !isExhausted && (
        <div className="flex items-start gap-1.5 text-xs text-orange-600 dark:text-orange-400" data-testid="whatsapp-low-warning">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Only {usage.remaining} messages left this month.</span>
        </div>
      )}

      {isExhausted && (
        <div className="flex items-start gap-1.5 text-xs text-destructive" data-testid="whatsapp-exhausted-warning">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Limit reached. Resumes {usage.resetDate}.</span>
        </div>
      )}
    </div>
  );
}
