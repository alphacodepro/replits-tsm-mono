import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardHeader>

          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-8">

              <section>
                <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                <p>
                  At Tuition Management System, we are committed to protecting your privacy
                  and handling your information responsibly. This Privacy Policy describes
                  the information we collect, how we use and share it, and the choices you
                  have. Our practices follow the Digital Personal Data Protection Act, 2023
                  (India).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>

                <h3 className="font-semibold mt-2">A. Information You Provide</h3>
                <ul>
                  <li>Student names, classes, subjects details</li>
                  <li>Teacher names, contact details, subjects taught</li>
                  <li>Fee and finance-related data</li>
                  <li>Account information such as email, phone number</li>
                </ul>

                <h3 className="font-semibold mt-4">B. Information We Collect Automatically</h3>
                <ul>
                  <li>Device identifiers</li>
                  <li>Browser type and version</li>
                  <li>IP address</li>
                  <li>Usage activity within the platform</li>
                  <li>Log files and diagnostic data</li>
                </ul>

                <h3 className="font-semibold mt-4">C. Information from Institutions</h3>
                <p>
                  Educational institutions or tutors may upload or manage data on behalf of
                  students and teachers. They are responsible for ensuring lawful collection
                  and consent where required.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Information</h2>
                <ul>
                  <li>Provide, operate, and maintain the Tuition Management System</li>
                  <li>Create and manage user accounts</li>
                  <li>Manage batches, students, teachers, fees, and reporting</li>
                  <li>Improve platform performance and user experience</li>
                  <li>Detect, prevent, and respond to security risks</li>
                  <li>Communicate updates, alerts, and support messages</li>
                  <li>Comply with applicable laws</li>
                </ul>
                <p>We do not sell your personal information.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Legal Basis</h2>
                <ul>
                  <li>User consent</li>
                  <li>Contractual necessity</li>
                  <li>Legitimate educational/administrative interests</li>
                  <li>Compliance with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. How We Share Information</h2>
                <ul>
                  <li>Cloud hosting providers</li>
                  <li>Payment partners</li>
                  <li>Technical service providers</li>
                  <li>Authorities when required by law</li>
                </ul>
                <p>
                  All third parties must follow strict confidentiality and security
                  obligations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <p>We use advanced safeguards such as:</p>
                <ul>
                  <li>End-to-end encrypted data transfer</li>
                  <li>Encrypted databases</li>
                  <li>Strict access controls</li>
                  <li>Regular monitoring and audits</li>
                  <li>Multi-layered security infrastructure</li>
                </ul>
                <p>
                  Despite our efforts, no system is completely secure. We continuously
                  improve our safeguards.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                <ul>
                  <li>Access your data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion (subject to requirements)</li>
                  <li>Withdraw consent anytime</li>
                  <li>File grievances regarding misuse or unauthorized access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
                <p>We retain data only for as long as necessary:</p>
                <ul>
                  <li>Account and operational data while using the platform</li>
                  <li>Backups up to 90 days</li>
                  <li>Deleted accounts removed within 30 days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Cross-Border Data Transfers</h2>
                <p>
                  If data is stored or processed outside India, we ensure equivalent
                  protection standards as required under Indian law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Children’s Data</h2>
                <p>
                  Student data is processed only through authorized institutions or tutors.
                  We rely on them to obtain parental/guardian permissions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Policy Updates</h2>
                <p>
                  We may update this Privacy Policy as needed. Continued use of the Tuition
                  Management System means you accept the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Contact & Grievance Redressal</h2>
                <p>If you have privacy concerns, data-related questions, or wish to raise a grievance, please contact our official support team:</p>
                <ul className="mt-3">
                  <li><strong>Support Team – Tuition Management System</strong></li>
                  <li>Email: <a href="mailto:hello@tuitionmanagementsystem.com">hello@tuitionmanagementsystem.com</a></li>
                  <li>Phone: +91 8788245931</li>
                </ul>
                <p className="mt-3">This contact is solely for support and grievance-related communication regarding your privacy and data.</p>
              </section>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}