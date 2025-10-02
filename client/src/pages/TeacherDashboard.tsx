import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import BatchCard from "@/components/BatchCard";
import EmptyState from "@/components/EmptyState";
import CreateBatchDialog from "@/components/CreateBatchDialog";
import QRCodeDialog from "@/components/QRCodeDialog";
import { Plus, Search, BookOpen, Users, IndianRupee, Clock, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const batches = [
    {
      id: '1',
      name: 'Mathematics Class 10',
      subject: 'Advanced Mathematics',
      fee: 5000,
      feePeriod: 'month',
      studentCount: 25,
      registrationToken: 'abc123',
    },
    {
      id: '2',
      name: 'Physics Class 12',
      subject: 'Mechanics & Waves',
      fee: 6000,
      feePeriod: 'month',
      studentCount: 18,
      registrationToken: 'def456',
    },
    {
      id: '3',
      name: 'Chemistry Basics',
      fee: 4500,
      feePeriod: 'month',
      studentCount: 30,
      registrationToken: 'ghi789',
    },
  ];

  const filteredBatches = batches.filter((batch) =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (batch.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalStudents = batches.reduce((sum, b) => sum + b.studentCount, 0);

  const handleShowQR = (batch: any) => {
    setSelectedBatch(batch);
    setQrDialogOpen(true);
  };

  const handleCopyLink = (batch: any) => {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Teacher</p>
              </div>
            </div>
            <Button variant="outline" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Batches" value={batches.length} icon={BookOpen} />
          <StatCard title="Total Students" value={totalStudents} icon={Users} />
          <StatCard title="Fees Collected" value="₹45,000" icon={IndianRupee} />
          <StatCard title="Pending Payments" value="₹12,000" icon={Clock} />
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Batches</h2>
            <Button onClick={() => setCreateBatchOpen(true)} data-testid="button-create-batch">
              <Plus className="w-4 h-4 mr-2" />
              Create Batch
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-batches"
            />
          </div>
        </div>

        {filteredBatches.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No batches found"
              description={`No batches match "${searchQuery}"`}
            />
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No batches yet"
              description="Get started by creating your first batch to organize your students and manage their fees"
              actionLabel="Create First Batch"
              onAction={() => setCreateBatchOpen(true)}
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches.map((batch) => (
              <BatchCard
                key={batch.id}
                {...batch}
                onViewDetails={() => console.log('View batch', batch.id)}
                onShowQR={() => handleShowQR(batch)}
                onCopyLink={() => handleCopyLink(batch)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateBatchDialog
        open={createBatchOpen}
        onOpenChange={setCreateBatchOpen}
        onSubmit={(data) => {
          console.log('Create batch:', data);
          toast({
            title: "Batch created!",
            description: `${data.name} has been created successfully`,
          });
        }}
      />

      {selectedBatch && (
        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          batchName={selectedBatch.name}
          registrationUrl={`${window.location.origin}/register/${selectedBatch.registrationToken}`}
        />
      )}
    </div>
  );
}
