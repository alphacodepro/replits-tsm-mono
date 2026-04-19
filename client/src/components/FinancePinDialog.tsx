import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financePinApi } from "@/lib/api";
import { ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinancePinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinIsSet: boolean;
  onUnlocked: () => void;
  onPinSet: () => void;
}

export default function FinancePinDialog({
  open,
  onOpenChange,
  pinIsSet,
  onUnlocked,
  onPinSet,
}: FinancePinDialogProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin("");
      setConfirmPin("");
      setError(null);
      setIsLocked(false);
      setTimeout(() => pinRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSetPin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await financePinApi.set(pin);
      toast({ title: "Finance PIN set", description: "Your financial data is now PIN-protected." });
      onPinSet();
    } catch (err: any) {
      setError(err.message || "Failed to set PIN.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await financePinApi.verify(pin);
      if (result.success) {
        onUnlocked();
      } else if (result.locked) {
        setIsLocked(true);
        setMinutesLeft(result.minutesLeft ?? 15);
        setError(null);
      } else {
        const left = result.attemptsLeft ?? 0;
        setError(`Incorrect PIN. ${left} attempt${left === 1 ? "" : "s"} remaining.`);
        setPin("");
        setTimeout(() => pinRef.current?.focus(), 50);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      if (pinIsSet) {
        handleVerifyPin();
      } else if (pin.length === 4 && confirmPin.length === 4) {
        handleSetPin();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-testid="dialog-finance-pin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {pinIsSet ? (
              <>
                <Lock className="w-5 h-5 text-primary" />
                Enter Finance PIN
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-primary" />
                Set Finance PIN
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {pinIsSet
              ? "Enter your 4-digit PIN to view financial data."
              : "Set a 4-digit PIN to protect your financial data. You cannot change or reset this PIN from within the app."}
          </DialogDescription>
        </DialogHeader>

        {isLocked ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Too many incorrect attempts. Please try again in{" "}
              <span className="font-semibold text-foreground">{minutesLeft} minute{minutesLeft !== 1 ? "s" : ""}</span>.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-pin-close-locked">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="finance-pin-input">
                {pinIsSet ? "PIN" : "New PIN"}
              </Label>
              <Input
                id="finance-pin-input"
                ref={pinRef}
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(val);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="••••"
                autoComplete="off"
                data-testid="input-finance-pin"
              />
            </div>

            {!pinIsSet && (
              <div className="space-y-1.5">
                <Label htmlFor="finance-pin-confirm">Confirm PIN</Label>
                <Input
                  id="finance-pin-confirm"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setConfirmPin(val);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="••••"
                  autoComplete="off"
                  data-testid="input-finance-pin-confirm"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" data-testid="text-pin-error">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                data-testid="button-pin-cancel"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={pinIsSet ? handleVerifyPin : handleSetPin}
                disabled={isLoading || pin.length < 4 || (!pinIsSet && confirmPin.length < 4)}
                data-testid="button-pin-submit"
              >
                {isLoading ? "Checking..." : pinIsSet ? "Unlock" : "Set PIN"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
