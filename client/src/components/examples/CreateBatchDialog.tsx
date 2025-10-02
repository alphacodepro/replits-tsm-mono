import { useState } from 'react';
import CreateBatchDialog from '../CreateBatchDialog';
import { Button } from '@/components/ui/button';

export default function CreateBatchDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Create Batch Dialog</Button>
      <CreateBatchDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => {
          console.log('Batch created:', data);
        }}
      />
    </div>
  );
}
