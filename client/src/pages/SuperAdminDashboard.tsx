import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import TeacherCard from "@/components/TeacherCard";
import EmptyState from "@/components/EmptyState";
import CreateTeacherDialog from "@/components/CreateTeacherDialog";
import TeacherDetailsDialog from "@/components/TeacherDetailsDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Plus, Search, Users, BookOpen, GraduationCap, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { teacherApi, statsApi, authApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<{ id: string; fullName: string } | null>(null);
  const [detailsTeacherId, setDetailsTeacherId] = useState<string | null>(null);

  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/teachers"],
    queryFn: () => teacherApi.list(),
  });

  const { data: statsData } = useQuery({
    queryKey: ["/api/stats/system"],
    queryFn: () => statsApi.system(),
  });

  const createTeacherMutation = useMutation({
    mutationFn: teacherApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/system"] });
      setCreateTeacherOpen(false);
      toast({
        title: "Teacher created!",
        description: `${data.teacher.fullName} has been added to the system`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating teacher",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      teacherApi.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating teacher status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: teacherApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/system"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting teacher",
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

  const teachers = teachersData?.teachers || [];
  const stats = statsData || { teacherCount: 0, batchCount: 0, studentCount: 0 };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    toggleStatusMutation.mutate({ id, isActive: newStatus });
    toast({
      title: newStatus ? "Teacher activated" : "Teacher deactivated",
      description: `Teacher has been ${newStatus ? 'activated' : 'deactivated'}`,
    });
  };

  const handleDelete = (id: string, fullName: string) => {
    setTeacherToDelete({ id, fullName });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teacherToDelete) {
      deleteTeacherMutation.mutate(teacherToDelete.id);
      toast({
        title: "Teacher deleted",
        description: `${teacherToDelete.fullName} has been removed from the system`,
        variant: "destructive",
      });
      setDeleteConfirmOpen(false);
      setTeacherToDelete(null);
    }
  };

  if (teachersLoading) {
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
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Overview & Management</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total Teachers" value={stats.teacherCount} icon={Users} />
          <StatCard title="Total Batches" value={stats.batchCount} icon={BookOpen} />
          <StatCard title="Total Students" value={stats.studentCount} icon={GraduationCap} />
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Teachers</h2>
            <Button onClick={() => setCreateTeacherOpen(true)} data-testid="button-create-teacher">
              <Plus className="w-4 h-4 mr-2" />
              Create Teacher
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-teachers"
            />
          </div>
        </div>

        {filteredTeachers.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No teachers found"
              description={`No teachers match "${searchQuery}"`}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No teachers yet"
              description="Get started by creating teacher accounts to manage the system"
              actionLabel="Create First Teacher"
              onAction={() => setCreateTeacherOpen(true)}
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                {...teacher}
                onViewDetails={() => setDetailsTeacherId(teacher.id)}
                onToggleStatus={() => handleToggleStatus(teacher.id, teacher.isActive)}
                onDelete={() => handleDelete(teacher.id, teacher.fullName)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateTeacherDialog
        open={createTeacherOpen}
        onOpenChange={setCreateTeacherOpen}
        onSubmit={(data) => createTeacherMutation.mutate(data)}
      />

      <TeacherDetailsDialog
        teacherId={detailsTeacherId}
        open={!!detailsTeacherId}
        onOpenChange={(open) => !open && setDetailsTeacherId(null)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${teacherToDelete?.fullName}? This will permanently delete all batches, students, and payment records associated with this teacher. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete Teacher"
        destructive
      />
    </div>
  );
}
