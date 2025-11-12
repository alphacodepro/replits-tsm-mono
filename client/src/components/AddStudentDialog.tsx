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
import { Calendar } from "lucide-react";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchName: string;
  onSubmit: (data: {
    fullName: string;
    phone: string;
    email: string;
    standard: string;
  }) => void;
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  batchName,
  onSubmit,
}: AddStudentDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [standard, setStandard] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      fullName,
      phone,
      email,
      standard,
    });
    
    setFullName("");
    setPhone("");
    setEmail("");
    setStandard("");
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Add Student</DialogTitle>
          <DialogDescription className="text-sm">
            Add a new student to {batchName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 md:space-y-4 py-2 md:py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-student-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-student-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-student-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard" className="text-sm">Class/Standard *</Label>
              <Input
                id="standard"
                placeholder="Class 10"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                required
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-student-standard"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
              <Calendar className="w-4 h-4" />
              <span>Join date: <strong className="text-foreground">Today</strong></span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="hover:scale-105 transition-transform duration-200 text-sm md:text-base w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="hover:scale-105 transition-transform duration-200 text-sm md:text-base w-full sm:w-auto"
              data-testid="button-add-student"
            >
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
