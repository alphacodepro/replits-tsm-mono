import { useState } from "react";
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
import { Plus } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  paidAt: string;
}

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  totalFee: number;
  payments: Payment[];
  onAddPayment: (amount: number) => void;
}

export default function PaymentHistoryDialog({
  open,
  onOpenChange,
  studentName,
  totalFee,
  payments,
  onAddPayment,
}: PaymentHistoryDialogProps) {
  const [amount, setAmount] = useState("");
  const [showAddPayment, setShowAddPayment] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalFee - totalPaid;

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPayment(Number(amount));
    setAmount("");
    setShowAddPayment(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment History - {studentName}</DialogTitle>
          <DialogDescription>
            View and manage payment records
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-md">
            <div>
              <p className="text-sm text-muted-foreground">Total Fee</p>
              <p className="text-2xl font-bold">₹{totalFee.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-chart-2">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-chart-3">₹{remaining.toLocaleString()}</p>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No payments recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment, index) => {
                    const paidSoFar = payments
                      .slice(0, index + 1)
                      .reduce((sum, p) => sum + p.amount, 0);
                    const remainingAtTime = totalFee - paidSoFar;

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.paidAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{remainingAtTime.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {showAddPayment ? (
            <form onSubmit={handleAddPayment} className="space-y-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  data-testid="input-payment-amount"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" data-testid="button-submit-payment">
                  Add Payment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddPayment(false);
                    setAmount("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => setShowAddPayment(true)}
              className="w-full"
              data-testid="button-add-payment"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
