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
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { AlertCircle } from "lucide-react";

interface ChangeCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  onSuccess: () => void;
}

export default function ChangeCredentialsDialog({
  open,
  onOpenChange,
  currentUsername,
  onSuccess,
}: ChangeCredentialsDialogProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    username: currentUsername,
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    username: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const { toast } = useToast();

  const resetErrors = () => {
    setErrors({
      currentPassword: "",
      username: "",
      password: "",
      confirmPassword: "",
      general: "",
    });
  };

  const validate = () => {
    let newErrors = {
      currentPassword: "",
      username: "",
      password: "",
      confirmPassword: "",
      general: "",
    };
    let isValid = true;

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await authApi.updateCredentials({
        username: formData.username,
        password: formData.password,
        currentPassword: formData.currentPassword,
      });

      toast({
        title: "Success",
        description: "Credentials updated successfully. Please log in again with your new credentials.",
      });

      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update credentials";
      
      let newErrors = {
        currentPassword: "",
        username: "",
        password: "",
        confirmPassword: "",
        general: "",
      };

      if (errorMessage.toLowerCase().includes("username")) {
        newErrors.username = errorMessage;
      } else if (errorMessage.toLowerCase().includes("current password")) {
        newErrors.currentPassword = errorMessage;
      } else if (errorMessage.toLowerCase().includes("password")) {
        newErrors.password = errorMessage;
      } else {
        newErrors.general = errorMessage;
      }
      
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        currentPassword: "",
        username: currentUsername,
        password: "",
        confirmPassword: "",
      });
      resetErrors();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-change-credentials">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change Username & Password</DialogTitle>
            <DialogDescription>
              Update your login credentials. You'll be logged out after changing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errors.general && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                disabled={isLoading}
                data-testid="input-current-password"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs">{errors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="username">New Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isLoading}
                data-testid="input-new-username"
              />
              {errors.username && (
                <p className="text-red-500 text-xs">{errors.username}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                data-testid="input-new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                data-testid="input-confirm-password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="button-save-credentials">
              {isLoading ? "Updating..." : "Update Credentials"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
