import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { teacherApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface CreateTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTeacherDialog({
  open,
  onOpenChange,
}: CreateTeacherDialogProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    general: "",
  });

  const createTeacherMutation = useMutation({
    mutationFn: teacherApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/system"] });
      
      toast({
        title: "Teacher created!",
        description: `${data.teacher.fullName} has been added to the system`,
      });
      
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      
      let newErrors = {
        fullName: "",
        username: "",
        password: "",
        email: "",
        phone: "",
        general: "",
      };

      if (errorMessage.includes("username")) {
        newErrors.username = error.message;
      } else if (errorMessage.includes("email")) {
        newErrors.email = error.message;
      } else if (errorMessage.includes("phone")) {
        newErrors.phone = error.message;
      } else {
        newErrors.general = error.message;
      }
      
      setErrors(newErrors);
    },
  });

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setPassword("");
    setInstituteName("");
    setEmail("");
    setPhone("");
    setErrors({
      fullName: "",
      username: "",
      password: "",
      email: "",
      phone: "",
      general: "",
    });
  };

  const validate = () => {
    let newErrors = {
      fullName: "",
      username: "",
      password: "",
      email: "",
      phone: "",
      general: "",
    };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (password.trim().length < 4) {
      newErrors.password = "Password must be at least 4 characters";
      isValid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    createTeacherMutation.mutate({
      fullName,
      username,
      password,
      instituteName: instituteName || undefined,
      email,
      phone,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Teacher Account</DialogTitle>
          <DialogDescription>
            Add a new teacher to the system with login credentials
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {errors.general && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                data-testid="input-fullname"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="priya.sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
              {errors.username && (
                <p className="text-red-500 text-xs">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Institute Name */}
            <div className="space-y-2">
              <Label htmlFor="instituteName">Institute Name</Label>
              <Input
                id="instituteName"
                placeholder="ABC Academy"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                data-testid="input-institutename"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="input-phone"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createTeacherMutation.isPending}
            >
              Cancel
            </Button>

            <Button 
              type="submit" 
              data-testid="button-create-teacher"
              disabled={createTeacherMutation.isPending}
            >
              {createTeacherMutation.isPending ? "Creating..." : "Create Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
