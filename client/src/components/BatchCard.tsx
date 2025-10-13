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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-primary transition-colors hover:text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-batch-name">{name}</h3>
            </div>
            {showDetails && subject && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{subject}</p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Users className="w-3 h-3 mr-1" />
            {studentCount || 0}
          </Badge>
        </div>

        {showDetails && (
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">₹{fee.toLocaleString()}</span>
            <span className="text-gray-500 dark:text-gray-400">/ {feePeriod}</span>
          </div>
        )}

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
