import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  IndianRupee,
  QrCode,
  Link as LinkIcon,
  Trash2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BatchCardProps {
  id: string;
  name: string;
  subject?: string;
  fee: number;
  feePeriod: string;
  studentCount?: number;
  registrationEnabled: boolean;
  allStudentsFullyPaid?: boolean;
  createdAt?: string | Date;
  onViewDetails: () => void;
  onShowQR: () => void;
  onCopyLink: () => void;
  onDelete: () => void;

  // NEW: controlled by TeacherDashboard
  showDetails: boolean;
}

export default function BatchCard({
  name,
  subject,
  fee,
  feePeriod,
  studentCount,
  registrationEnabled,
  allStudentsFullyPaid,
  createdAt,
  onViewDetails,
  onShowQR,
  onCopyLink,
  onDelete,
  showDetails,
}: BatchCardProps) {
  return (
    <Card className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="space-y-4">
        {/* TOP SECTION */}
        <div className="flex justify-between gap-4">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>

              <h3
                className="text-lg font-semibold text-gray-900 dark:text-white"
                data-testid="text-batch-name"
              >
                {name}
              </h3>
            </div>

            {/* DETAILS (controlled globally) */}
            {showDetails && (
              <div className="flex flex-col gap-2">
                {subject && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subject}
                  </p>
                )}

                <div className="inline-flex items-center text-sm">
                  <IndianRupee className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {fee.toLocaleString()}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    / {feePeriod}
                  </span>
                </div>

                {createdAt && (
                  <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    Created: {format(new Date(createdAt), "dd MMM yyyy")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant="outline" className="h-fit">
              <Users className="w-3.5 h-3.5 mr-1" />
              <span className="text-base font-semibold">
                {studentCount || 0}
              </span>
            </Badge>

            {showDetails && (
              <>
                <Badge
                  variant={registrationEnabled ? "default" : "secondary"}
                  className="h-fit text-xs"
                  data-testid="badge-registration-status"
                >
                  {registrationEnabled ? "Open" : "Closed"}
                </Badge>

                {allStudentsFullyPaid && studentCount && studentCount > 0 && (
                  <Badge
                    variant="outline"
                    className="h-fit text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                    data-testid="badge-fully-paid"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Fully Paid
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={onViewDetails}
            className="flex-1 hover:scale-105 transition-transform"
            data-testid="button-view-batch"
          >
            View Details
          </Button>

          {/* 🔥 REMOVED INDIVIDUAL EYE BUTTON */}

          <Button
            onClick={onShowQR}
            variant="outline"
            size="icon"
            className="hover:scale-105 transition-transform"
            data-testid="button-show-qr"
          >
            <QrCode className="w-4 h-4" />
          </Button>

          <Button
            onClick={onCopyLink}
            variant="outline"
            size="icon"
            className="hover:scale-105 transition-transform"
            data-testid="button-copy-link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>

          <Button
            onClick={onDelete}
            variant="outline"
            size="icon"
            className="hover:scale-105 transition-transform"
            data-testid="button-delete-batch"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
