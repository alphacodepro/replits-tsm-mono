import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StudentTable from "@/components/StudentTable";
import AddStudentDialog from "@/components/AddStudentDialog";
import EditStudentDialog from "@/components/EditStudentDialog";
import PaymentHistoryDialog from "@/components/PaymentHistoryDialog";
import QRCodeDialog from "@/components/QRCodeDialog";
import ImportStudentsDialog from "@/components/ImportStudentsDialog";
import EmptyState from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ArrowLeft,
  Plus,
  Search,
  BookOpen,
  Users,
  IndianRupee,
  QrCode,
  Link as LinkIcon,
  Clock,
  FileUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchApi, studentApi, dashboardApi, Student as ApiStudent } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface StudentWithPaymentInfo extends Omit<ApiStudent, 'customFee'> {
  customFee: number | null;
  totalPaid: number;
  totalDue: number;
}

interface BatchDetailsPageProps {
  batchId: string;
}

export default function BatchDetailsPage({ batchId }: BatchDetailsPageProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentWithPaymentInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending">("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithPaymentInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const { data: paginatedData, isLoading: batchLoading } = useQuery({
    queryKey: ["/api/batches", batchId, "students", currentPage],
    queryFn: () => dashboardApi.studentsPaginated(batchId, currentPage, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const addStudentMutation = useMutation({
    mutationFn: studentApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      setAddStudentOpen(false);
      toast({
        title: "Student added!",
        description: `${data.student.fullName} has been added to ${paginatedData?.batch.name}`,
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      const isDuplicateStudent = errorMessage.includes('student already exists');
      
      toast({
        title: isDuplicateStudent ? "Student Already Exists in This Batch" : "Error Adding Student",
        description: isDuplicateStudent ? "Phone number already registered" : error.message,
        variant: "destructive",
      });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      setEditStudentOpen(false);
      toast({
        title: "Student updated!",
        description: `${data.student.fullName}'s information has been updated`,
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      const isDuplicateStudent = errorMessage.includes('student already exists');
      
      toast({
        title: isDuplicateStudent ? "Student Already Exists in This Batch" : "Error updating student",
        description: isDuplicateStudent ? "Phone number already registered" : error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Student deleted",
        description: "The student has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting student",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleRegistrationMutation = useMutation({
    mutationFn: ({ enabled }: { enabled: boolean }) =>
      batchApi.toggleRegistration(batchId, enabled),

    onMutate: async ({ enabled }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/batches", batchId, "students"] });

      const prevData = queryClient.getQueryData<any>(["/api/batches", batchId, "students", currentPage]);

      queryClient.setQueryData(["/api/batches", batchId, "students", currentPage], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          batch: {
            ...old.batch,
            registrationEnabled: enabled,
          },
        };
      });

      return { prevData };
    },

    onError: (_error, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["/api/batches", batchId, "students", currentPage], context.prevData);
      }

      toast({
        title: "Failed to update registration",
        description: "Please try again.",
        variant: "destructive",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
    },
  });

  const batch = paginatedData?.batch;
  const pagination = paginatedData?.pagination;
  const batchTotals = paginatedData?.batchTotals || { 
    studentCount: 0, 
    totalCollected: 0, 
    totalPending: 0,
    paidCount: 0,
    pendingCount: 0,
  };
  const students: StudentWithPaymentInfo[] = (paginatedData?.data || []).map((student: ApiStudent) => ({
    ...student,
    customFee: student.customFee ?? null,
    joinDate: format(new Date(student.joinDate), 'dd MMM yyyy'),
    totalPaid: student.totalPaid ?? 0,
    totalDue: student.totalDue ?? 0,
  }));

  const searchFilteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone.includes(searchQuery) ||
    (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const filteredStudents = searchFilteredStudents.filter((student) => {
    if (paymentFilter === "all") return true;
    if (paymentFilter === "paid") return (student.totalDue ?? 0) === 0;
    return (student.totalDue ?? 0) > 0;
  });

  const handleViewPayments = (studentId: string) => {
    setSelectedStudentId(studentId);
    setPaymentDialogOpen(true);
  };

  const handleCopyLink = () => {
    if (!batch) return;
    const url = `${window.location.origin}/register/${batch.registrationToken}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Registration link copied to clipboard",
    });
  };

  const handleEditStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentToEdit(student);
      setEditStudentOpen(true);
    }
  };

  const handleDeleteClick = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentToDelete(student);
      setDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteStudentMutation.mutate(studentToDelete.id);
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  if (batchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
        <div className="text-muted-foreground">Batch not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 flex flex-col">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")} 
            className="hover:scale-105 transition-transform duration-200"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg blur-sm"></div>
                  <div className="relative bg-primary/10 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{batch.name}</h1>
                  {batch.subject && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{batch.subject}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 inline-flex items-center">
                  <IndianRupee className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{batch.fee.toLocaleString()}<span className="ml-1">/ {batch.feePeriod}</span></span>
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{batchTotals.studentCount} Students</span>
                </Badge>
                {batch.createdAt && (
                  <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Created: {format(new Date(batch.createdAt), "dd MMM yyyy")}</span>
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCopyLink}
                  className="hover:scale-105 transition-transform duration-200"
                  data-testid="button-share-link"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setQrDialogOpen(true)}
                  className="hover:scale-105 transition-transform duration-200"
                  data-testid="button-show-qr-code"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR
                </Button>
              </div>
              
              <div className="flex items-center justify-end gap-3 px-3 py-2 rounded-lg bg-muted/40 border border-gray-200 dark:border-gray-700">
                <Label htmlFor="registration-toggle" className="text-sm font-medium">
                  Registration:
                </Label>
                <Badge
                  variant={batch.registrationEnabled ? "default" : "secondary"}
                  className="text-xs px-2 py-0.5"
                  data-testid="badge-registration-status"
                >
                  {batch.registrationEnabled ? "Open" : "Closed"}
                </Badge>
                <Switch
                  id="registration-toggle"
                  checked={batch.registrationEnabled}
                  onCheckedChange={(enabled) => toggleRegistrationMutation.mutate({ enabled })}
                  data-testid="switch-registration"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg blur-sm"></div>
                <div className="relative bg-primary/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{batchTotals.studentCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-lg blur-sm"></div>
                <div className="relative bg-chart-2/10 p-3 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-chart-2" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Fees Collected</p>
                <p className="text-3xl font-bold text-chart-2 mt-1">
                  ₹{batchTotals.totalCollected.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-lg blur-sm"></div>
                <div className="relative bg-chart-3/10 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-chart-3" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
                <p className="text-3xl font-bold text-chart-3 mt-1">
                  ₹{batchTotals.totalPending.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setImportDialogOpen(true)}
                variant="outline"
                className="hover:scale-105 transition-transform duration-200 shadow-sm hover:shadow-md"
                data-testid="button-import-students"
              >
                <FileUp className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
              <Button 
                onClick={() => setAddStudentOpen(true)}
                className="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
                data-testid="button-add-student"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200"
                data-testid="input-search-students"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={paymentFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentFilter("all")}
                className="rounded-full hover:scale-105 transition-transform duration-200 shadow-sm"
                data-testid="button-filter-all"
              >
                All ({batchTotals.studentCount})
              </Button>
              <Button
                variant={paymentFilter === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentFilter("paid")}
                className={`rounded-full hover:scale-105 transition-transform duration-200 shadow-sm ${paymentFilter === "paid" ? "" : "text-chart-2 hover:text-chart-2"}`}
                data-testid="button-filter-paid"
              >
                Paid ({batchTotals.paidCount})
              </Button>
              <Button
                variant={paymentFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentFilter("pending")}
                className={`rounded-full hover:scale-105 transition-transform duration-200 shadow-sm ${paymentFilter === "pending" ? "" : "text-chart-3 hover:text-chart-3"}`}
                data-testid="button-filter-pending"
              >
                Pending ({batchTotals.pendingCount})
              </Button>
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          searchQuery || paymentFilter !== "all" ? (
            <EmptyState
              icon={Search}
              title="No students found"
              description={
                searchQuery && paymentFilter !== "all"
                  ? `No students match "${searchQuery}" with ${paymentFilter} status`
                  : searchQuery
                  ? `No students match "${searchQuery}"`
                  : `No students with ${paymentFilter} payments`
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No students yet"
              description="Add students manually or share the registration link for self-registration"
              actionLabel="Add First Student"
              onAction={() => setAddStudentOpen(true)}
            />
          )
        ) : (
          <>
            <StudentTable 
              students={filteredStudents} 
              onViewPayments={handleViewPayments}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteClick}
            />
            
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  <span className="text-sm px-3">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © 2026 Tuition Management System. All rights reserved.
          </p>
        </div>
      </footer>

      <AddStudentDialog
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        batchName={batch.name}
        batchStandard={batch.standard}
        onSubmit={(data) => {
          addStudentMutation.mutate({
            batchId: batch.id,
            ...data,
          });
        }}
      />

      {studentToEdit && (
        <EditStudentDialog
          open={editStudentOpen}
          onOpenChange={setEditStudentOpen}
          student={studentToEdit}
          onSubmit={(data) => {
            updateStudentMutation.mutate({
              id: studentToEdit.id,
              data,
            });
          }}
        />
      )}

      <ImportStudentsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        batchId={batch.id}
        batchName={batch.name}
      />

      {selectedStudentId && (
        <PaymentHistoryDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          studentId={selectedStudentId}
          batchFee={batch.fee}
          feePeriod={batch.feePeriod}
        />
      )}

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        batchName={batch.name}
        registrationUrl={`${window.location.origin}/register/${batch.registrationToken}`}
        registrationEnabled={batch.registrationEnabled}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.fullName}? This will permanently delete all payment records for this student. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete Student"
        destructive
      />
    </div>
  );
}
