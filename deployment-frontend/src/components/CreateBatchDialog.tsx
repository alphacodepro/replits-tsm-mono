import { useState } from "react";
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

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    subject: string;
    fee: number;
    feePeriod: string;
  }) => void;
}

export default function CreateBatchDialog({ open, onOpenChange, onSubmit }: CreateBatchDialogProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [fee, setFee] = useState("");
  const [feePeriod, setFeePeriod] = useState("month");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      subject,
      fee: Number(fee),
      feePeriod,
    });
    setName("");
    setSubject("");
    setFee("");
    setFeePeriod("month");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
          <DialogDescription>
            Add a new batch to organize your students. Students will automatically be assigned the batch fee.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Batch Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Mathematics Class 10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-batch-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Advanced Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                data-testid="input-batch-subject"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Fee Amount (₹) *</Label>
                <Input
                  id="fee"
                  type="number"
                  placeholder="5000"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  required
                  data-testid="input-batch-fee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Fee Period *</Label>
                <Select value={feePeriod} onValueChange={setFeePeriod}>
                  <SelectTrigger id="period" data-testid="select-fee-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-create-batch">
              Create Batch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
