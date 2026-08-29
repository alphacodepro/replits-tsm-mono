import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { format } from "date-fns";

export default function LiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const dateLabel = format(now, "EEEE, d MMMM yyyy");
  const timeLabel = format(now, "h:mm a");

  return (
    <div
      className="flex shrink-0 items-center gap-2 text-[13px] text-muted-foreground"
      aria-label={`Current date and time: ${dateLabel} at ${timeLabel}`}
      data-testid="live-date-time"
    >
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
        <span className="hidden md:inline">{dateLabel}</span>
      </span>
      <span className="hidden md:inline text-border" aria-hidden="true">|</span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
        <span>{timeLabel}</span>
      </span>
    </div>
  );
}