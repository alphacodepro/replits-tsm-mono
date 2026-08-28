import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, BookOpen, Users, MoreVertical, MessageCircle, DatabaseBackup } from "lucide-react";
import type { DailyBackupStatus } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  whatsappEnabled: boolean;
  waBusinessEnabled: boolean;
  feeCollectionEnabled: boolean;
  dailyBackupEnabled: boolean;
  lastBackup: DailyBackupStatus | null;
  batchCount: number;
  studentCount: number;
  onViewDetails: () => void;
  onToggleStatus: () => void;
  onToggleWhatsapp: () => void;
  onToggleWaBusiness: () => void;
  onToggleFeeCollection: () => void;
  onToggleDailyBackup: () => void;
  onRunDailyBackup: () => void;
  onDelete: () => void;
}

export default function TeacherCard({
  fullName,
  username,
  instituteName,
  email,
  phone,
  isActive,
  whatsappEnabled,
  waBusinessEnabled,
  feeCollectionEnabled,
  dailyBackupEnabled,
  lastBackup,
  batchCount,
  studentCount,
  onViewDetails,
  onToggleStatus,
  onToggleWhatsapp,
  onToggleWaBusiness,
  onToggleFeeCollection,
  onToggleDailyBackup,
  onRunDailyBackup,
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleWhatsapp} data-testid="button-toggle-whatsapp">
                {whatsappEnabled ? 'Disable SMS' : 'Enable SMS'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleWaBusiness} data-testid="button-toggle-wa-business">
                {waBusinessEnabled ? 'Disable WhatsApp' : 'Enable WhatsApp'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleFeeCollection} data-testid="button-toggle-fee-collection">
                {feeCollectionEnabled ? 'Disable Fee Collection Assistance' : 'Enable Fee Collection Assistance'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleDailyBackup} data-testid="button-toggle-daily-backup">
                {dailyBackupEnabled ? 'Disable Daily Backup' : 'Enable Daily Backup'}
              </DropdownMenuItem>
              {dailyBackupEnabled && (
                <DropdownMenuItem onClick={onRunDailyBackup} data-testid="button-run-daily-backup">
                  Run Backup Now
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {dailyBackupEnabled && (
          <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1" data-testid="daily-backup-status">
            <div className="flex items-center gap-2 font-medium">
              <DatabaseBackup className="w-4 h-4" />
              Daily Backup
            </div>
            <div className="text-muted-foreground">
              Last Backup: {lastBackup
                ? new Date(lastBackup.emailSentAt || lastBackup.generatedAt || `${lastBackup.backupDate}T00:00:00`).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not run yet"}
            </div>
            {lastBackup && (
              <div className={lastBackup.status === "sent" ? "text-green-700 dark:text-green-400" : lastBackup.status === "failed" ? "text-destructive" : "text-amber-700 dark:text-amber-400"}>
                Status: {lastBackup.status === "sent"
                  ? "✓ Generated & Email Sent"
                  : lastBackup.status === "failed"
                    ? `✕ Failed — ${lastBackup.errorMessage || "Backup failed"}`
                    : lastBackup.status === "generated"
                      ? "Generated — Email pending"
                      : "Generating"}
              </div>
            )}
            {lastBackup?.retryScheduled && (
              <div className="text-amber-700 dark:text-amber-400">Retry: Scheduled</div>
            )}
          </div>
        )}

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

        <div className="flex items-center gap-4 flex-wrap pt-2 border-t">
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
          {whatsappEnabled ? (
            <Badge variant="outline" className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/20" data-testid="badge-whatsapp-enabled">
              <MessageCircle className="w-3 h-3 mr-1" />
              SMS
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground" data-testid="badge-whatsapp-disabled">
              <MessageCircle className="w-3 h-3 mr-1" />
              SMS Off
            </Badge>
          )}
          {waBusinessEnabled ? (
            <Badge variant="outline" className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/20" data-testid="badge-wa-business-enabled">
              <MessageCircle className="w-3 h-3 mr-1" />
              WA
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground" data-testid="badge-wa-business-disabled">
              <MessageCircle className="w-3 h-3 mr-1" />
              WA Off
            </Badge>
          )}
          {feeCollectionEnabled && (
            <Badge variant="outline" className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/20" data-testid="badge-fee-collection-enabled">
              Fee Collection
            </Badge>
          )}
          <Badge variant="outline" className={dailyBackupEnabled ? "text-xs bg-chart-2/10 text-chart-2 border-chart-2/20" : "text-xs bg-muted text-muted-foreground"}>
            <DatabaseBackup className="w-3 h-3 mr-1" />
            {dailyBackupEnabled ? "Backup" : "Backup Off"}
          </Badge>
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
