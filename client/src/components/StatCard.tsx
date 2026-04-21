import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  valueColor?: string;
  tooltip?: string;
}

export default function StatCard({ title, value, icon: Icon, iconBgColor = "bg-primary/10", valueColor, tooltip }: StatCardProps) {
  const valueEl = (
    <p
      className={`text-3xl font-bold mt-1 ${valueColor || 'text-gray-900 dark:text-white'}`}
      data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {value}
    </p>
  );

  return (
    <Card className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover-elevate">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg blur-sm"></div>
          <div className={`relative ${iconBgColor} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          {tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">{valueEl}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm font-medium">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            valueEl
          )}
        </div>
      </div>
    </Card>
  );
}
