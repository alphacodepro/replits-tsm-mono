import { Fragment, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Eye, Mail, Phone, Trash2, Calendar, GraduationCap, Edit, ChevronDown, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { studentApi, type Payment } from "@/lib/api";

function formatJoinDate(joinDate: string): string {
  const date = new Date(joinDate);
  return isNaN(date.getTime()) ? joinDate : format(date, "dd MMM yyyy");
}

interface Student {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  standard: string;
  joinDate: string;
  totalPaid: number;
  totalDue: number;
  totalFee?: number;
  batchName?: string;
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
  columnMode?: "class" | "batch";
  hideEditDelete?: boolean;
  hideStatus?: boolean;
  showFee?: boolean;
  emptyMessage?: string;
  keepLayoutOnEmpty?: boolean;
}

interface InlinePaymentsProps {
  payments: Payment[];
  totalFee: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function InlinePayments({
  payments,
  totalFee,
  isLoading,
  isError,
  onRetry,
}: InlinePaymentsProps) {
  const paymentGridClass =
    "grid grid-cols-2 gap-x-4 sm:grid-cols-[1fr_1fr_1.4fr_1fr] sm:items-center";

  if (isLoading) {
    return (
      <div className="space-y-2 py-1" aria-label="Loading payments">
        {[0, 1].map((item) => (
          <div
            key={item}
            className={`${paymentGridClass} rounded-xl border border-border/50 bg-background/70 px-4 py-3`}
          >
            <div className="h-3.5 animate-pulse rounded bg-muted" />
            <div className="h-3.5 animate-pulse rounded bg-muted" />
            <div className="hidden h-3.5 animate-pulse rounded bg-muted sm:block" />
            <div className="hidden h-3.5 animate-pulse rounded bg-muted sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center gap-3 py-5 text-sm text-muted-foreground">
        <span>Could not load payments.</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={(event) => {
            event.stopPropagation();
            onRetry();
          }}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="py-5 text-center text-sm text-muted-foreground">
        No payments recorded yet
      </p>
    );
  }

  return (
    <div>
      <div
        className={`${paymentGridClass} border-b border-border/50 bg-muted/20 px-4 py-2 text-xs font-medium text-muted-foreground`}
      >
        <span>Date</span>
        <span className="text-right sm:text-left">Amount Paid</span>
        <span className="hidden sm:block">Method</span>
        <span className="hidden text-right sm:block">Remaining</span>
      </div>
      <div className="divide-y divide-border/40">
        {payments.map((payment, index) => {
          const paidSoFar = payments
            .slice(0, index + 1)
            .reduce((sum, item) => sum + item.amount, 0);
          const remainingAtTime = totalFee - paidSoFar;

          return (
            <div
              key={payment.id}
              className={`${paymentGridClass} gap-y-1 px-3 py-3 text-sm sm:px-4`}
              data-testid={`inline-payment-${payment.id}`}
            >
              <div className="text-foreground/80">
                {format(new Date(payment.paidAt), "dd MMM yyyy")}
                {payment.modifiedAt && (
                  <span className="ml-1 text-[10px] italic text-muted-foreground">
                    (edited)
                  </span>
                )}
              </div>
              <div className="text-right font-mono font-semibold text-chart-2 sm:text-left">
                ₹{payment.amount.toLocaleString()}
              </div>
              <div className="text-muted-foreground">
                {payment.paymentMethod || "—"}
              </div>
              <div className="text-right font-mono text-chart-3">
                ₹{remainingAtTime.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
  columnMode = "class",
  hideEditDelete = false,
  hideStatus = false,
  showFee = false,
  emptyMessage = "No students added yet",
  keepLayoutOnEmpty = false,
}: StudentTableProps) {
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const expandedStudent = students.find(
    (student) => student.id === expandedStudentId,
  );
  const {
    data: expandedStudentData,
    isLoading: isLoadingPayments,
    isError: isPaymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["/api/students", expandedStudentId],
    queryFn: () => studentApi.get(expandedStudentId!),
    enabled: !!expandedStudentId,
  });

  useEffect(() => {
    if (
      expandedStudentId &&
      !students.some((student) => student.id === expandedStudentId)
    ) {
      setExpandedStudentId(null);
    }
  }, [expandedStudentId, students]);

  useEffect(() => {
    if (!expandedStudentId) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        !target.closest("[data-student-payment-section]")
      ) {
        setExpandedStudentId(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedStudentId(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [expandedStudentId]);

  const toggleExpandedStudent = (studentId: string) => {
    setExpandedStudentId((currentId) =>
      currentId === studentId ? null : studentId,
    );
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent,
    studentId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpandedStudent(studentId);
    }
  };

  const expandedPayments = expandedStudentData?.payments ?? [];
  const expandedTotalFee =
    expandedStudent?.totalFee ??
    (expandedStudent
      ? expandedStudent.totalPaid + expandedStudent.totalDue
      : 0);
  const totalColumns =
    (selectionMode ? 1 : 0) + 4 + (hideStatus ? 0 : 1) + 1 + 2;

  if (students.length === 0 && !keepLayoutOnEmpty) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const isEmpty = students.length === 0;

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isEmpty && (
          <Card
            className="min-h-[240px] flex items-center justify-center p-8 text-center text-muted-foreground"
            data-testid="text-no-results"
          >
            {emptyMessage}
          </Card>
        )}
        {students.map((student) => {
          const isSelected = selectedIds.has(student.id);
          const isPaid = student.totalDue === 0;
          const canSelect = selectionMode && !isPaid;
          const isExpanded = expandedStudentId === student.id;

          return (
            <Card
              key={student.id}
              className={`cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 ${isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : ""} ${isExpanded ? "border-primary/20 bg-muted/25 shadow-sm" : "hover-elevate"}`}
              data-testid={`card-student-${student.id}`}
              data-student-payment-section
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => toggleExpandedStudent(student.id)}
              onKeyDown={(event) => handleRowKeyDown(event, student.id)}
            >
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {selectionMode && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => canSelect && onToggleSelect?.(student.id)}
                        onClick={(event) => event.stopPropagation()}
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
                        <span>{columnMode === "batch" ? student.batchName : `Class ${student.standard}`}</span>
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
                  {!showFee && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatJoinDate(student.joinDate)}</span>
                    </div>
                  )}
                </div>

                <div className={`grid ${showFee ? "grid-cols-3" : "grid-cols-2"} gap-4 pt-3 border-t`}>
                  {showFee && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fee</p>
                      <p className="font-semibold" data-testid={`text-fee-${student.id}`}>{formatCurrency(student.totalFee ?? 0)}</p>
                    </div>
                  )}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      onViewPayments(student.id);
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={disableActions}
                    data-testid={`button-view-payments-${student.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Payments
                  </Button>
                  {!hideEditDelete && (
                    <>
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditStudent(student.id);
                        }}
                        variant="outline"
                        size="icon"
                        disabled={disableActions}
                        data-testid={`button-edit-student-${student.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteStudent(student.id);
                        }}
                        variant="outline"
                        size="icon"
                        disabled={disableActions}
                        data-testid={`button-delete-student-${student.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 border-t border-border/60 duration-200">
                  <InlinePayments
                    payments={expandedPayments}
                    totalFee={expandedTotalFee}
                    isLoading={isLoadingPayments}
                    isError={isPaymentsError}
                    onRetry={() => void refetchPayments()}
                  />
                  <div className="flex justify-center border-t border-border/50 py-1.5">
                    <ChevronDown className="h-4 w-4 rotate-180 text-muted-foreground/60" />
                  </div>
                </div>
              )}
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
              <TableHead className="font-semibold">{columnMode === "batch" ? "Batch" : "Class"}</TableHead>
              {showFee ? (
                <TableHead className="text-right font-semibold">Fee</TableHead>
              ) : (
                <TableHead className="font-semibold">Join Date</TableHead>
              )}
              <TableHead className="text-right font-semibold">Paid</TableHead>
              <TableHead className="text-right font-semibold">Due</TableHead>
              {!hideStatus && (
                <TableHead className="text-right font-semibold">Status</TableHead>
              )}
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty && (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="h-[240px] text-center text-muted-foreground align-middle"
                  data-testid="text-no-results"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {students.map((student) => {
              const isSelected = selectedIds.has(student.id);
              const isPaid = student.totalDue === 0;
              const canSelect = selectionMode && !isPaid;
              const isExpanded = expandedStudentId === student.id;

              return (
                <Fragment key={student.id}>
                <TableRow
                  className={`cursor-pointer hover-elevate transition-all duration-200 ${isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : ""} ${isExpanded ? "border-primary/20 bg-muted/25" : ""}`}
                  data-testid={`row-student-${student.id}`}
                  data-student-payment-section
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? "Hide" : "Show"} payments for ${student.fullName}`}
                  onClick={() => toggleExpandedStudent(student.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, student.id)}
                >
                  {selectionMode && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => canSelect && onToggleSelect?.(student.id)}
                        onClick={(event) => event.stopPropagation()}
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
                  <TableCell>{columnMode === "batch" ? student.batchName : student.standard}</TableCell>
                  {showFee ? (
                    <TableCell className="text-right font-mono" data-testid={`text-fee-${student.id}`}>{formatCurrency(student.totalFee ?? 0)}</TableCell>
                  ) : (
                    <TableCell>{formatJoinDate(student.joinDate)}</TableCell>
                  )}
                  <TableCell className="text-right font-mono text-chart-2">{formatCurrency(student.totalPaid)}</TableCell>
                  <TableCell className="text-right font-mono text-chart-3">{formatCurrency(student.totalDue)}</TableCell>
                  {!hideStatus && (
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
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          onViewPayments(student.id);
                        }}
                        variant="ghost"
                        size="sm"
                        disabled={disableActions}
                        data-testid={`button-view-payments-${student.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Payments
                      </Button>
                      {!hideEditDelete && (
                        <>
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditStudent(student.id);
                            }}
                            variant="ghost"
                            size="icon"
                            disabled={disableActions}
                            data-testid={`button-edit-student-${student.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteStudent(student.id);
                            }}
                            variant="ghost"
                            size="icon"
                            disabled={disableActions}
                            data-testid={`button-delete-student-${student.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow
                    className="border-primary/20 bg-muted/25 hover:bg-muted/25"
                    data-testid={`expanded-student-${student.id}`}
                    data-student-payment-section
                  >
                    <TableCell colSpan={totalColumns} className="p-0">
                      <div
                        className="animate-in fade-in slide-in-from-top-2 cursor-pointer px-3 py-2 duration-200"
                        role="button"
                        tabIndex={0}
                        aria-label={`Collapse payments for ${student.fullName}`}
                        onClick={() => toggleExpandedStudent(student.id)}
                        onKeyDown={(event) => handleRowKeyDown(event, student.id)}
                      >
                        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/80 shadow-sm">
                          <InlinePayments
                            payments={expandedPayments}
                            totalFee={expandedTotalFee}
                            isLoading={isLoadingPayments}
                            isError={isPaymentsError}
                            onRetry={() => void refetchPayments()}
                          />
                        </div>
                        <div className="flex justify-center pt-1.5">
                          <ChevronDown className="h-4 w-4 rotate-180 text-muted-foreground/60" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
