import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchName: string;
  registrationUrl: string;
  registrationEnabled: boolean;
  onToggleRegistration?: (enabled: boolean) => void; // optional for modal toggle
}

export default function QRCodeDialog({
  open,
  onOpenChange,
  batchName,
  registrationUrl,
  registrationEnabled,
  onToggleRegistration,
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
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${batchName}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>Student Registration</DialogTitle>
          <DialogDescription>
            Students can register to{" "}
            <span className="font-medium">{batchName}</span> using the QR code
            or link below.
          </DialogDescription>
        </DialogHeader>

        {/* 🚀 STATUS + OPTIONAL TOGGLE */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-gray-200 dark:border-gray-700">
          <Badge
            variant={registrationEnabled ? "default" : "destructive"}
            className="text-xs px-2 py-0.5"
          >
            {registrationEnabled ? "Registration Open" : "Registration Closed"}
          </Badge>

          {onToggleRegistration && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">
                {registrationEnabled ? "Open" : "Closed"}
              </Label>

              <Switch
                checked={registrationEnabled}
                onCheckedChange={onToggleRegistration}
              />
            </div>
          )}
        </div>

        {/* QR CODE */}
        <div className="flex justify-center p-6 bg-background rounded-md border">
          <QRCodeSVG
            id="qr-code-svg"
            value={registrationUrl}
            size={240}
            level="H"
            includeMargin
          />
        </div>

        {/* LINK + COPY */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={registrationUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopyLink} variant="outline" size="icon">
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleDownloadQR}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
