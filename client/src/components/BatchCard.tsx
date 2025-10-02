import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, IndianRupee, QrCode, Link as LinkIcon } from "lucide-react";
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
}: BatchCardProps) {
  return (
    <Card className="p-6 hover-elevate">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold" data-testid="text-batch-name">{name}</h3>
            </div>
            {subject && (
              <p className="text-sm text-muted-foreground">{subject}</p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Users className="w-3 h-3 mr-1" />
            {studentCount || 0}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <IndianRupee className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">₹{fee.toLocaleString()}</span>
          <span className="text-muted-foreground">/ {feePeriod}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onViewDetails} 
            className="flex-1"
            data-testid="button-view-batch"
          >
            View Details
          </Button>
          <Button 
            onClick={onShowQR} 
            variant="outline" 
            size="icon"
            data-testid="button-show-qr"
          >
            <QrCode className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onCopyLink} 
            variant="outline" 
            size="icon"
            data-testid="button-copy-link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
