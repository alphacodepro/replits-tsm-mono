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
    retry: 3, // Retry up to 3 times for failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff: 1s, 2s, 4s (max 5s)
    onSuccess: (data) => {
      setRegisteredBatchName(data.batchName);
      setSubmitted(true);
    },
    onError: (error: Error) => {
      // Check if it's a rate limit error (429) or server busy error (503)
      const errorMessage = error.message.toLowerCase();
      const isRetryableError = errorMessage.includes('429') || errorMessage.includes('503') || errorMessage.includes('too many');
      
      toast({
        title: "Registration failed",
        description: isRetryableError 
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-muted-foreground">Loading batch information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-chart-2/10 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-chart-2" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-muted-foreground mb-6">
            You have been successfully registered for {registeredBatchName}. Your teacher will contact you soon with further details.
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center">{instituteName}</h1>
          <p className="text-lg font-semibold mt-3">Student Registration</p>
          <p className="text-muted-foreground mt-1 text-center">{batchName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
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
              data-testid="input-registration-standard"
            />
          </div>
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
