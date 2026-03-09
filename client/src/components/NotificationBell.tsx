import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Cake, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationApi, type AppNotification } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface NotificationBellProps {
  onNotificationClick: (notification: AppNotification) => void;
}

function getNotificationLabel(n: AppNotification): string {
  return `${n.studentCount} student${n.studentCount > 1 ? "s" : ""} ${n.studentCount > 1 ? "have" : "has"} birthdays today`;
}

function NotificationIcon() {
  return (
    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
      <Cake className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    </div>
  );
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => notificationApi.list(),
    refetchOnMount: "always",
    staleTime: 60_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(["/api/notifications"], (old: any) => ({
        notifications: old?.notifications?.map((n: any) =>
          n.id === id ? { ...n, isRead: true } : n
        ) ?? [],
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteOneMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteOne(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(["/api/notifications"], (old: any) => ({
        notifications: old?.notifications?.filter((n: any) => n.id !== id) ?? [],
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayList = notifications.slice(0, 5);

  function handleNotificationClick(n: AppNotification) {
    if (!n.isRead) {
      markReadMutation.mutate(n.id);
    }
    setOpen(false);
    onNotificationClick(n);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none pointer-events-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[370px] p-0 rounded-xl shadow-lg"
        data-testid="popover-notifications"
      >
        <div className="flex items-center px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notifications</span>
        </div>

        {isLoading ? (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            Loading...
          </div>
        ) : displayList.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {displayList.map((n) => (
              <div
                key={n.id}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover-elevate transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(n)}
                data-testid={`notification-item-${n.type}`}
              >
                <NotificationIcon />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.isRead ? "font-normal text-foreground" : "font-semibold text-foreground"}`}>
                    {getNotificationLabel(n)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(n.updatedAt), "MMM d, h:mm a")}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOneMutation.mutate(n.id);
                  }}
                  disabled={deleteOneMutation.isPending}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                  data-testid={`button-delete-notification-${n.id}`}
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="border-t px-4 py-2.5 flex justify-end">
            <button
              className="text-xs text-primary hover:underline font-medium"
              onClick={() => {
                setOpen(false);
                if (notifications[0]) onNotificationClick(notifications[0]);
              }}
            >
              View all
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
