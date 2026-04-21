import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Mail, Phone, Trash2, Calendar, GraduationCap, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Student {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  standard: string;
  joinDate: string;
  totalPaid: number;
  totalDue: number;
}

interface StudentTableProps {
  students: Student[];
  onViewPayments: (studentId: string) => void;
  onEditStudent: (studentId: string) => void;
  onDeleteStudent: (studentId: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  allVisibleSelected?: boolean;
  onToggleAll?: () => void;
  disableActions?: boolean;
}

export default function StudentTable({
  students,
  onViewPayments,
  onEditStudent,
  onDeleteStudent,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelect,
  allVisibleSelected = false,
  onToggleAll,
  disableActions = false,
}: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        No students added yet
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {students.map((student) => {
          const isSelected = selectedIds.has(student.id);
          const isPaid = student.totalDue === 0;
          const canSelect = selectionMode && !isPaid;

          return (
            <Card
              key={student.id}
              className={`p-4 rounded-2xl hover-elevate transition-colors ${isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : ""}`}
              data-testid={`card-student-${student.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {selectionMode && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => canSelect && onToggleSelect?.(student.id)}
                        disabled={isPaid}
                        className="mt-1 flex-shrink-0"
                        data-testid={`checkbox-student-${student.id}`}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" data-testid={`text-student-name-${student.id}`}>
                        {student.fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4" />
                        <span>Class {student.standard}</span>
                      </div>
                    </div>
                  </div>
                  {isPaid ? (
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20 rounded-full">
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20 rounded-full">
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{student.phone}</span>
                  </div>
                  {student.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{student.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {student.joinDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fees Paid</p>
                    <p className="font-semibold text-chart-2">{formatCurrency(student.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Due Amount</p>
                    <p className="font-semibold text-chart-3">{formatCurrency(student.totalDue)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    onClick={() => onViewPayments(student.id)}
                    variant="outline"
                    className="flex-1"
                    disabled={disableActions}
                    data-testid={`button-view-payments-${student.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Payments
                  </Button>
                  <Button
                    onClick={() => onEditStudent(student.id)}
                    variant="outline"
                    size="icon"
                    disabled={disableActions}
                    data-testid={`button-edit-student-${student.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onDeleteStudent(student.id)}
                    variant="outline"
                    size="icon"
                    disabled={disableActions}
                    data-testid={`button-delete-student-${student.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-2xl overflow-hidden shadow-md">
        <Table>
          <TableHeader className="sticky top-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              {selectionMode && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={onToggleAll}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
              )}
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Class</TableHead>
              <TableHead className="font-semibold">Join Date</TableHead>
              <TableHead className="text-right font-semibold">Paid</TableHead>
              <TableHead className="text-right font-semibold">Due</TableHead>
              <TableHead className="text-right font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const isSelected = selectedIds.has(student.id);
              const isPaid = student.totalDue === 0;
              const canSelect = selectionMode && !isPaid;

              return (
                <TableRow
                  key={student.id}
                  className={`hover-elevate transition-all duration-200 ${isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : ""}`}
                >
                  {selectionMode && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => canSelect && onToggleSelect?.(student.id)}
                        disabled={isPaid}
                        data-testid={`checkbox-student-${student.id}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium" data-testid={`text-student-name-${student.id}`}>
                    {student.fullName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {student.phone}
                      </div>
                      {student.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{student.standard}</TableCell>
                  <TableCell>{student.joinDate}</TableCell>
                  <TableCell className="text-right font-mono text-chart-2">{formatCurrency(student.totalPaid)}</TableCell>
                  <TableCell className="text-right font-mono text-chart-3">{formatCurrency(student.totalDue)}</TableCell>
                  <TableCell className="text-right">
                    {isPaid ? (
                      <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20 rounded-full">
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20 rounded-full">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => onViewPayments(student.id)}
                        variant="ghost"
                        size="sm"
                        disabled={disableActions}
                        data-testid={`button-view-payments-${student.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Payments
                      </Button>
                      <Button
                        onClick={() => onEditStudent(student.id)}
                        variant="ghost"
                        size="icon"
                        disabled={disableActions}
                        data-testid={`button-edit-student-${student.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onDeleteStudent(student.id)}
                        variant="ghost"
                        size="icon"
                        disabled={disableActions}
                        data-testid={`button-delete-student-${student.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
