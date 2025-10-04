import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StudentTable from "@/components/StudentTable";
import AddStudentDialog from "@/components/AddStudentDialog";
import PaymentHistoryDialog from "@/components/PaymentHistoryDialog";
import QRCodeDialog from "@/components/QRCodeDialog";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchApi, studentApi, Student as ApiStudent } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface StudentWithPaymentInfo extends ApiStudent {
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithPaymentInfo | null>(null);

  const { data: batchData, isLoading: batchLoading } = useQuery({
    queryKey: ["/api/batches", batchId],
    queryFn: () => batchApi.get(batchId),
  });

  const addStudentMutation = useMutation({
    mutationFn: studentApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      setAddStudentOpen(false);
      toast({
        title: "Student added!",
        description: `${data.student.fullName} has been added to ${batchData?.batch.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding student",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
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

  const batch = batchData?.batch;
  const students: StudentWithPaymentInfo[] = (batchData?.students || []).map(student => ({
    ...student,
    joinDate: new Date(student.joinDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    totalPaid: student.totalPaid || 0,
    totalDue: student.totalDue || 0,
  }));

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone.includes(searchQuery) ||
    (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Batch not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-3 rounded-md">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{batch.name}</h1>
                  {batch.subject && (
                    <p className="text-muted-foreground">{batch.subject}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary" className="text-base px-4 py-1">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  ₹{batch.fee.toLocaleString()} / {batch.feePeriod}
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-1">
                  <Users className="w-4 h-4 mr-1" />
                  {students.length} Students
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyLink} data-testid="button-share-link">
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" onClick={() => setQrDialogOpen(true)} data-testid="button-show-qr-code">
                <QrCode className="w-4 h-4 mr-2" />
                Show QR
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 hover-elevate">
            <p className="text-sm text-muted-foreground mb-2">Total Students</p>
            <p className="text-3xl font-bold">{students.length}</p>
          </Card>
          <Card className="p-6 hover-elevate">
            <p className="text-sm text-muted-foreground mb-2">Fees Collected</p>
            <p className="text-3xl font-bold text-chart-2">
              ₹{students.reduce((sum, s) => sum + (s.totalPaid || 0), 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-6 hover-elevate">
            <p className="text-sm text-muted-foreground mb-2">Pending Payments</p>
            <p className="text-3xl font-bold text-chart-3">
              ₹{students.reduce((sum, s) => sum + (s.totalDue || 0), 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Students</h2>
            <Button onClick={() => setAddStudentOpen(true)} data-testid="button-add-student">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-students"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No students found"
              description={`No students match "${searchQuery}"`}
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
          <StudentTable 
            students={filteredStudents} 
            onViewPayments={handleViewPayments}
            onDeleteStudent={handleDeleteClick}
          />
        )}
      </main>

      <AddStudentDialog
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        batchName={batch.name}
        onSubmit={(data) => {
          addStudentMutation.mutate({
            batchId: batch.id,
            ...data,
          });
        }}
      />

      {selectedStudentId && (
        <PaymentHistoryDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          studentId={selectedStudentId}
          batchFee={batch.fee}
        />
      )}

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        batchName={batch.name}
        registrationUrl={`${window.location.origin}/register/${batch.registrationToken}`}
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
