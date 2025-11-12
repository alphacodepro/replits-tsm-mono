import { useState } from "react";
import { format, parse } from "date-fns";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  standard: string;
  customFee: number | null;
  joinDate: string;
}

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  onSubmit: (data: {
    fullName: string;
    phone: string;
    email: string;
    standard: string;
    joinDate: string;
  }) => void;
}

export default function EditStudentDialog({
  open,
  onOpenChange,
  student,
  onSubmit,
}: EditStudentDialogProps) {
  const [fullName, setFullName] = useState(student.fullName);
  const [phone, setPhone] = useState(student.phone);
  const [email, setEmail] = useState(student.email || "");
  const [standard, setStandard] = useState(student.standard);
  
  const parseJoinDate = (dateString: string): Date => {
    try {
      const parsed = parse(dateString, "dd MMM yyyy", new Date());
      return isNaN(parsed.getTime()) ? new Date(dateString) : parsed;
    } catch {
      return new Date(dateString);
    }
  };
  
  const [joinDate, setJoinDate] = useState<Date>(parseJoinDate(student.joinDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert join date to ISO string
    const joinDateISO = joinDate.toISOString();

    onSubmit({
      fullName,
      phone,
      email,
      standard,
      joinDate: joinDateISO,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Edit Student</DialogTitle>
          <DialogDescription className="text-sm">
            Update student information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 md:space-y-4 py-2 md:py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm">
                Full Name *
              </Label>
              <Input
                id="fullName"
                placeholder="Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-edit-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-edit-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-edit-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standard" className="text-sm">
                Class/Standard *
              </Label>
              <Input
                id="standard"
                placeholder="Class 10"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                required
                className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200 text-sm md:text-base"
                data-testid="input-edit-standard"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Join Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl",
                      !joinDate && "text-muted-foreground"
                    )}
                    data-testid="button-select-joindate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {joinDate ? (
                      format(joinDate, "dd MMM yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={joinDate}
                    onSelect={(date) => date && setJoinDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              data-testid="button-save-student"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
