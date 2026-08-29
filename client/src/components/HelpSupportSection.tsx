import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, LifeBuoy, Mail, Send } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supportApi } from "@/lib/api";

const MAX_SUBJECT_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 5000;

const quickHelpItems = [
  {
    question: "How do I add a new student?",
    answer:
      "Open the relevant batch from your dashboard, select Add Student, complete the student details, and submit the form.",
  },
  {
    question: "How do I edit a student's information?",
    answer:
      "Open the batch, find the student, and select the edit button on their student card or row. Save the updated details when finished.",
  },
  {
    question: "How do I record a payment?",
    answer:
      "Open the student's payment history from the batch student list, choose Add Payment, enter the amount and payment details, and submit.",
  },
  {
    question: "How can I view a student's payment history?",
    answer:
      "Open the relevant batch and select View Payments for the student. The dialog shows the payment list, totals, and outstanding amount.",
  },
  {
    question: "How do I send a fee reminder?",
    answer:
      "Open a student's payment history and use the reminder button, or select Remind on the batch page to choose multiple students.",
  },
  {
    question: "Can I add several students at once?",
    answer:
      "Yes. Open a batch, choose Import Excel, and upload the completed spreadsheet template. Review the data before confirming the import.",
  },
  {
    question: "What happens when I reach my student limit?",
    answer:
      "TMS prevents new student additions after the allowed limit is reached. Your administrator can review the account allowance and any available buffer.",
  },
  {
    question: "How do I change my username or password?",
    answer:
      "Go to Settings, open Account, and choose Change username or Change password. You will need to confirm your current password.",
  },
] as const;

export default function HelpSupportSection() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const sendRequestMutation = useMutation({
    mutationFn: supportApi.sendRequest,
    onSuccess: () => {
      setSubject("");
      setMessage("");
      setValidationError("");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");
    sendRequestMutation.reset();

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject) {
      setValidationError("Please enter a subject.");
      return;
    }
    if (trimmedSubject.length > MAX_SUBJECT_LENGTH) {
      setValidationError(`Subject must be ${MAX_SUBJECT_LENGTH} characters or less.`);
      return;
    }
    if (!trimmedMessage) {
      setValidationError("Please enter a message.");
      return;
    }
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setValidationError(`Message must be ${MAX_MESSAGE_LENGTH.toLocaleString()} characters or less.`);
      return;
    }

    sendRequestMutation.mutate({
      subject: trimmedSubject,
      message: trimmedMessage,
    });
  };

  const errorMessage =
    validationError ||
    (sendRequestMutation.error instanceof Error
      ? sendRequestMutation.error.message
      : sendRequestMutation.error
        ? "We could not send your message right now. Please try again later."
        : "");

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-blue-200/70 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:border-blue-900/60 dark:from-blue-950/30 dark:via-gray-900 dark:to-indigo-950/20">
        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">We’re here to help</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Have a question or need help with TMS? Send us a message and our support
                team will get back to you.
              </p>
            </div>
          </div>
          <a
            href="mailto:hello@tuitionmanagementsystem.com"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            hello@tuitionmanagementsystem.com
          </a>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="font-semibold text-foreground">Send us a message</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your teacher account details will be included automatically.
          </p>
        </div>

        {sendRequestMutation.isSuccess && (
          <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Message sent successfully</AlertTitle>
            <AlertDescription>
              Thanks for reaching out. Our support team will review your message and get
              back to you.
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Message not sent</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              name="subject"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setValidationError("");
                sendRequestMutation.reset();
              }}
              placeholder="What can we help you with?"
              maxLength={MAX_SUBJECT_LENGTH}
              aria-invalid={Boolean(validationError && !subject.trim())}
              data-testid="input-support-subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              name="message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setValidationError("");
                sendRequestMutation.reset();
              }}
              placeholder="Tell us how we can help..."
              rows={7}
              maxLength={MAX_MESSAGE_LENGTH}
              aria-invalid={Boolean(validationError && !message.trim())}
              data-testid="textarea-support-message"
            />
            <p className="text-xs text-muted-foreground">
              {message.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()} characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={sendRequestMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-send-support-message"
          >
            <Send className="mr-2 h-4 w-4" />
            {sendRequestMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground">Quick Help</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Helpful answers for common tasks in TMS.
          </p>
        </div>
        <Accordion type="single" collapsible className="mt-2">
          {quickHelpItems.map((item, index) => (
            <AccordionItem key={item.question} value={`help-${index}`}>
              <AccordionTrigger className="text-left text-sm hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pr-6 leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}