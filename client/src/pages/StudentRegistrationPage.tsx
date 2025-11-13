import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, CheckCircle } from "lucide-react";
import { studentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StudentRegistrationPage() {
  const { toast } = useToast();
  const [, params] = useRoute("/register/:token");
  const token = params?.token || "";
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [standard, setStandard] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [registeredBatchName, setRegisteredBatchName] = useState("");

  const { data: batchData, isLoading: batchLoading, error } = useQuery({
    queryKey: ["/api/register", token],
    queryFn: () => studentApi.getRegistrationInfo(token),
    enabled: !!token,
  });

  const registerMutation = useMutation({
    mutationFn: (data: { fullName: string; phone: string; email?: string; standard: string }) =>
      studentApi.register(token, data),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: (data) => {
      setRegisteredBatchName(data.batchName);
      setSubmitted(true);
    },
    onError: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      const isRetryableError = errorMessage.includes('429') || errorMessage.includes('503') || errorMessage.includes('too many');
      const isDuplicateStudent = errorMessage.includes('student already exists');
      
      toast({
        title: isDuplicateStudent ? "Student Already Exists in This Batch" : "Registration Failed",
        description: isDuplicateStudent 
          ? "Phone number already registered"
          : isRetryableError 
          ? "Server is busy. Please wait a moment and try again."
          : error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      fullName,
      phone,
      email: email || undefined,
      standard,
    });
  };

  if (batchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-4">
        <div className="text-muted-foreground">Loading batch information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-4">
        <Card className="w-full max-w-md p-8 text-center rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Invalid Registration Link</h1>
          <p className="text-muted-foreground">
            This registration link is invalid or has expired. Please contact your teacher for a valid link.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-4">
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
            You have been successfully registered for {registeredBatchName}. Your teacher will contact you soon with further details.
          </p>
          <Button 
            onClick={() => window.close()} 
            className="w-full hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
          >
            Close
          </Button>
        </Card>
      </div>
    );
  }

  const batchName = batchData?.batch.name || "";
  const instituteName = batchData?.instituteName || "Tuition Center";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-4">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-sm"></div>
            <div className="relative bg-primary/10 p-4 rounded-full">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{instituteName}</h1>
          <p className="text-lg font-semibold mt-3 text-gray-900 dark:text-white">Student Registration</p>
          <p className="text-sm text-muted-foreground mt-1 text-center">{batchName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200"
              data-testid="input-registration-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200"
              data-testid="input-registration-phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200"
              data-testid="input-registration-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="standard">Class/Standard *</Label>
            <Input
              id="standard"
              placeholder="Class 10"
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              required
              className="rounded-xl focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all duration-200"
              data-testid="input-registration-standard"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg" 
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
