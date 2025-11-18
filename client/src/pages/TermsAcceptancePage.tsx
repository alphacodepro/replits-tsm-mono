import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { FileText, Shield, CreditCard } from "lucide-react";

const CURRENT_TERMS_VERSION = "1.0.0";

export default function TermsAcceptancePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcceptTerms = async () => {
    if (!isAccepted) {
      toast({
        title: "Agreement Required",
        description: "Please check the box to accept our terms and policies.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.acceptTerms(CURRENT_TERMS_VERSION);

      if (response.user) {
        // Optimistically update the cache with the new user data
        queryClient.setQueryData(["/api/auth/me"], { user: response.user });

        toast({
          title: "Terms Accepted",
          description: "Thank you for accepting our terms and policies.",
        });

        // Redirect to the original destination or dashboard
        const redirectTo = sessionStorage.getItem("redirectAfterTerms");
        if (redirectTo && redirectTo !== "/accept-terms") {
          sessionStorage.removeItem("redirectAfterTerms");
          setLocation(redirectTo);
        } else {
          // Default to dashboard based on role
          setLocation("/");
        }
      }
    } catch (error) {
      console.error("Accept terms error:", error);
      toast({
        title: "Error",
        description: "Failed to accept terms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Agreement Required
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Before proceeding, please review and accept our terms and policies.
            This is required to use Tuition Management System.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              To continue using our platform, you must read and agree to the
              following documents:
            </p>

            <div className="space-y-3">
              <a
                href="/terms-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover-elevate active-elevate-2 bg-white dark:bg-gray-800"
                data-testid="link-terms-from-acceptance"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Terms & Conditions
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Our service terms and user obligations
                  </p>
                </div>
              </a>

              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover-elevate active-elevate-2 bg-white dark:bg-gray-800"
                data-testid="link-privacy-from-acceptance"
              >
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Privacy Policy
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    How we collect and protect your data
                  </p>
                </div>
              </a>

              <a
                href="/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover-elevate active-elevate-2 bg-white dark:bg-gray-800"
                data-testid="link-refund-from-acceptance"
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Refund Policy
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Our cancellation and refund terms
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-terms"
                checked={isAccepted}
                onCheckedChange={(checked) => setIsAccepted(checked === true)}
                data-testid="checkbox-accept-terms"
              />
              <Label
                htmlFor="accept-terms"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed"
              >
                I have read and agree to the Terms & Conditions, Privacy Policy,
                and Refund Policy.
              </Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAcceptTerms}
              disabled={!isAccepted || isSubmitting}
              className="flex-1"
              data-testid="button-continue"
            >
              {isSubmitting ? "Processing..." : "Continue to Dashboard"}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            You must accept these terms to use Tuition Management System.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
