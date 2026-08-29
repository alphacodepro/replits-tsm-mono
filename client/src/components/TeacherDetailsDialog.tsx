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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teacherApi, financePinApi } from "@/lib/api";
import TeacherSubscriptionCard from "@/components/TeacherSubscriptionCard";
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
  GraduationCap,
  ShieldOff,
  Pencil,
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
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const [editingInformation, setEditingInformation] = useState(false);
  const [informationInput, setInformationInput] = useState({
    instituteName: "",
    email: "",
    phone: "",
  });
  const [informationError, setInformationError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/teachers", teacherId],
    queryFn: () => teacherApi.get(teacherId!),
    enabled: !!teacherId && open,
  });

  const updateLimitMutation = useMutation({
    mutationFn: (limit: number | null) => teacherApi.updateStudentLimit(teacherId!, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({ title: "Student limit updated." });
      setEditingLimit(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update limit", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveLimit = () => {
    const val = limitInput.trim();
    const limit = val === "" ? null : parseInt(val, 10);
    if (val !== "" && (isNaN(limit!) || limit! < 1)) {
      toast({ title: "Enter a valid number or leave blank for unlimited.", variant: "destructive" });
      return;
    }
    updateLimitMutation.mutate(limit);
  };

  const handleEditInformation = () => {
    if (!teacher) return;
    setInformationInput({
      instituteName: teacher.instituteName ?? "",
      email: teacher.email ?? "",
      phone: teacher.phone ?? "",
    });
    setInformationError(null);
    setEditingInformation(true);
  };

  const handleCancelInformation = () => {
    setEditingInformation(false);
    setInformationError(null);
  };

  const updateInformationMutation = useMutation({
    mutationFn: (updates: typeof informationInput) =>
      teacherApi.updateInformation(teacherId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      setEditingInformation(false);
      setInformationError(null);
      toast({ title: "Teacher information updated." });
    },
    onError: (error: Error) => {
      setInformationError(error.message);
      toast({
        title: "Failed to update teacher information",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveInformation = () => {
    const updates = {
      instituteName: informationInput.instituteName.trim(),
      email: informationInput.email.trim(),
      phone: informationInput.phone.trim(),
    };

    if (updates.instituteName.length > 200) {
      setInformationError("Institute name must be 200 characters or less");
      return;
    }
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      setInformationError("Enter a valid email address");
      return;
    }
    if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
      setInformationError("Phone number must be exactly 10 digits");
      return;
    }

    setInformationError(null);
    updateInformationMutation.mutate(updates);
  };

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

  const clearPinMutation = useMutation({
    mutationFn: () => financePinApi.adminClear(teacherId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers", teacherId] });
      toast({ title: "Finance PIN cleared", description: "The teacher's finance PIN has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to clear PIN", description: error.message, variant: "destructive" });
    },
  });

  const handleClose = () => {
    setNewCredentials(null);
    setCopiedPassword(false);
    setEditingLimit(false);
    setLimitInput("");
    setEditingInformation(false);
    setInformationError(null);
    onOpenChange(false);
  };

  if (!teacherId) return null;

  const teacher = data?.teacher;
  const batches = data?.batches || [];
  const stats = data?.stats;
  const lastBackup = data?.lastBackup ?? null;

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
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Basic Information
                  </h3>
                  {!editingInformation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditInformation}
                      data-testid="button-edit-teacher-information"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Edit Information
                    </Button>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-medium" data-testid="text-detail-fullname">{teacher?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-mono" data-testid="text-detail-username">{teacher?.username}</span>
                  </div>
                  {editingInformation ? (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="teacher-institute-name">Institute Name</Label>
                        <Input
                          id="teacher-institute-name"
                          value={informationInput.instituteName}
                          onChange={(event) => setInformationInput((current) => ({
                            ...current,
                            instituteName: event.target.value,
                          }))}
                          maxLength={200}
                          data-testid="input-teacher-institute-name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="teacher-email">Email</Label>
                        <Input
                          id="teacher-email"
                          type="email"
                          value={informationInput.email}
                          onChange={(event) => setInformationInput((current) => ({
                            ...current,
                            email: event.target.value,
                          }))}
                          data-testid="input-teacher-email"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="teacher-phone">Phone Number</Label>
                        <Input
                          id="teacher-phone"
                          inputMode="numeric"
                          value={informationInput.phone}
                          onChange={(event) => setInformationInput((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))}
                          maxLength={10}
                          data-testid="input-teacher-phone"
                        />
                      </div>
                      {informationError && (
                        <p className="text-sm text-destructive" role="alert" data-testid="text-teacher-information-error">
                          {informationError}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={handleSaveInformation}
                          disabled={updateInformationMutation.isPending}
                          data-testid="button-save-teacher-information"
                        >
                          {updateInformationMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelInformation}
                          disabled={updateInformationMutation.isPending}
                          data-testid="button-cancel-teacher-information"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Institute:</span>
                        <span className="font-medium" data-testid="text-detail-institute">{teacher?.instituteName || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span data-testid="text-detail-email">{teacher?.email || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span data-testid="text-detail-phone">{teacher?.phone || "—"}</span>
                      </div>
                    </>
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
                      <div className="text-sm text-muted-foreground">
                        Students
                        {(teacher as any)?.studentLimit != null && (
                          <span className="ml-1 text-muted-foreground">/ {(teacher as any).studentLimit} limit</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Student Limit
                  </h3>
                  {!editingLimit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLimitInput((teacher as any)?.studentLimit?.toString() ?? "");
                        setEditingLimit(true);
                      }}
                      data-testid="button-edit-student-limit"
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {!editingLimit ? (
                  <div className="flex items-center gap-2 text-sm" data-testid="text-student-limit">
                    {(teacher as any)?.studentLimit != null ? (
                      <>
                        <span className="text-2xl font-bold">{(teacher as any).studentLimit}</span>
                        <span className="text-muted-foreground">students max</span>
                        {stats?.studentCount != null && (
                          <Badge variant="outline" className="ml-2">
                            {stats.studentCount} used
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Unlimited</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="limit-input" className="text-sm">Maximum students allowed (blank = unlimited)</Label>
                    <Input
                      id="limit-input"
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      data-testid="input-student-limit-edit"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveLimit}
                        disabled={updateLimitMutation.isPending}
                        data-testid="button-save-student-limit"
                      >
                        {updateLimitMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingLimit(false)}
                        disabled={updateLimitMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {teacher && (
                <TeacherSubscriptionCard
                  teacher={teacher}
                  studentCount={stats?.studentCount}
                  lastBackup={lastBackup}
                />
              )}

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

            <div className="flex gap-2 pt-4 border-t flex-wrap">
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
              {(teacher as any)?.hasPinSet && (
                <Button
                  variant="outline"
                  onClick={() => clearPinMutation.mutate()}
                  disabled={clearPinMutation.isPending}
                  className="flex-1"
                  data-testid="button-clear-finance-pin"
                >
                  <ShieldOff className="w-4 h-4 mr-2" />
                  {clearPinMutation.isPending ? "Clearing..." : "Clear Finance PIN"}
                </Button>
              )}
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
