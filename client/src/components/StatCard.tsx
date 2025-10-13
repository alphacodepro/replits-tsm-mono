
import { Users, BookOpen, IndianRupee, Clock } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatCard title="Total Batches" value={12} icon={BookOpen} />
      <StatCard title="Total Students" value={145} icon={Users} />
      <StatCard title="Fees Collected" value="₹45,000" icon={IndianRupee} />
      <StatCard title="Pending Payments" value="₹12,000" icon={Clock} />
    </div>
  );
}
