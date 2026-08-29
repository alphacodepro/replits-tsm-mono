import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Batch } from "@/lib/api";
import type { WhatsappLanguage } from "@shared/schema";

interface EditBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: Batch;
  onSubmit: (data: {
    name: string;
    subject: string | null;
    standard: string;
    fee: number;
    feePeriod: string;
    whatsappLanguage: WhatsappLanguage | null;
  }) => void;
}

export default function EditBatchDialog({
  open,
  onOpenChange,
  batch,
  onSubmit,
}: EditBatchDialogProps) {
  const [name, setName] = useState(batch.name);
  const [subject, setSubject] = useState(batch.subject ?? "");
  const [standard, setStandard] = useState(batch.standard);
  const [fee, setFee] = useState(String(batch.fee));
  const [feePeriod, setFeePeriod] = useState(batch.feePeriod);
  const [whatsappLanguage, setWhatsappLanguage] = useState<WhatsappLanguage | null>(
    batch.whatsappLanguage ?? null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(batch.name);
    setSubject(batch.subject ?? "");
    setStandard(batch.standard);
    setFee(String(batch.fee));
    setFeePeriod(batch.feePeriod);
    setWhatsappLanguage(batch.whatsappLanguage ?? null);
    setError("");
  }, [open, batch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const feeValue = Number(fee);
    if (!name.trim() || !standard.trim() || !Number.isFinite(feeValue) || feeValue <= 0) {
      setError("Batch name, class/standard, and a positive fee are required.");
      return;
    }
    onSubmit({
      name: name.trim(),
      subject: subject.trim() || null,
      standard: standard.trim(),
      fee: feeValue,
      feePeriod,
      whatsappLanguage,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Batch</DialogTitle>
          <DialogDescription>
            Update batch details and its default WhatsApp language.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="edit-batch-name">Batch Name *</Label>
              <Input
                id="edit-batch-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                data-testid="input-edit-batch-name"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-batch-subject">Subject</Label>
              <Input
                id="edit-batch-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                data-testid="input-edit-batch-subject"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-batch-standard">Class/Standard *</Label>
              <Input
                id="edit-batch-standard"
                value={standard}
                onChange={(event) => setStandard(event.target.value)}
                data-testid="input-edit-batch-standard"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-batch-fee">Fee Amount (₹) *</Label>
                <Input
                  id="edit-batch-fee"
                  type="number"
                  value={fee}
                  onChange={(event) => setFee(event.target.value)}
                  data-testid="input-edit-batch-fee"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-batch-period">Fee Period *</Label>
                <Select value={feePeriod} onValueChange={setFeePeriod}>
                  <SelectTrigger id="edit-batch-period" data-testid="select-edit-batch-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-batch-whatsapp-language">WhatsApp Language</Label>
              <Select
                value={whatsappLanguage ?? "not-set"}
                onValueChange={(value) =>
                  setWhatsappLanguage(value === "not-set" ? null : value as WhatsappLanguage)
                }
              >
                <SelectTrigger
                  id="edit-batch-whatsapp-language"
                  data-testid="select-edit-batch-whatsapp-language"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-set">Not Set (English default)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Students use this language unless they have an individual override.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-batch">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}