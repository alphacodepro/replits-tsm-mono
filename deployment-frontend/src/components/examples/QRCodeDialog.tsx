import { useState } from 'react';
import QRCodeDialog from '../QRCodeDialog';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

export default function QRCodeDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Show QR Code</Button>
      <QRCodeDialog
        open={open}
        onOpenChange={setOpen}
        batchName="Mathematics Class 10"
        registrationUrl="https://example.com/register/abc123"
      />
      <Toaster />
    </div>
  );
}
