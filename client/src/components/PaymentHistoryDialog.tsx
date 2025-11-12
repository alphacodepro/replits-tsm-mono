import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, IndianRupee, Clock, CheckCircle, Pencil, Check, X } from "lucide-react";
import { studentApi, paymentApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  batchFee: number;
  feePeriod: string;
}

export default function PaymentHistoryDialog({
  open,
  onOpenChange,
  studentId,
  batchFee,
  feePeriod,
}: PaymentHistoryDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingFee, setEditingFee] = useState(false);
  const [customFeeInput, setCustomFeeInput] = useState("");

  const { data: studentData, isLoading } = useQuery({
    queryKey: ["/api/students", studentId],
    queryFn: () => studentApi.get(studentId),
    enabled: open && !!studentId,
  });

  const addPaymentMutation = useMutation({
    mutationFn: paymentApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      setAmount("");
      setShowAddPayment(false);
      
      // Show different message based on email status
      // emailSent can be: true (sent), false (attempted but failed), null (not attempted)
      if (data.emailSent === true) {
        toast({
          title: "Payment recorded & confirmation email sent",
          description: `₹${amount} payment has been recorded and confirmation email sent to student`,
        });
      } else if (data.emailSent === false) {
        // Email was attempted but failed to send
        toast({
          title: "Payment recorded but email failed to send",
          description: `₹${amount} payment has been recorded but the confirmation email could not be sent`,
          variant: "destructive",
        });
      } else {
        // Email was not attempted (student has no email or email system not configured)
        toast({
          title: "Payment recorded",
          description: `₹${amount} payment has been recorded successfully`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error recording payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ studentId, customFee }: { studentId: string; customFee: number | null }) =>
      studentApi.updateFee(studentId, customFee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      setEditingFee(false);
      toast({
        title: "Custom fee updated",
        description: "Student's custom fee has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating fee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const student = studentData?.student;
  const payments = studentData?.payments || [];
  const totalPaid = studentData?.totalPaid || 0;
  
  // Use customFee if set, otherwise calculate from batch fee
  let expectedTotalFee = student?.customFee || batchFee;
  if (student && !student.customFee && feePeriod === "month") {
    const joinMonths = Math.ceil(
      (new Date().getTime() - new Date(student.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    expectedTotalFee = batchFee * joinMonths;
  }
  
  const remaining = expectedTotalFee - totalPaid;

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = Number(amount);
    
    if (paymentAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Payment amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentAmount > remaining) {
      toast({
        title: "Amount exceeds remaining balance",
        description: `Maximum payment allowed is ₹${remaining.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    
    addPaymentMutation.mutate({
      studentId,
      amount: paymentAmount,
    });
  };

  const handleEditFee = () => {
    setCustomFeeInput(student?.customFee?.toString() || expectedTotalFee.toString());
    setEditingFee(true);
  };

  const handleSaveFee = () => {
    const newFee = Number(customFeeInput);
    if (isNaN(newFee) || newFee <= 0) {
      toast({
        title: "Invalid fee",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }
    if (newFee > batchFee) {
      toast({
        title: "Fee exceeds maximum",
        description: `Custom fee cannot exceed batch fee of ₹${batchFee.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    updateFeeMutation.mutate({ studentId, customFee: newFee });
  };

  const handleCancelEdit = () => {
    setEditingFee(false);
    setCustomFeeInput("");
  };

  const handleResetFee = () => {
    updateFeeMutation.mutate({ studentId, customFee: null });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Payment History - {student?.fullName || "Loading..."}</DialogTitle>
          <DialogDescription>
            View and manage payment records
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading payment history...</div>
        ) : (
          <div className="space-y-4 md:space-y-6 py-2 md:py-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg blur-sm"></div>
                    <div className="relative bg-primary/10 p-1.5 md:p-2 rounded-lg">
                      <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Fee</p>
                      {!editingFee && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleEditFee}
                          data-testid="button-edit-fee"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {editingFee ? (
                      <div className="space-y-1.5 mt-1">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={customFeeInput}
                            onChange={(e) => setCustomFeeInput(e.target.value)}
                            className="flex-1 min-w-[10rem] pr-2 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-ms-clear]:hidden"
                            placeholder="Enter fee"
                            data-testid="input-custom-fee"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveFee}
                            disabled={updateFeeMutation.isPending}
                            data-testid="button-save-fee"
                          >
                            <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            disabled={updateFeeMutation.isPending}
                            data-testid="button-cancel-edit-fee"
                          >
                            <X className="w-4 h-4 text-red-600 dark:text-red-500" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Maximum: ₹{batchFee.toLocaleString()}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-0.5 truncate" data-testid="text-total-fee">
                          ₹{expectedTotalFee.toLocaleString()}
                        </p>
                        {student?.customFee && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" data-testid="badge-custom-fee">
                            Custom
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-3 md:p-4 rounded-2xl border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-lg blur-sm"></div>
                    <div className="relative bg-chart-2/10 p-1.5 md:p-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-chart-2" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Paid</p>
                    <p className="text-lg md:text-xl font-bold text-chart-2 mt-0.5 truncate">₹{totalPaid.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-3 md:p-4 rounded-2xl border border-orange-100 dark:border-orange-800">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-lg blur-sm"></div>
                    <div className="relative bg-chart-3/10 p-1.5 md:p-2 rounded-lg">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-chart-3" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Remaining</p>
                    <p className="text-lg md:text-xl font-bold text-chart-3 mt-0.5 truncate">₹{remaining.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-md">
              <div className="max-h-64 md:max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                    <TableRow>
                      <TableHead className="font-semibold text-xs md:text-sm">Date</TableHead>
                      <TableHead className="text-right font-semibold text-xs md:text-sm">Amount Paid</TableHead>
                      <TableHead className="text-right font-semibold text-xs md:text-sm hidden sm:table-cell">Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                          No payments recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment, index) => {
                        const paidSoFar = payments
                          .slice(0, index + 1)
                          .reduce((sum, p) => sum + p.amount, 0);
                        const remainingAtTime = expectedTotalFee - paidSoFar;

                        return (
                          <TableRow key={payment.id} className="hover-elevate transition-all duration-200">
                            <TableCell className="text-xs md:text-sm">{format(new Date(payment.paidAt), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-right font-mono text-chart-2 text-xs md:text-sm">
                              ₹{payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-chart-3 text-xs md:text-sm hidden sm:table-cell">
                              ₹{remainingAtTime.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {showAddPayment ? (
              <form onSubmit={handleAddPayment} className="space-y-3 md:space-y-4 p-3 md:p-4 border rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-800 dark:to-gray-900">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">Payment Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max={remaining}
                    required
                    className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                    data-testid="input-payment-amount"
                  />
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Maximum amount: ₹{remaining.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={addPaymentMutation.isPending}
                    className="hover:scale-105 transition-transform duration-200 text-sm md:text-base flex-1"
                    data-testid="button-submit-payment"
                  >
                    {addPaymentMutation.isPending ? "Adding..." : "Add Payment"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddPayment(false);
                      setAmount("");
                    }}
                    className="hover:scale-105 transition-transform duration-200 text-sm md:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setShowAddPayment(true)}
                className="w-full hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                disabled={remaining <= 0}
                data-testid="button-add-payment"
              >
                <Plus className="w-4 h-4 mr-2" />
                {remaining <= 0 ? "Fully Paid" : "Add Payment"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
