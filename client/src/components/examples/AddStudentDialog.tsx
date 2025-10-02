import { useState } from 'react';
import AddStudentDialog from '../AddStudentDialog';
import { Button } from '@/components/ui/button';

export default function AddStudentDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Add Student</Button>
      <AddStudentDialog
        open={open}
        onOpenChange={setOpen}
        batchName="Mathematics Class 10"
        onSubmit={(data) => {
          console.log('Student added:', data);
        }}
      />
    </div>
  );
}
