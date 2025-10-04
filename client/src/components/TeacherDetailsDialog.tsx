import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { teacherApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Users,
  Key,
  Building,
  Copy,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

interface TeacherDetailsDialogProps {
  teacherId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TeacherDetailsDialog({
  teacherId,
  open,
  onOpenChange,
}: TeacherDetailsDialogProps) {
  const { toast } = useToast();
  const [newCredentials, setNewCredentials] = useState<{ username: string; password: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/teachers", teacherId],
    queryFn: () => teacherApi.get(teacherId!),
    enabled: !!teacherId && open,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => teacherApi.resetPassword(teacherId!),
    onSuccess: (response) => {
      setNewCredentials({
        username: response.username,
        password: response.newPassword,
      });
      toast({
        title: "Password reset successful",
        description: "New password generated. Please save it securely.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyPassword = async () => {
    if (newCredentials?.password) {
      await navigator.clipboard.writeText(newCredentials.password);
      setCopiedPassword(true);
      toast({
        title: "Password copied",
        description: "Password has been copied to clipboard",
      });
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleClose = () => {
    setNewCredentials(null);
    setCopiedPassword(false);
    onOpenChange(false);
  };

  if (!teacherId) return null;

  const teacher = data?.teacher;
  const batches = data?.batches || [];
  const stats = data?.stats;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-teacher-details">
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6">
            {newCredentials && (
              <Alert className="bg-primary/5 border-primary/20">
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">New Credentials Generated</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Username:</span>
                        <span className="font-mono font-medium" data-testid="text-new-username">{newCredentials.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Password:</span>
                        <span className="font-mono font-medium" data-testid="text-new-password">{newCredentials.password}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyPassword}
                          data-testid="button-copy-password"
                        >
                          {copiedPassword ? (
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Please save these credentials securely. The password won't be shown again.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-medium" data-testid="text-detail-fullname">{teacher?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-mono" data-testid="text-detail-username">{teacher?.username}</span>
                  </div>
                  {teacher?.instituteName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Institute:</span>
                      <span className="font-medium" data-testid="text-detail-institute">{teacher.instituteName}</span>
                    </div>
                  )}
                  {teacher?.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span data-testid="text-detail-email">{teacher.email}</span>
                    </div>
                  )}
                  {teacher?.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span data-testid="text-detail-phone">{teacher.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span data-testid="text-detail-created">
                      {(teacher as any)?.createdAt ? formatDistanceToNow(new Date((teacher as any).createdAt), { addSuffix: true }) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {teacher?.isActive ? (
                      <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold" data-testid="text-detail-batch-count">{stats?.batchCount || 0}</div>
                      <div className="text-sm text-muted-foreground">Batches</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold" data-testid="text-detail-student-count">{stats?.studentCount || 0}</div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                  </div>
                </div>
              </Card>

              {batches.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Batches ({batches.length})
                  </h3>
                  <div className="space-y-2">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        data-testid={`batch-item-${batch.id}`}
                      >
                        <div>
                          <div className="font-medium">{batch.name}</div>
                          {batch.subject && (
                            <div className="text-sm text-muted-foreground">{batch.subject}</div>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          ₹{batch.fee}/{batch.feePeriod}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => resetPasswordMutation.mutate()}
                disabled={resetPasswordMutation.isPending}
                className="flex-1"
                data-testid="button-reset-password"
              >
                <Key className="w-4 h-4 mr-2" />
                {resetPasswordMutation.isPending ? "Generating..." : "Generate New Password"}
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1" data-testid="button-close-dialog">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
