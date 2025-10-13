import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  valueColor?: string;
}

export default function StatCard({ title, value, icon: Icon, iconBgColor = "bg-primary/10", valueColor }: StatCardProps) {
  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start gap-4">
        <div className={`${iconBgColor} p-3 rounded-md`}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${valueColor || ''}`} data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
