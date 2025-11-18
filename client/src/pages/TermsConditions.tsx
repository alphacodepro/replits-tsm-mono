import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsConditions() {
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
              Terms & Conditions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardHeader>

          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-8">

              <section>
                <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
                <p>
                  Tuition Management System is a digital platform designed to help tutors,
                  coaching classes, and educational institutions manage students, batches,
                  teachers, fees and related operations.
                </p>
                <p>These Terms apply to:</p>
                <ul>
                  <li>Tutors and teachers</li>
                  <li>Coaching classes and institutions</li>
                  <li>Administrators using the platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
                <ul>
                  <li>Be at least 18 years old</li>
                  <li>Be responsible for handling student and teacher information as part of tutoring or coaching activities</li>
                  <li>Agree to comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain confidentiality of login credentials</li>
                  <li>Immediately notify us of unauthorized access</li>
                </ul>
                <p>You are responsible for all activity under your account.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
                <ul>
                  <li>All uploaded data is part of normal tutoring/coaching activities</li>
                  <li>Tuition Management System keeps your data confidential</li>
                  <li>You will not hack, manipulate, or reverse-engineer the system</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Our Responsibilities</h2>
                <ul>
                  <li>Providing a secure and reliable platform</li>
                  <li>Protecting your data with industry‑standard security practices</li>
                  <li>Processing data only for operational purposes</li>
                  <li>Complying with Indian data protection regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Ownership & License</h2>
                <ul>
                  <li>You retain ownership of all data you upload</li>
                  <li>We receive a limited, revocable license to process your data only to run the platform</li>
                  <li>We do not sell or trade your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Prohibited Activities</h2>
                <ul>
                  <li>No unlawful or fraudulent use</li>
                  <li>No malware or harmful code</li>
                  <li>No bypassing system protections</li>
                  <li>No sharing login credentials with unauthorized persons</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Confidentiality</h2>
                <p>
                  Tuition Management System and the User agree to treat all information as confidential.
                  This includes student data, teacher data, institutional data, system‑generated logs,
                  analytics, and any other uploaded or generated information.
                </p>
                <p>Data may only be disclosed if:</p>
                <ul>
                  <li>Required by law</li>
                  <li>Necessary to provide the service</li>
                  <li>Explicitly authorized by the account owner</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Payments & Recharge System</h2>
                <ul>
                  <li>You agree to displayed pricing</li>
                  <li>Service continues only with active subscription balance</li>
                  <li>Refunds follow the Refund Policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Service Availability</h2>
                <ul>
                  <li>We do not guarantee 100% uptime</li>
                  <li>We may update or modify features anytime</li>
                  <li>Maintenance may interrupt access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
                <ul>
                  <li>No liability for indirect or incidental damages</li>
                  <li>No liability for losses due to user‑provided incorrect data</li>
                  <li>No liability for downtime, system failures, or data loss</li>
                  <li>No system can guarantee uninterrupted or error‑free performance</li>
                </ul>
                <p>Your use of the platform is at your own risk.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Force Majeure</h2>
                <p>
                  We are not responsible for delays or failures caused by events beyond our control,
                  such as natural disasters, cyberattacks, government actions, network outages,
                  power failures, or similar events.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Suspension or Termination</h2>
                <ul>
                  <li>We may suspend accounts for violations or fraud</li>
                  <li>You may request deletion anytime</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Changes to Terms</h2>
                <p>
                  We may update these Terms periodically. Continued use means you accept the latest terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">15. Governing Law</h2>
                <p>These Terms are governed by the laws of India.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">16. Contact Information</h2>
                <p>If you have questions regarding these Terms, legal concerns, or need assistance, please contact our official support team:</p>
                <ul className="mt-3 space-y-1 list-disc list-inside">
                  <li><strong>Support Team – Tuition Management System</strong></li>
                  <li>Email: <a href="mailto:hello@tuitionmanagementsystem.com" className="text-blue-600 dark:text-blue-400 underline">hello@tuitionmanagementsystem.com</a></li>
                  <li>Phone: +91 8788245931</li>
                </ul>
                <p className="mt-3 text-gray-700 dark:text-gray-300">This contact is solely for support and terms-related communication.</p>
              </section>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
