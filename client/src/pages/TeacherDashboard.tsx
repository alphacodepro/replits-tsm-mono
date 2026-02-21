import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StatCard from "@/components/StatCard";
import BatchCard from "@/components/BatchCard";
import EmptyState from "@/components/EmptyState";
import CreateBatchDialog from "@/components/CreateBatchDialog";
import QRCodeDialog from "@/components/QRCodeDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import ChangeCredentialsDialog from "@/components/ChangeCredentialsDialog";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  IndianRupee,
  Clock,
  LogOut,
  Eye,
  EyeOff,
  Settings,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchApi, dashboardApi, authApi, whatsappApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import WhatsappUsageWidget from "@/components/WhatsappUsageWidget";

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<any>(null);
  const [showStats, setShowStats] = useState(true);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [showBatchDetails, setShowBatchDetails] = useState(true);

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => authApi.me(),
  });

  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ["/api/batches"],
    queryFn: () => batchApi.list(),
    placeholderData: (previousData) => previousData,
  });

  const { data: summaryData } = useQuery({
    queryKey: ["/api/dashboard/summary"],
    queryFn: () => dashboardApi.summary(),
    placeholderData: (previousData) => previousData,
  });

  const { data: waUsage, isLoading: waLoading } = useQuery({
    queryKey: ["/api/whatsapp/usage"],
    queryFn: () => whatsappApi.getUsage(),
  });

  const waActive = !!waUsage?.enabled;

  const createBatchMutation = useMutation({
    mutationFn: batchApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
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
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
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
  const stats = summaryData || {
    batchCount: 0,
    studentCount: 0,
    totalCollected: 0,
    totalPending: 0,
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
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

  const handleDeleteClick = (batch: any) => {
    setBatchToDelete(batch);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (batchToDelete) {
      deleteBatchMutation.mutate(batchToDelete.id);
      setDeleteConfirmOpen(false);
      setBatchToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (batchesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 flex flex-col">
      <header className="border-b bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {userData?.user?.fullName ? (
                    getInitials(userData.user.fullName)
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {userData?.user?.instituteName || "Teacher Dashboard"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {userData?.user?.fullName || "Teacher"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCredentialsDialogOpen(true)}
                className="hover:scale-105 transition-transform duration-200"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="hover:scale-105 transition-transform duration-200"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row flex-wrap gap-6">
          <aside className="lg:w-56 flex-shrink-0 lg:sticky lg:top-4 lg:self-start z-30" data-testid="mini-insights-panel">
            <div className="flex">
              <div className={`w-1 flex-shrink-0 rounded-l-md transition-colors duration-300 ${waActive ? "bg-emerald-500/60" : "bg-border/40"}`} />
              <div className="flex-1 rounded-r-md border border-l-0 border-border/40 bg-muted/30 p-4 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Insights</h3>
                <WhatsappUsageWidget usage={waUsage ?? null} isLoading={waLoading} />
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  Dashboard Overview
                </h2>
                <Button
                  onClick={() => setShowStats(!showStats)}
                  variant="outline"
                  size="icon"
                  data-testid="button-toggle-stats"
                >
                  {showStats ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6"></div>
            </div>

            {showStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Batches"
                  value={stats.batchCount}
                  icon={BookOpen}
                />
                <StatCard
                  title="Total Students"
                  value={stats.studentCount}
                  icon={Users}
                />
                <StatCard
                  title="Fees Collected"
                  value={`₹${stats.totalCollected.toLocaleString()}`}
                  icon={IndianRupee}
                  valueColor="text-chart-2"
                />
                <StatCard
                  title="Pending Payments"
                  value={`₹${stats.totalPending.toLocaleString()}`}
                  icon={Clock}
                  valueColor="text-chart-3"
                />
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Batches
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowBatchDetails(!showBatchDetails)}
                    variant="outline"
                    size="icon"
                    data-testid="button-toggle-batch-details"
                  >
                    {showBatchDetails ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setCreateBatchOpen(true)}
                    className="shadow-md"
                    data-testid="button-create-batch"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Batch
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    {...batch}
                    showDetails={showBatchDetails}
                    onViewDetails={() => handleViewDetails(batch.id)}
                    onShowQR={() => handleShowQR(batch)}
                    onCopyLink={() => handleCopyLink(batch)}
                    onDelete={() => handleDeleteClick(batch)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © 2026 Tuition Management System. All rights reserved.
          </p>
        </div>
      </footer>

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
          registrationEnabled={selectedBatch.registrationEnabled}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Batch"
        description={`Are you sure you want to delete "${batchToDelete?.name}"? This will permanently delete all students and payment records in this batch. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete Batch"
        destructive
      />

      <ChangeCredentialsDialog
        open={credentialsDialogOpen}
        onOpenChange={setCredentialsDialogOpen}
        currentUsername={userData?.user?.username || ""}
        onSuccess={() => {
          queryClient.setQueryData(["/api/auth/me"], null);
          queryClient.clear();
          setLocation("/");
        }}
      />
    </div>
  );
}
