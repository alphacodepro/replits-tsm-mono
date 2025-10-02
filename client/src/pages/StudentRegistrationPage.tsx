import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, CheckCircle } from "lucide-react";

export default function StudentRegistrationPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [standard, setStandard] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const batchName = "Mathematics Class 10";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Student registration:', { fullName, phone, email, standard });
    setSubmitted(true);
  };

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
            You have been successfully registered for {batchName}. Your teacher will contact you soon with further details.
          </p>
          <Button onClick={() => window.close()} className="w-full">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Student Registration</h1>
          <p className="text-muted-foreground mt-2 text-center">{batchName}</p>
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
          <Button type="submit" className="w-full" data-testid="button-register">
            Register
          </Button>
        </form>
      </Card>
    </div>
  );
}
