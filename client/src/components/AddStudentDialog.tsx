import { useState, useEffect } from "react";
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
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchName: string;
  batchStandard?: string;
  onSubmit: (data: {
    fullName: string;
    phone: string;
    email: string;
    standard: string;
    guardianName?: string | null;
    guardianPhone?: string | null;
    schoolName?: string | null;
    city?: string | null;
    dateOfBirth?: string | null;
    notes?: string | null;
  }) => void;
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  batchName,
  batchStandard,
  onSubmit,
}: AddStudentDialogProps) {
  // Basic fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [standard, setStandard] = useState("");

  // Additional optional fields
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [notes, setNotes] = useState("");

  // Toggle for additional fields
  const [showAdditional, setShowAdditional] = useState(false);

  useEffect(() => {
    if (open && batchStandard) {
      setStandard(batchStandard);
    }
  }, [open, batchStandard]);

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

    const dobISO = parseDobToISO(dateOfBirth);

    onSubmit({
      fullName,
      phone,
      email,
      standard,
      guardianName: guardianName.trim() || null,
      guardianPhone: guardianPhone.trim() || null,
      schoolName: schoolName.trim() || null,
      city: city.trim() || null,
      dateOfBirth: dobISO,
      notes: notes.trim() || null,
    });

    // Reset all fields
    setFullName("");
    setPhone("");
    setEmail("");
    setStandard("");
    setGuardianName("");
    setGuardianPhone("");
    setSchoolName("");
    setCity("");
    setDateOfBirth("");
    setNotes("");
    setShowAdditional(false);
    setErrors({
      fullName: "",
      phone: "",
      email: "",
      standard: "",
      guardianPhone: "",
      dateOfBirth: "",
    });

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
                className="rounded-xl text-sm md:text-base"
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
                className="rounded-xl text-sm md:text-base"
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
                className="rounded-xl text-sm md:text-base"
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
                className="rounded-xl text-sm md:text-base"
              />
              {errors.standard && (
                <p className="text-red-500 text-xs">{errors.standard}</p>
              )}
            </div>

            {/* Join Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
              <Calendar className="w-4 h-4" />
              <span>
                Join date: <strong className="text-foreground">Today</strong>
              </span>
            </div>

            {/* Toggle for Additional Fields */}
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between text-sm text-muted-foreground"
              onClick={() => setShowAdditional(!showAdditional)}
              data-testid="button-toggle-additional"
            >
              <span>Additional Details (Optional)</span>
              {showAdditional ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {/* Additional Fields */}
            {showAdditional && (
              <div className="space-y-3 pt-2 border-t">
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
                    className="rounded-xl text-sm md:text-base"
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
                    className="rounded-xl text-sm md:text-base"
                  />
                  {errors.guardianPhone && (
                    <p className="text-red-500 text-xs">{errors.guardianPhone}</p>
                  )}
                </div>

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
                    className="rounded-xl text-sm md:text-base"
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
                    className="rounded-xl text-sm md:text-base"
                  />
                </div>

                {/* Date of Birth */}
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
                    className="rounded-xl text-sm md:text-base"
                    maxLength={10}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-sm">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    data-testid="input-notes"
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rounded-xl text-sm md:text-base min-h-[60px] resize-none"
                    maxLength={1000}
                  />
                </div>
              </div>
            )}
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
            <Button type="submit" className="w-full sm:w-auto" data-testid="button-add">
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
