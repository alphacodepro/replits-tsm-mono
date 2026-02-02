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
import { Textarea } from "@/components/ui/textarea";
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
  guardianName?: string | null;
  guardianPhone?: string | null;
  schoolName?: string | null;
  city?: string | null;
  dateOfBirth?: string | null;
  notes?: string | null;
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
    guardianName?: string | null;
    guardianPhone?: string | null;
    schoolName?: string | null;
    city?: string | null;
    dateOfBirth?: string | null;
    notes?: string | null;
  }) => void;
}

export default function EditStudentDialog({
  open,
  onOpenChange,
  student,
  onSubmit,
}: EditStudentDialogProps) {
  // Basic Info
  const [fullName, setFullName] = useState(student.fullName);
  const [phone, setPhone] = useState(student.phone);
  const [email, setEmail] = useState(student.email || "");
  const [standard, setStandard] = useState(student.standard);

  // Guardian Info
  const [guardianName, setGuardianName] = useState(student.guardianName || "");
  const [guardianPhone, setGuardianPhone] = useState(student.guardianPhone || "");

  // Additional Details
  const [schoolName, setSchoolName] = useState(student.schoolName || "");
  const [city, setCity] = useState(student.city || "");

  // Notes
  const [notes, setNotes] = useState(student.notes || "");

  // Parse date string to Date object
  const parseDate = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const parsed = parse(dateString, "dd MMM yyyy", new Date());
      return isNaN(parsed.getTime()) ? new Date(dateString) : parsed;
    } catch {
      try {
        return new Date(dateString);
      } catch {
        return undefined;
      }
    }
  };

  // Format existing DOB to DD-MM-YYYY for display
  const formatDobForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return "";
    }
  };

  const [joinDate, setJoinDate] = useState<Date>(
    parseDate(student.joinDate) || new Date(),
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    formatDobForInput(student.dateOfBirth),
  );

  const [openJoinCalendar, setOpenJoinCalendar] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    standard: "",
    guardianPhone: "",
    dateOfBirth: "",
  });

  // Parse DD-MM-YYYY to ISO string
  const parseDobToISO = (dob: string): string | null => {
    if (!dob.trim()) return null;
    const match = dob.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const validate = () => {
    let newErrors = { fullName: "", phone: "", email: "", standard: "", guardianPhone: "", dateOfBirth: "" };
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

    // Guardian phone is optional but must be valid if provided
    if (guardianPhone.trim() && !/^\d{10}$/.test(guardianPhone)) {
      newErrors.guardianPhone = "Guardian phone must be 10 digits";
      isValid = false;
    }

    // DOB format validation (optional)
    if (dateOfBirth.trim()) {
      const dobISO = parseDobToISO(dateOfBirth);
      if (!dobISO) {
        newErrors.dateOfBirth = "Use DD-MM-YYYY format";
        isValid = false;
      } else {
        const dobDate = new Date(dobISO);
        if (dobDate > new Date()) {
          newErrors.dateOfBirth = "Date of birth cannot be in future";
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const joinDateISO = joinDate.toISOString();
    const dobISO = parseDobToISO(dateOfBirth);

    onSubmit({
      fullName,
      phone,
      email,
      standard,
      joinDate: joinDateISO,
      guardianName: guardianName.trim() || null,
      guardianPhone: guardianPhone.trim() || null,
      schoolName: schoolName.trim() || null,
      city: city.trim() || null,
      dateOfBirth: dobISO,
      notes: notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Student Details</DialogTitle>
          <DialogDescription className="text-sm">
            View and update student information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-2 md:py-4">
            {/* Section: Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h3>

              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-sm">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  data-testid="input-fullName"
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
                  data-testid="input-phone"
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
                  data-testid="input-email"
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
                  data-testid="input-standard"
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
              <div className="space-y-1">
                <Label className="text-sm">Join Date *</Label>
                <Popover open={openJoinCalendar} onOpenChange={setOpenJoinCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="button-joinDate"
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
                          setOpenJoinCalendar(false);
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Section: Guardian Info */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Guardian Information
              </h3>

              {/* Guardian Name */}
              <div className="space-y-1">
                <Label htmlFor="guardianName" className="text-sm">
                  Guardian Name
                </Label>
                <Input
                  id="guardianName"
                  data-testid="input-guardianName"
                  placeholder="Parent/Guardian name"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Guardian Phone */}
              <div className="space-y-1">
                <Label htmlFor="guardianPhone" className="text-sm">
                  Guardian Phone
                </Label>
                <Input
                  id="guardianPhone"
                  data-testid="input-guardianPhone"
                  type="tel"
                  placeholder="9876543210"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="rounded-xl"
                />
                {errors.guardianPhone && (
                  <p className="text-red-500 text-xs">{errors.guardianPhone}</p>
                )}
              </div>
            </div>

            {/* Section: Additional Details */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Additional Details
              </h3>

              {/* School Name */}
              <div className="space-y-1">
                <Label htmlFor="schoolName" className="text-sm">
                  School Name
                </Label>
                <Input
                  id="schoolName"
                  data-testid="input-schoolName"
                  placeholder="School name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <Label htmlFor="city" className="text-sm">
                  City
                </Label>
                <Input
                  id="city"
                  data-testid="input-city"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Date of Birth - DD-MM-YYYY text input */}
              <div className="space-y-1">
                <Label htmlFor="dateOfBirth" className="text-sm">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  data-testid="input-dateOfBirth"
                  placeholder="DD-MM-YYYY"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="rounded-xl"
                  maxLength={10}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            {/* Section: Notes */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Internal Notes
              </h3>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-sm">
                  Notes (Teacher only)
                </Label>
                <Textarea
                  id="notes"
                  data-testid="input-notes"
                  placeholder="Add any notes about this student..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl min-h-[80px] resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {notes.length}/1000
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
              data-testid="button-cancel"
            >
              Cancel
            </Button>

            <Button type="submit" className="w-full sm:w-auto" data-testid="button-save">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
