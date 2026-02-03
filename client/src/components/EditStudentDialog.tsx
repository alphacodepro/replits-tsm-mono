import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Pencil, Phone, Mail, Cake, CalendarDays, MapPin, School, User, StickyNote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  // Mode state - view (default) or edit
  const [isEditMode, setIsEditMode] = useState(false);

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

  // Format date for view display
  const formatDateForView = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return format(date, "dd MMM yyyy");
    } catch {
      return "—";
    }
  };

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

  // Helper function to reset form to current student values
  const resetFormToStudent = () => {
    setFullName(student.fullName);
    setPhone(student.phone);
    setEmail(student.email || "");
    setStandard(student.standard);
    setGuardianName(student.guardianName || "");
    setGuardianPhone(student.guardianPhone || "");
    setSchoolName(student.schoolName || "");
    setCity(student.city || "");
    setNotes(student.notes || "");
    setJoinDate(parseDate(student.joinDate) || new Date());
    setDateOfBirth(formatDobForInput(student.dateOfBirth));
    setErrors({ fullName: "", phone: "", email: "", standard: "", guardianPhone: "", dateOfBirth: "" });
  };

  // Reset to view mode when dialog opens
  useEffect(() => {
    if (open) {
      setIsEditMode(false);
      resetFormToStudent();
    }
  }, [open]);

  // Sync form values when student data changes (e.g., after external update)
  useEffect(() => {
    if (open && !isEditMode) {
      resetFormToStudent();
    }
  }, [student.id, student.fullName, student.phone, student.email, student.standard]);

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

    // Switch back to view mode after save
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    resetFormToStudent();
    setIsEditMode(false);
  };

  // Helper for displaying values in view mode
  const displayValue = (value: string | null | undefined): string => {
    return value?.trim() || "—";
  };

  // View mode field component for consistent styling
  const ViewField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg md:text-xl">
              {isEditMode ? "Edit Student" : "Student Profile"}
            </DialogTitle>
            {isEditMode ? (
              <Badge variant="secondary" className="text-xs">
                Editing
              </Badge>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="gap-1"
                data-testid="button-edit"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
          <DialogDescription className="text-sm">
            {isEditMode 
              ? "Make changes to student information below" 
              : "View student profile information"
            }
          </DialogDescription>
        </DialogHeader>

        {/* VIEW MODE */}
        {!isEditMode && (
          <div className="space-y-4 py-2">
            {/* PROFILE HEADER */}
            <div className="flex flex-wrap items-start gap-4 pb-4 border-b" data-testid="profile-header">
              <Avatar className="h-16 w-16 text-xl" data-testid="avatar-student">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {student.fullName?.charAt(0)?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground truncate" data-testid="text-student-name">
                  {student.fullName}
                </h2>
                <p className="text-sm text-muted-foreground" data-testid="text-student-subtitle">
                  {student.standard}
                  {student.schoolName && ` • ${student.schoolName}`}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground" data-testid="text-student-phone">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-foreground">{student.phone}</span>
                  </span>
                  {student.email && (
                    <span className="flex items-center gap-1.5 text-muted-foreground" data-testid="text-student-email">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="text-foreground">{student.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* DATES CARD */}
            <div className="bg-muted/40 rounded-lg p-3" data-testid="card-dates">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-2" data-testid="text-join-date">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">{formatDateForView(student.joinDate)}</span>
                </span>
                {student.dateOfBirth && (
                  <span className="flex items-center gap-2" data-testid="text-dob">
                    <Cake className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">DOB:</span>
                    <span className="font-medium">{formatDateForView(student.dateOfBirth)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* GUARDIAN CARD */}
            {(student.guardianName || student.guardianPhone) && (
              <div className="bg-muted/40 rounded-lg p-3" data-testid="card-guardian">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Guardian</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {student.guardianName && (
                    <span className="font-medium" data-testid="text-guardian-name">{student.guardianName}</span>
                  )}
                  {student.guardianPhone && (
                    <span className="flex items-center gap-1.5 text-muted-foreground" data-testid="text-guardian-phone">
                      <Phone className="h-3.5 w-3.5" />
                      <span className="text-foreground">{student.guardianPhone}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* SCHOOL & LOCATION CARD */}
            {(student.schoolName || student.city) && (
              <div className="bg-muted/40 rounded-lg p-3" data-testid="card-school-location">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">School & Location</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {student.schoolName && (
                    <span className="flex items-center gap-1.5" data-testid="text-school-name">
                      <School className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{student.schoolName}</span>
                    </span>
                  )}
                  {student.city && (
                    <span className="flex items-center gap-1.5" data-testid="text-city">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{student.city}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* INTERNAL NOTES CARD */}
            <div 
              className={cn(
                "rounded-lg p-3",
                student.notes?.trim() 
                  ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50" 
                  : "bg-muted/40"
              )}
              data-testid="card-notes"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StickyNote className={cn(
                  "h-4 w-4",
                  student.notes?.trim() ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  student.notes?.trim() ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
                )}>Internal Note</span>
              </div>
              <p className={cn(
                "text-sm whitespace-pre-wrap leading-relaxed",
                student.notes?.trim() 
                  ? "text-amber-900 dark:text-amber-100" 
                  : "text-muted-foreground italic"
              )} data-testid="text-notes">
                {student.notes?.trim() || "No notes added"}
              </p>
            </div>

            {/* Footer */}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
                data-testid="button-close"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* EDIT MODE */}
        {isEditMode && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-2">
              {/* Section: Basic Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
                  Basic Information
                </h3>

                {/* Full Name */}
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-sm">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    data-testid="input-fullName"
                    placeholder="Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl"
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-xs">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-sm">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl"
                  />
                  {errors.phone && (
                    <p className="text-destructive text-xs">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Standard */}
                <div className="space-y-1">
                  <Label htmlFor="standard" className="text-sm">
                    Class/Standard <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="standard"
                    data-testid="input-standard"
                    placeholder="Class 10"
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="rounded-xl"
                  />
                  {errors.standard && (
                    <p className="text-destructive text-xs">{errors.standard}</p>
                  )}
                </div>

                {/* Join Date */}
                <div className="space-y-1">
                  <Label className="text-sm">
                    Join Date <span className="text-destructive">*</span>
                  </Label>
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
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
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
                    <p className="text-destructive text-xs">{errors.guardianPhone}</p>
                  )}
                </div>
              </div>

              {/* Section: Additional Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
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
                    className="rounded-xl"
                    maxLength={10}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-destructive text-xs">{errors.dateOfBirth}</p>
                  )}
                </div>
              </div>

              {/* Section: Notes */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
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

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
