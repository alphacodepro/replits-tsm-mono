import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, IndianRupee, QrCode, Link as LinkIcon, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BatchCardProps {
  id: string;
  name: string;
  subject?: string;
  fee: number;
  feePeriod: string;
  studentCount?: number;
  onViewDetails: () => void;
  onShowQR: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

export default function BatchCard({
  name,
  subject,
  fee,
  feePeriod,
  studentCount,
  onViewDetails,
  onShowQR,
  onCopyLink,
  onDelete,
}: BatchCardProps) {
  const [showDetails, setShowDetails] = useState(true);

  return (
    <Card className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-batch-name">{name}</h3>
            </div>
            {showDetails && (
              <div className="flex flex-col gap-2">
                {subject && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{subject}</p>
                )}
                <div className="inline-flex items-center text-sm leading-tight">
                  <IndianRupee className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white leading-tight">{fee.toLocaleString()}</span>
                  <span className="text-gray-500 dark:text-gray-400 leading-tight ml-1">/ {feePeriod}</span>
                </div>
              </div>
            )}
          </div>
          <Badge variant="outline" className="shrink-0 h-fit">
            <Users className="w-3.5 h-3.5 mr-1" />
            <span className="text-base font-semibold">{studentCount || 0}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button 
            onClick={onViewDetails} 
            className="flex-1 hover:scale-105 transition-transform duration-200"
            data-testid="button-view-batch"
          >
            View Details
          </Button>
          <Button 
            onClick={() => setShowDetails(!showDetails)} 
            variant="outline" 
            size="icon"
            className="hover:scale-105 transition-transform duration-200"
            data-testid="button-toggle-details"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={onShowQR} 
            variant="outline" 
            size="icon"
            className="hover:scale-105 transition-transform duration-200"
            data-testid="button-show-qr"
          >
            <QrCode className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onCopyLink} 
            variant="outline" 
            size="icon"
            className="hover:scale-105 transition-transform duration-200"
            data-testid="button-copy-link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onDelete} 
            variant="outline" 
            size="icon"
            className="hover:scale-105 transition-transform duration-200"
            data-testid="button-delete-batch"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
