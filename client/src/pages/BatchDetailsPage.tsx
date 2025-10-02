import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StudentTable from "@/components/StudentTable";
import AddStudentDialog from "@/components/AddStudentDialog";
import PaymentHistoryDialog from "@/components/PaymentHistoryDialog";
import EmptyState from "@/components/EmptyState";
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

export default function BatchDetailsPage() {
  const { toast } = useToast();
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const batch = {
    id: '1',
    name: 'Mathematics Class 10',
    subject: 'Advanced Mathematics',
    fee: 5000,
    feePeriod: 'month',
    registrationToken: 'abc123',
  };

  const students = [
    {
      id: '1',
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@example.com',
      standard: 'Class 10',
      joinDate: '2024-01-15',
      totalPaid: 15000,
      totalDue: 0,
    },
    {
      id: '2',
      fullName: 'Priya Patel',
      phone: '+91 98765 43211',
      email: 'priya@example.com',
      standard: 'Class 10',
      joinDate: '2024-02-01',
      totalPaid: 10000,
      totalDue: 5000,
    },
    {
      id: '3',
      fullName: 'Amit Kumar',
      phone: '+91 98765 43212',
      standard: 'Class 10',
      joinDate: '2024-02-10',
      totalPaid: 5000,
      totalDue: 10000,
    },
  ];

  const mockPayments = [
    { id: '1', amount: 5000, paidAt: '2024-01-15' },
    { id: '2', amount: 5000, paidAt: '2024-02-15' },
    { id: '3', amount: 5000, paidAt: '2024-03-15' },
  ];

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone.includes(searchQuery) ||
    (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalCollected = students.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalPending = students.reduce((sum, s) => sum + s.totalDue, 0);

  const handleViewPayments = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student);
    setPaymentDialogOpen(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/register/${batch.registrationToken}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Registration link copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" data-testid="button-back">
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
              <Button variant="outline" data-testid="button-show-qr-code">
                <QrCode className="w-4 h-4 mr-2" />
                Show QR
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Students</p>
            <p className="text-3xl font-bold">{students.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Fees Collected</p>
            <p className="text-3xl font-bold text-chart-2">₹{totalCollected.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Pending Payments</p>
            <p className="text-3xl font-bold text-chart-3">₹{totalPending.toLocaleString()}</p>
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
          <StudentTable students={filteredStudents} onViewPayments={handleViewPayments} />
        )}
      </main>

      <AddStudentDialog
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        batchName={batch.name}
        onSubmit={(data) => {
          console.log('Add student:', data);
          toast({
            title: "Student added!",
            description: `${data.fullName} has been added to ${batch.name}`,
          });
        }}
      />

      {selectedStudent && (
        <PaymentHistoryDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          studentName={selectedStudent.fullName}
          totalFee={batch.fee * 3}
          payments={mockPayments}
          onAddPayment={(amount) => {
            console.log('Add payment:', amount);
            toast({
              title: "Payment recorded!",
              description: `₹${amount.toLocaleString()} payment has been recorded`,
            });
          }}
        />
      )}
    </div>
  );
}
