import { useEffect, useRef, useState } from "react";
import { WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { NETWORK_ERROR_EVENT } from "@/lib/networkStatus";

function getInitialOnlineState() {
  return typeof navigator === "undefined" || navigator.onLine;
}

export default function ConnectionStatus() {
  const initialOnline = getInitialOnlineState();
  const [isOnline, setIsOnline] = useState(initialOnline);
  const wasOffline = useRef(!initialOnline);
  const { toast } = useToast();

  useEffect(() => {
    const markOffline = () => {
      wasOffline.current = true;
      setIsOnline(false);
    };

    const markOnline = () => {
      const shouldNotify = wasOffline.current;
      wasOffline.current = false;
      setIsOnline(true);

      if (shouldNotify) {
        toast({
          title: "Back online",
          description: "Your connection has been restored.",
          className: "border-emerald-200 bg-emerald-600 text-white",
          duration: 4500,
        });

        void queryClient
          .refetchQueries({ type: "active" })
          .catch(() => undefined);
      }
    };

    window.addEventListener("offline", markOffline);
    window.addEventListener("online", markOnline);
    window.addEventListener(NETWORK_ERROR_EVENT, markOffline);

    return () => {
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("online", markOnline);
      window.removeEventListener(NETWORK_ERROR_EVENT, markOffline);
    };
  }, [toast]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-[110] border-b border-red-700 bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-md"
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-center">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          You&apos;re offline. Some actions are temporarily unavailable. Please
          reconnect to continue.
        </span>
      </div>
    </div>
  );
}