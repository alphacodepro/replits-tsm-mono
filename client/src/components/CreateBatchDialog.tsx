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
    standard: string;
    fee: number;
    feePeriod: string;
  }) => void;
}

export default function CreateBatchDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateBatchDialogProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [standard, setStandard] = useState("");
  const [fee, setFee] = useState("");
  const [feePeriod, setFeePeriod] = useState("month");

  // ❗ Validation errors
  const [errors, setErrors] = useState({
    name: "",
    standard: "",
    fee: "",
  });

  const validate = () => {
    let newErrors = { name: "", standard: "", fee: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Batch name is required";
      isValid = false;
    }

    if (!standard.trim()) {
      newErrors.standard = "Class/Standard is required";
      isValid = false;
    }

    const feeValue = Number(fee);
    if (isNaN(feeValue) || feeValue <= 0) {
      newErrors.fee = "Fee must be a positive number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name,
      subject,
      standard,
      fee: Number(fee),
      feePeriod,
    });

    setName("");
    setSubject("");
    setStandard("");
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
            Add a new batch to organize your students. Students will
            automatically be assigned the batch fee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Batch Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Batch Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Mathematics Class 10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-batch-name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Subject */}
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

            {/* Class/Standard */}
            <div className="space-y-1">
              <Label htmlFor="standard">Class/Standard *</Label>
              <Input
                id="standard"
                placeholder="e.g., Class 10, Grade 12"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                required
                data-testid="input-batch-standard"
              />
              {errors.standard && (
                <p className="text-red-500 text-xs">{errors.standard}</p>
              )}
            </div>

            {/* Fee + Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
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
                {errors.fee && (
                  <p className="text-red-500 text-xs">{errors.fee}</p>
                )}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
