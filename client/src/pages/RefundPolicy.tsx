import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function RefundPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Refund & Cancellation Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardHeader>

          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-8">

              <section>
                <h2 className="text-xl font-semibold mb-3">1. Policy Updates</h2>
                <p>
                  We may update this Refund & Cancellation Policy from time to time to reflect
                  changes in our practices, legal requirements, or service offerings. Material
                  changes will be notified via email or in-app alerts. Continued use of the
                  service after such notice constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Overview</h2>
                <p>
                  Tuition Management System offers monthly, yearly, and custom subscription plans.
                  If at any point during an active subscription you are not satisfied or no longer
                  wish to continue using our service, you may request a refund.
                </p>
                <p>
                  All refunds are calculated and processed by our billing team based on the usage
                  duration and the plan purchased.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Eligibility for Refund</h2>
                <p>A refund may be requested if:</p>
                <ul>
                  <li>You are not satisfied with the service</li>
                  <li>You no longer wish to continue your subscription</li>
                  <li>You no longer require the platform or its features</li>
                  <li>You have an active subscription at the time of request</li>
                </ul>
                <p>Refunds are <strong>not</strong> applicable if:</p>
                <ul>
                  <li>Fraudulent activity or abuse is detected</li>
                  <li>The subscription period has fully ended with no unused time</li>
                  <li>The request is made after repeated misuse or breach of Terms & Conditions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Refund Calculation Method</h2>
                <p>Refunds follow a <strong>pro‑rated model</strong>.</p>
                <p>Our billing team calculates:</p>
                <ul>
                  <li>Total amount paid</li>
                  <li>Exact duration used (days/weeks/months)</li>
                  <li>Usage cost for that duration</li>
                </ul>
                <p>
                  <strong>Refund Amount = (Total Paid) – (Usage Cost)</strong>
                </p>
                <p>Notes:</p>
                <ul>
                  <li>Discounts or promo credits may affect refund value</li>
                  <li>Partial months are calculated daily unless contract specifies otherwise</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Refunds for Custom or Special Plans</h2>
                <ul>
                  <li>Handled manually by our billing team</li>
                  <li>Calculated according to contract terms</li>
                  <li>Additional conditions may apply based on the agreement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Cancellation of Subscription</h2>
                <p>You may cancel anytime by contacting support.</p>
                <p>Upon cancellation:</p>
                <ul>
                  <li>Your account stays active until the paid period ends (unless immediate shutdown is requested)</li>
                  <li>A refund may be processed if eligible under Section 4</li>
                  <li>Any outstanding dues will be deducted from the refundable amount</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Non‑Refundable Charges</h2>
                <ul>
                  <li>Payment gateway or transaction fees</li>
                  <li>Optional add-on or feature usage fees</li>
                  <li>Custom development, integrations, or professional services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. How to Request a Refund</h2>
                <p>Please contact our support team with:</p>
                <ul>
                  <li>Registered email</li>
                  <li>Subscription or invoice details</li>
                  <li>Reason for refund request</li>
                </ul>
                <p><strong>Email:</strong> hello@tuitionmanagementsystem.com</p>
                <p><strong>Phone:</strong> +91 8788245931</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Refund Processing Time</h2>
                <ul>
                  <li>Processing takes 7–14 business days after approval</li>
                  <li>Refunds are sent to the original payment method unless arranged otherwise</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Dispute Resolution</h2>
                <p>
                  If you disagree with your refund calculation, you may escalate the matter to our
                  billing manager. Disputes will be handled per our Terms & Conditions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Contact and Support</h2>
                <p>If you have refund-related questions or need assistance, please contact our official support team:</p>
                <ul className="mt-3 space-y-1 list-disc list-inside">
                  <li><strong>Billing Team — Tuition Management System</strong></li>
                  <li>Email: <a href="mailto:hello@tuitionmanagementsystem.com" className="text-blue-600 dark:text-blue-400 underline">hello@tuitionmanagementsystem.com</a></li>
                  <li>Phone: +91 8788245931</li>
                </ul>
                <p className="mt-3 text-gray-700 dark:text-gray-300">This contact is solely for refund and cancellation-related communication.</p>
              </section>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
