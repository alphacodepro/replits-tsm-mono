import { useState } from 'react';
import CreateTeacherDialog from '../CreateTeacherDialog';
import { Button } from '@/components/ui/button';

export default function CreateTeacherDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Create Teacher</Button>
      <CreateTeacherDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => {
          console.log('Teacher created:', data);
        }}
      />
    </div>
  );
}
