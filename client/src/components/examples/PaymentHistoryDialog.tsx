import { useState } from 'react';
import PaymentHistoryDialog from '../PaymentHistoryDialog';
import { Button } from '@/components/ui/button';

export default function PaymentHistoryDialogExample() {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState([
    { id: '1', amount: 5000, paidAt: '2024-01-15' },
    { id: '2', amount: 5000, paidAt: '2024-02-15' },
    { id: '3', amount: 5000, paidAt: '2024-03-15' },
  ]);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>View Payment History</Button>
      <PaymentHistoryDialog
        open={open}
        onOpenChange={setOpen}
        studentName="Rahul Sharma"
        totalFee={15000}
        payments={payments}
        onAddPayment={(amount) => {
          const newPayment = {
            id: String(payments.length + 1),
            amount,
            paidAt: new Date().toISOString(),
          };
          setPayments([...payments, newPayment]);
          console.log('Payment added:', amount);
        }}
      />
    </div>
  );
}
