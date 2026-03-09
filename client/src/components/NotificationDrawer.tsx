import { useMutation } from "@tanstack/react-query";
import { Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { notificationApi, type AppNotification, type NotificationStudentData } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface NotificationDrawerProps {
  notification: AppNotification | null;
  open: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ notification, open, onClose }: NotificationDrawerProps) {
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData(["/api/notifications"], (old: any) => ({
        notifications: old?.notifications?.map((n: any) => ({ ...n, isRead: true })) ?? [],
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      onClose();
    },
  });

  if (!notification) return null;

  const students: NotificationStudentData[] = (() => {
    try { return JSON.parse(notification.studentData || "[]"); }
    catch { return []; }
  })();

  const count = notification.studentCount;
  const isMultiple = count > 1;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[420px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cake className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-snug">
                Birthdays Today ({count})
              </SheetTitle>
            </div>
          </div>

          {isMultiple && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                data-testid="button-send-wishes-all"
              >
                <Cake className="w-3.5 h-3.5 mr-1.5" />
                Send Wishes to All
              </Button>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No students found</p>
          ) : students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-4 rounded-lg border border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 px-4 py-3 hover-elevate cursor-default"
              data-testid={`drawer-student-${student.id}`}
            >
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <Cake className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {[student.standard ? `Class ${student.standard}` : null, student.batchName]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
              {!isMultiple && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs"
                  data-testid={`button-send-wish-${student.id}`}
                >
                  Send Wish
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t px-6 py-4 flex items-center justify-between gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            data-testid="button-mark-as-read-drawer"
          >
            Mark as Read
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-close-drawer"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
