import { useMutation } from "@tanstack/react-query";
import { Cake, Trash2 } from "lucide-react";
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
  const deleteAllMutation = useMutation({
    mutationFn: () => notificationApi.deleteAll(),
    onSuccess: () => {
      queryClient.setQueryData(["/api/notifications"], { notifications: [] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      onClose();
    },
  });

  if (!notification) return null;

  const students: NotificationStudentData[] = (() => {
    try { return JSON.parse(notification.studentData || "[]"); }
    catch { return []; }
  })();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[420px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cake className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold leading-snug">
                {notification.studentCount} Student{notification.studentCount > 1 ? "s" : ""} Have Birthdays Today
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notification.studentCount} total
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No students found</p>
          ) : students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3"
              data-testid={`drawer-student-${student.id}`}
            >
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <Cake className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{student.batchName}</p>
                {student.standard && (
                  <p className="text-xs text-muted-foreground mt-0.5">Class {student.standard}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t px-6 py-4 flex items-center justify-between gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            className="text-sm text-destructive hover:text-destructive"
            onClick={() => deleteAllMutation.mutate()}
            disabled={deleteAllMutation.isPending}
            data-testid="button-delete-all-notifications"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete all
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
