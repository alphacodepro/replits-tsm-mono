import { useState } from 'react';
import PaymentHistoryDialog from '../PaymentHistoryDialog';
import { Button } from '@/components/ui/button';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function PaymentHistoryDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4">
        <Button onClick={() => setOpen(true)}>View Payment History</Button>
        <PaymentHistoryDialog
          open={open}
          onOpenChange={setOpen}
          studentId="example-student-id"
          batchFee={5000}
        />
      </div>
    </QueryClientProvider>
  );
}
