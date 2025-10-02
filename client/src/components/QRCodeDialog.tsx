import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchName: string;
  registrationUrl: string;
}

export default function QRCodeDialog({
  open,
  onOpenChange,
  batchName,
  registrationUrl,
}: QRCodeDialogProps) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    toast({
      title: "Link copied!",
      description: "Registration link copied to clipboard",
    });
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${batchName}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Student Registration</DialogTitle>
          <DialogDescription>
            Share this QR code or link with students to let them register for {batchName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center p-8 bg-background rounded-md border">
            <QRCodeSVG
              id="qr-code-svg"
              value={registrationUrl}
              size={256}
              level="H"
              includeMargin
            />
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={registrationUrl}
                readOnly
                className="font-mono text-sm"
                data-testid="input-registration-url"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                data-testid="button-copy-url"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              className="w-full"
              data-testid="button-download-qr"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
