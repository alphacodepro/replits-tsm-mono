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

  const [joinDate, setJoinDate] = useState<Date>(
    parseJoinDate(student.joinDate),
  );

  const [openCalendar, setOpenCalendar] = useState(false);

  // ---------------------------
  // ❗ Validation State
  // ---------------------------
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    standard: "",
  });

  const validate = () => {
    let newErrors = { fullName: "", phone: "", email: "", standard: "" };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!standard.trim()) {
      newErrors.standard = "Standard is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

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
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-sm">
                Full Name *
              </Label>
              <Input
                id="fullName"
                placeholder="Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-xl"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Standard */}
            <div className="space-y-1">
              <Label htmlFor="standard" className="text-sm">
                Class/Standard *
              </Label>
              <Input
                id="standard"
                placeholder="Class 10"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                required
                className="rounded-xl"
              />
              {errors.standard && (
                <p className="text-red-500 text-xs">{errors.standard}</p>
              )}
            </div>

            {/* Join Date */}
            <div className="space-y-2">
              <Label className="text-sm">Join Date *</Label>

              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl",
                      !joinDate && "text-muted-foreground",
                    )}
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
                    onSelect={(date) => {
                      if (date) {
                        setJoinDate(date);
                        setOpenCalendar(false);
                      }
                    }}
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
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button type="submit" className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
