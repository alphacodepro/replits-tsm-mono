import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, BookOpen, Users, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeacherCardProps {
  id: string;
  fullName: string;
  username: string;
  instituteName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  batchCount: number;
  studentCount: number;
  onViewDetails: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export default function TeacherCard({
  fullName,
  username,
  instituteName,
  email,
  phone,
  isActive,
  batchCount,
  studentCount,
  onViewDetails,
  onToggleStatus,
  onDelete,
}: TeacherCardProps) {
  return (
    <Card className="p-6 hover-elevate h-full">
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-primary/10 p-3 rounded-md">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold" data-testid="text-institute-name">
                  {instituteName || "No Institute"}
                </h3>
                {isActive ? (
                  <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-teacher-name">{fullName}</p>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-teacher-menu">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleStatus}>
                {isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm flex-1">
          {email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              {email}
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              {phone}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{batchCount}</span>
            <span className="text-muted-foreground">Batches</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{studentCount}</span>
            <span className="text-muted-foreground">Students</span>
          </div>
        </div>

        <Button 
          onClick={onViewDetails} 
          variant="outline" 
          className="w-full"
          data-testid="button-view-teacher-details"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
