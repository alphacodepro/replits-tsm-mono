import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import BatchCard from "@/components/BatchCard";
import EmptyState from "@/components/EmptyState";
import CreateBatchDialog from "@/components/CreateBatchDialog";
import QRCodeDialog from "@/components/QRCodeDialog";
import { Plus, Search, BookOpen, Users, IndianRupee, Clock, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchApi, statsApi, authApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ["/api/batches"],
    queryFn: () => batchApi.list(),
  });

  const { data: statsData } = useQuery({
    queryKey: ["/api/stats/teacher"],
    queryFn: () => statsApi.teacher(),
  });

  const createBatchMutation = useMutation({
    mutationFn: batchApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      setCreateBatchOpen(false);
      toast({
        title: "Batch created!",
        description: `${data.batch.name} has been created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating batch",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: batchApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      toast({
        title: "Batch deleted",
        description: "The batch has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting batch",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const batches = batchesData?.batches || [];
  const stats = statsData || { batchCount: 0, studentCount: 0, feesCollected: 0, pendingPayments: 0 };

  const filteredBatches = batches.filter((batch) =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (batch.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

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

  const handleViewDetails = (batchId: string) => {
    setLocation(`/batch/${batchId}`);
  };

  if (batchesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

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
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Batches" value={stats.batchCount} icon={BookOpen} />
          <StatCard title="Total Students" value={stats.studentCount} icon={Users} />
          <StatCard title="Fees Collected" value={`₹${stats.feesCollected.toLocaleString()}`} icon={IndianRupee} />
          <StatCard title="Pending Payments" value={`₹${stats.pendingPayments.toLocaleString()}`} icon={Clock} />
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
                onViewDetails={() => handleViewDetails(batch.id)}
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
        onSubmit={(data) => createBatchMutation.mutate(data)}
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
