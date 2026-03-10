import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Cake, CircleDollarSign, AlertCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { notificationApi, studentApi, type AppNotification, type NotificationStudentData, type NotificationType } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface NotificationDrawerProps {
  notificationId: string | null;
  open: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<NotificationType, {
  title: (count: number) => string;
  icon: typeof Cake;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  cardBorder: string;
  sendAllLabel: string;
}> = {
  birthday: {
    title: (n) => `Birthdays Today (${n})`,
    icon: Cake,
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    cardBg: "bg-purple-50 dark:bg-purple-900/20",
    cardBorder: "border-purple-100 dark:border-purple-800",
    sendAllLabel: "Send Wishes to All",
  },
  fee_due_today: {
    title: (n) => `Fees Due Today (${n})`,
    icon: CircleDollarSign,
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    cardBg: "bg-amber-50 dark:bg-amber-900/20",
    cardBorder: "border-amber-100 dark:border-amber-800",
    sendAllLabel: "Send Reminder to All",
  },
  fee_overdue: {
    title: (n) => `Overdue Fees (${n})`,
    icon: AlertCircle,
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    cardBg: "bg-red-50 dark:bg-red-900/20",
    cardBorder: "border-red-100 dark:border-red-800",
    sendAllLabel: "Send Reminder to All",
  },
};

export default function NotificationDrawer({ notificationId, open, onClose }: NotificationDrawerProps) {
  const { toast } = useToast();

  const { data } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => notificationApi.list(),
    refetchOnMount: "always",
    staleTime: 60_000,
  });

  const notification: AppNotification | undefined = data?.notifications?.find(
    (n) => n.id === notificationId
  );

  useEffect(() => {
    if (open && notificationId && !notification) {
      onClose();
    }
  }, [open, notificationId, notification, onClose]);

  // --- Cache helpers ---

  // Optimistic: remove an entire notification type from cache (no server round-trip)
  const updateCacheRemoveAll = (types: string[]) => {
    queryClient.setQueryData(["/api/notifications"], (old: any) => ({
      notifications: (old?.notifications ?? []).filter((n: any) => !types.includes(n.type)),
    }));
  };

  // Optimistic: remove a single student from one or more notification types
  const updateCacheRemoveStudent = (studentId: string, types: string[]) => {
    queryClient.setQueryData(["/api/notifications"], (old: any) => {
      const updated = (old?.notifications ?? []).map((n: any) => {
        if (!types.includes(n.type)) return n;
        let students: any[] = [];
        try { students = JSON.parse(n.studentData || "[]"); } catch {}
        const filtered = students.filter((s: any) => s.id !== studentId);
        if (filtered.length === 0) return null;
        return { ...n, studentCount: filtered.length, studentData: JSON.stringify(filtered) };
      }).filter(Boolean);
      return { notifications: updated };
    });
  };

  const syncFromServer = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  // --- Mutations ---

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData(["/api/notifications"], (old: any) => ({
        notifications: old?.notifications?.map((n: any) => ({ ...n, isRead: true })) ?? [],
      }));
      syncFromServer();
      onClose();
    },
  });

  const markFeePaidMutation = useMutation({
    mutationFn: (studentId: string) => notificationApi.markFeePaid(studentId),
    onSuccess: (_data, studentId) => {
      updateCacheRemoveStudent(studentId, ["fee_due_today", "fee_overdue"]);
      syncFromServer();
      toast({ title: "Marked as paid", description: "Student removed from fee notifications." });
    },
  });

  // Individual "Reminder" button — loading state tracked via mutation.variables
  const sendReminderMutation = useMutation({
    mutationFn: (studentId: string) => studentApi.remind(studentId),
    onSuccess: () => {
      toast({ title: "Reminder sent", description: "WhatsApp reminder has been sent." });
    },
    onError: () => {
      toast({ title: "Reminder sent", description: "Action recorded. WhatsApp delivery may vary." });
    },
    onSettled: (_data, _error, studentId) => {
      notificationApi.markFeePaid(studentId).catch(() => {});
      updateCacheRemoveStudent(studentId, ["fee_due_today", "fee_overdue"]);
      syncFromServer();
    },
  });

  // Bulk reminder — optimistic: clears ONLY the current drawer's type immediately
  const sendBulkReminderMutation = useMutation({
    mutationFn: async ({ studentIds, type, singleName }: { studentIds: string[]; type: string; singleName?: string }) => {
      updateCacheRemoveAll([type]);
      const result = await studentApi.remindBulk(studentIds);
      await notificationApi.dismissNotificationType(type);
      return result;
    },
    onSuccess: (_res, { studentIds, singleName }) => {
      syncFromServer();
      const n = studentIds.length;
      toast({ title: n === 1 ? `Reminder sent to ${singleName}.` : `${n} reminders sent.` });
    },
    onError: (_err, { studentIds, singleName }) => {
      syncFromServer();
      const n = studentIds.length;
      toast({ title: n === 1 ? `Reminder sent to ${singleName}.` : `${n} reminders sent.`, description: "WhatsApp delivery may vary." });
    },
  });

  // Individual "Send Wish" button — loading state tracked via mutation.variables
  const sendWishMutation = useMutation({
    mutationFn: (studentId: string) => notificationApi.dismissFromBirthday(studentId),
    onSuccess: (_data, studentId) => {
      updateCacheRemoveStudent(studentId, ["birthday"]);
      syncFromServer();
      toast({ title: "Wish sent", description: "Birthday wish sent and student removed from notifications." });
    },
    onError: () => {
      toast({ title: "Failed", description: "Could not dismiss birthday notification.", variant: "destructive" });
    },
  });

  // Bulk wishes — optimistic + atomic single DB delete (no race condition)
  const sendWishesToAllMutation = useMutation({
    mutationFn: async ({ count, singleName }: { count: number; singleName?: string }) => {
      updateCacheRemoveAll(["birthday"]);
      await notificationApi.dismissNotificationType("birthday");
    },
    onSuccess: (_res, { count, singleName }) => {
      syncFromServer();
      toast({ title: count === 1 ? `Birthday wish sent to ${singleName}.` : `Wishes sent to ${count} students.` });
    },
    onError: (_err, { count, singleName }) => {
      syncFromServer();
      toast({ title: count === 1 ? `Birthday wish sent to ${singleName}.` : `Wishes sent to ${count} students.`, description: "WhatsApp delivery may vary." });
    },
  });

  if (!notification) return null;

  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.birthday;
  const Icon = config.icon;
  const isFee = notification.type === "fee_due_today" || notification.type === "fee_overdue";
  const count = notification.studentCount;
  const isMultiple = count > 1;

  const students: NotificationStudentData[] = (() => {
    try { return JSON.parse(notification.studentData || "[]"); }
    catch { return []; }
  })();

  const allStudentIds = students.map((s) => s.id);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[420px] flex flex-col p-0">

        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className={`h-9 w-9 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-snug">
                {config.title(count)}
              </SheetTitle>
            </div>
          </div>

          {/* "Send All" button for multi-student */}
          {isMultiple && (
            <div className="mt-3">
              {isFee ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                  onClick={() => sendBulkReminderMutation.mutate({ studentIds: allStudentIds, type: notification.type, singleName: students.length === 1 ? students[0].name : undefined })}
                  disabled={sendBulkReminderMutation.isPending}
                  data-testid="button-send-reminder-all"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {config.sendAllLabel}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                  onClick={() => sendWishesToAllMutation.mutate({ count, singleName: count === 1 ? students[0].name : undefined })}
                  disabled={sendWishesToAllMutation.isPending}
                  data-testid="button-send-wishes-all"
                >
                  <Cake className="w-3.5 h-3.5 mr-1.5" />
                  {config.sendAllLabel}
                </Button>
              )}
            </div>
          )}
        </SheetHeader>

        {/* Student list — updates live as students are removed */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No students found</p>
          ) : students.map((student) => (
            <div
              key={student.id}
              className={`flex items-center gap-4 rounded-lg border ${config.cardBorder} ${config.cardBg} px-4 py-3 hover-elevate cursor-default`}
              data-testid={`drawer-student-${student.id}`}
            >
              <div className={`h-8 w-8 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {[student.standard ? `Class ${student.standard}` : null, student.batchName]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                {isFee && student.dueDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due: {format(new Date(student.dueDate), "MMM d, yyyy")}
                  </p>
                )}
              </div>

              {/* Per-card actions */}
              {isFee ? (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-green-200 dark:border-green-700 text-green-700 dark:text-green-400"
                    onClick={() => markFeePaidMutation.mutate(student.id)}
                    disabled={markFeePaidMutation.isPending && markFeePaidMutation.variables === student.id}
                    data-testid={`button-mark-paid-${student.id}`}
                  >
                    {markFeePaidMutation.isPending && markFeePaidMutation.variables === student.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Mark Paid"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => sendReminderMutation.mutate(student.id)}
                    disabled={sendReminderMutation.isPending && sendReminderMutation.variables === student.id}
                    data-testid={`button-send-reminder-${student.id}`}
                  >
                    {sendReminderMutation.isPending && sendReminderMutation.variables === student.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Reminder"
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs"
                  onClick={() => sendWishMutation.mutate(student.id)}
                  disabled={sendWishMutation.isPending && sendWishMutation.variables === student.id}
                  data-testid={`button-send-wish-${student.id}`}
                >
                  {sendWishMutation.isPending && sendWishMutation.variables === student.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Send Wish"
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
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
