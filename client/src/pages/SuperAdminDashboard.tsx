import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import TeacherCard from "@/components/TeacherCard";
import EmptyState from "@/components/EmptyState";
import CreateTeacherDialog from "@/components/CreateTeacherDialog";
import { Plus, Search, Users, BookOpen, GraduationCap, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const teachers = [
    {
      id: '1',
      fullName: 'Priya Sharma',
      username: 'priya.sharma',
      email: 'priya@example.com',
      phone: '+91 98765 43210',
      isActive: true,
      batchCount: 5,
      studentCount: 125,
    },
    {
      id: '2',
      fullName: 'Rajesh Kumar',
      username: 'rajesh.kumar',
      email: 'rajesh@example.com',
      phone: '+91 98765 43211',
      isActive: true,
      batchCount: 3,
      studentCount: 78,
    },
    {
      id: '3',
      fullName: 'Amit Patel',
      username: 'amit.patel',
      phone: '+91 98765 43212',
      isActive: false,
      batchCount: 2,
      studentCount: 45,
    },
  ];

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalBatches = teachers.reduce((sum, t) => sum + t.batchCount, 0);
  const totalStudents = teachers.reduce((sum, t) => sum + t.studentCount, 0);

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
            <Button variant="outline" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total Teachers" value={teachers.length} icon={Users} />
          <StatCard title="Total Batches" value={totalBatches} icon={BookOpen} />
          <StatCard title="Total Students" value={totalStudents} icon={GraduationCap} />
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
                onViewDetails={() => console.log('View teacher', teacher.id)}
                onToggleStatus={() => {
                  console.log('Toggle status', teacher.id);
                  toast({
                    title: teacher.isActive ? "Teacher deactivated" : "Teacher activated",
                    description: `${teacher.fullName} has been ${teacher.isActive ? 'deactivated' : 'activated'}`,
                  });
                }}
                onDelete={() => {
                  console.log('Delete teacher', teacher.id);
                  toast({
                    title: "Teacher deleted",
                    description: `${teacher.fullName} has been removed from the system`,
                    variant: "destructive",
                  });
                }}
              />
            ))}
          </div>
        )}
      </main>

      <CreateTeacherDialog
        open={createTeacherOpen}
        onOpenChange={setCreateTeacherOpen}
        onSubmit={(data) => {
          console.log('Create teacher:', data);
          toast({
            title: "Teacher created!",
            description: `${data.fullName} has been added to the system`,
          });
        }}
      />
    </div>
  );
}
