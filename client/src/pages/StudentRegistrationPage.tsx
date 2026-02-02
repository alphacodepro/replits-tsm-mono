import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { studentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StudentRegistrationPage() {
  const { toast } = useToast();
  const [, params] = useRoute("/register/:token");
  const token = params?.token || "";

  // Basic fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [registeredBatchName, setRegisteredBatchName] = useState("");

  // Additional optional fields
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Toggle for additional fields
  const [showAdditional, setShowAdditional] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
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
    let newErrors = { fullName: "", phone: "", email: "", guardianPhone: "", dateOfBirth: "" };
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

  const {
    data: batchData,
    isLoading: batchLoading,
    error,
  } = useQuery({
    queryKey: ["/api/register", token],
    queryFn: () => studentApi.getRegistrationInfo(token),
    enabled: !!token,
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      fullName: string;
      phone: string;
      email: string;
      standard: string;
      guardianName?: string | null;
      guardianPhone?: string | null;
      schoolName?: string | null;
      city?: string | null;
      dateOfBirth?: string | null;
    }) => studentApi.register(token, data),
    retry: 0,

    onSuccess: (data) => {
      setRegisteredBatchName(data.batchName);
      setSubmitted(true);
    },

    onError: (error: Error) => {
      const msg = error.message.toLowerCase();
      const isDuplicateStudent = msg.includes("student already exists");
      const isRegistrationClosed =
        msg.includes("registration is currently closed") ||
        msg.includes("access denied");

      if (isRegistrationClosed) {
        toast({
          title: "Registration Closed",
          description:
            "This batch is not accepting new registrations at the moment. Please contact your teacher.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isDuplicateStudent
          ? "Student Already Exists"
          : "Registration Failed",
        description: isDuplicateStudent
          ? "Phone number already registered for this batch"
          : error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dobISO = parseDobToISO(dateOfBirth);

    registerMutation.mutate({
      fullName,
      phone,
      email,
      standard: batchData?.batch.standard || "",
      guardianName: guardianName.trim() || null,
      guardianPhone: guardianPhone.trim() || null,
      schoolName: schoolName.trim() || null,
      city: city.trim() || null,
      dateOfBirth: dobISO,
    });
  };

  if (batchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-muted-foreground">
          Loading batch information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Invalid Registration Link</h1>
          <p className="text-muted-foreground">
            This registration link is invalid or expired.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-chart-2/10 p-6 rounded-full">
                <CheckCircle className="w-16 h-16 text-chart-2" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-muted-foreground mb-6">
            You have been registered for {registeredBatchName}.
          </p>
          <Button onClick={() => window.close()} className="w-full">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  const batchName = batchData?.batch.name || "";
  const instituteName = batchData?.instituteName || "Tuition Center";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <BookOpen className="w-12 h-12 text-primary mb-4" />

          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {instituteName}
          </h1>

          <p className="text-lg font-semibold text-gray-900 mt-3">
            Student Registration
          </p>

          <p className="text-sm text-muted-foreground mt-1">{batchName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              data-testid="input-fullName"
              value={fullName}
              placeholder="Rahul Sharma"
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl"
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              data-testid="input-phone"
              type="tel"
              value={phone}
              placeholder="9876543210"
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl"
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              data-testid="input-email"
              type="email"
              value={email}
              placeholder="student@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
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
            <div className="space-y-4 pt-2 border-t">
              {/* Guardian Name */}
              <div className="space-y-1">
                <Label htmlFor="guardianName">Guardian Name</Label>
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
                <Label htmlFor="guardianPhone">Guardian Phone</Label>
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

              {/* School Name */}
              <div className="space-y-1">
                <Label htmlFor="schoolName">School Name</Label>
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
                <Label htmlFor="city">City</Label>
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
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
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
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
            data-testid="button-register"
          >
            {registerMutation.isPending ? "Registering..." : "Register"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
