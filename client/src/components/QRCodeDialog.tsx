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
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchName: string;
  registrationUrl: string;
  registrationEnabled: boolean;
  onToggleRegistration?: (enabled: boolean) => void;
  instituteName?: string;
  subject?: string;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function QRCodeDialog({
  open,
  onOpenChange,
  batchName,
  registrationUrl,
  registrationEnabled,
  onToggleRegistration,
  instituteName,
  subject,
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
    const qrCanvas = document.getElementById("qr-poster-source") as HTMLCanvasElement;
    if (!qrCanvas) return;

    const W = 1200;
    const H = 1800;

    const poster = document.createElement("canvas");
    poster.width = W;
    poster.height = H;
    const ctx = poster.getContext("2d");
    if (!ctx) return;

    // ── Background ──────────────────────────────────────────
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, W, H);

    // ── Header gradient ──────────────────────────────────────
    const headerH = 360;
    const grad = ctx.createLinearGradient(0, 0, W, headerH);
    grad.addColorStop(0, "#2563eb");
    grad.addColorStop(1, "#1e40af");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, headerH);

    // Institute name
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 70px Arial, sans-serif";
    ctx.fillText(instituteName || "Tuition Center", W / 2, 165, W - 100);

    // "Registration QR" subtitle in header
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "46px Arial, sans-serif";
    ctx.fillText("Registration QR", W / 2, 262, W - 100);

    // Header bottom decorative line
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(0, headerH - 4, W, 4);

    // ── Batch Name ───────────────────────────────────────────
    ctx.fillStyle = "#111827";
    ctx.font = "bold 86px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(batchName, W / 2, 464, W - 80);

    // Subject / Class
    if (subject) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "52px Arial, sans-serif";
      ctx.fillText(subject, W / 2, 550, W - 80);
    }

    // ── QR Code box ──────────────────────────────────────────
    const qrPad = 48;
    const qrDrawSize = 680;
    const boxSize = qrDrawSize + qrPad * 2;
    const boxX = (W - boxSize) / 2;
    const boxY = subject ? 610 : 570;

    // Shadow + white rounded card behind QR
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, boxX, boxY, boxSize, boxSize, 28);
    ctx.fill();
    ctx.restore();

    // Draw QR canvas onto poster (white margin already baked in via includeMargin)
    ctx.drawImage(qrCanvas, boxX + qrPad, boxY + qrPad, qrDrawSize, qrDrawSize);

    // ── "Scan to Register" ───────────────────────────────────
    const scanY = boxY + boxSize + 76;
    ctx.fillStyle = "#1d4ed8";
    ctx.font = "bold 58px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan to Register", W / 2, scanY, W - 80);

    ctx.fillStyle = "#6b7280";
    ctx.font = "40px Arial, sans-serif";
    ctx.fillText("Point your phone camera at the QR code", W / 2, scanY + 68, W - 80);

    // ── Footer ───────────────────────────────────────────────
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, H - 110);
    ctx.lineTo(W - 80, H - 110);
    ctx.stroke();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "38px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Powered by TMS", W / 2, H - 58);

    // ── Download ─────────────────────────────────────────────
    const slug = batchName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const filename = `${slug.charAt(0).toUpperCase() + slug.slice(1)}-registration-qr.png`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = poster.toDataURL("image/png");
    link.click();
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

        {/* STATUS + OPTIONAL TOGGLE */}
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

        {/* QR CODE (visible in dialog) */}
        <div className="flex justify-center p-6 bg-background rounded-md border">
          <QRCodeSVG
            id="qr-code-svg"
            value={registrationUrl}
            size={240}
            level="H"
            includeMargin
          />
        </div>

        {/* Hidden high-res QR canvas used only for poster download */}
        <div style={{ display: "none" }}>
          <QRCodeCanvas
            id="qr-poster-source"
            value={registrationUrl}
            size={720}
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
            Download QR Poster
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
