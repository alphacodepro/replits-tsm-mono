import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { batchApi } from "@/lib/api";

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchName: string;
}

interface InstallmentData {
  amount: number;
  date: string;
  method: string | null;
}

interface StudentRow {
  fullName: string;
  phone: string;
  email: string;
  standard: string;
  joinDate: string;
  installments: InstallmentData[];
}

interface ValidationError {
  row: number;
  errors: string[];
}

interface ImportFailure {
  row: number;
  name: string;
  phone: string;
  reason: string;
}

export default function ImportStudentsDialog({
  open,
  onOpenChange,
  batchId,
  batchName,
}: ImportStudentsDialogProps) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [importFailures, setImportFailures] = useState<ImportFailure[]>([]);
  const [fileName, setFileName] = useState("");
  const [existingPhones, setExistingPhones] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ----------------------------------------
  // Fetch existing batch phones ONCE
  // ----------------------------------------
  useEffect(() => {
    if (!open) return;

    batchApi.get(batchId).then((data) => {
      const phones = data.students.map((s: any) => s.phone);
      setExistingPhones(phones);
    });
  }, [open, batchId]);

  // ----------------------------------------
  // Utility: Normalize phone number
  // ----------------------------------------
  const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 ? digits.slice(-10) : digits;
  };

  // ----------------------------------------
  // Utility: Email validation
  // ----------------------------------------
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ----------------------------------------
  // Excel file handling
  // ----------------------------------------
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Prefer "Students" sheet, fallback to first sheet for backwards compatibility
        const sheetName = workbook.SheetNames.includes("Students") 
          ? "Students" 
          : workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const parsed: StudentRow[] = [];
        const errors: ValidationError[] = [];

        const seenPhones = new Set<string>();

        jsonData.forEach((row, index) => {
          const rowErrors: string[] = [];
          const rowNum = index + 2; // excel row number (header is row 1)

          // Extract basic fields
          const rawFullName = row["Full Name"]?.toString().trim() || "";
          
          // Skip instruction rows (rows that start with "NOTE:" or similar instructions)
          if (rawFullName.toUpperCase().startsWith("NOTE:") || 
              rawFullName.toUpperCase().startsWith("INSTRUCTION")) {
            return; // Skip this row
          }
          const rawPhone = row["Phone"]?.toString().trim() || "";
          const rawEmail = row["Email"]?.toString().trim() || "";
          const rawStandard = row["Class/Standard"]?.toString().trim() || "";
          const rawJoinDate = row["Join Date"]?.toString().trim() || "";
          
          // Extract payment fields (up to 10 payments)
          // Supports new format: "Payment 1 Amount" and legacy format: "Inst1_Amount"
          const installments: InstallmentData[] = [];
          for (let i = 1; i <= 10; i++) {
            // Try new format first, fallback to legacy format
            const amountKey = row[`Payment ${i} Amount`] !== undefined ? `Payment ${i} Amount` : `Inst${i}_Amount`;
            const dateKey = row[`Payment ${i} Date`] !== undefined ? `Payment ${i} Date` : `Inst${i}_Date`;
            const methodKey = row[`Payment ${i} Method`] !== undefined ? `Payment ${i} Method` : `Inst${i}_Method`;
            
            const rawAmount = row[amountKey]?.toString().trim();
            const rawDate = row[dateKey]?.toString().trim();
            const rawMethod = row[methodKey]?.toString().trim() || null;
            
            // Only add if there's an amount
            if (rawAmount) {
              const amount = Number(rawAmount);
              if (!isNaN(amount) && amount > 0) {
                // Use join date as fallback if no date provided
                const instDate = rawDate && isValidDate(rawDate) 
                  ? formatDate(rawDate) 
                  : (rawJoinDate && isValidDate(rawJoinDate) ? formatDate(rawJoinDate) : "");
                
                if (instDate) {
                  installments.push({
                    amount,
                    date: instDate,
                    method: rawMethod,
                  });
                }
              }
            }
          }

          // Normalize phone
          const phone = normalizePhone(rawPhone);

          // Required fields
          if (!rawFullName) rowErrors.push("Full Name is required");
          if (!rawPhone) rowErrors.push("Phone is required");
          if (!rawEmail) rowErrors.push("Email is required");
          if (!rawStandard) rowErrors.push("Standard is required");
          if (!rawJoinDate) rowErrors.push("Join Date is required");

          // Validate phone
          if (rawPhone && phone.length !== 10) {
            rowErrors.push("Invalid phone number (must be 10 digits)");
          }

          if (phone && seenPhones.has(phone)) {
            rowErrors.push("Duplicate phone number in Excel file");
          }

          if (phone && existingPhones.includes(phone)) {
            rowErrors.push("Phone already exists in this batch");
          }

          // Validate email
          if (rawEmail && !isValidEmail(rawEmail)) {
            rowErrors.push("Invalid email format");
          }

          // Validate date
          if (rawJoinDate && !isValidDate(rawJoinDate)) {
            rowErrors.push("Invalid date format");
          }

          // Add student or error
          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, errors: rowErrors });
          } else {
            seenPhones.add(phone);

            parsed.push({
              fullName: rawFullName,
              phone,
              email: rawEmail,
              standard: rawStandard,
              joinDate: formatDate(rawJoinDate),
              installments,
            });
          }
        });

        setStudents(parsed);
        setValidationErrors(errors);
        setImportFailures([]);

        if (errors.length === 0) {
          toast({
            title: "File Validated",
            description: `${parsed.length} student(s) ready to import`,
          });
        }
      } catch {
        toast({
          title: "Error reading file",
          description: "Make sure you uploaded a valid Excel file",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = ""; // reset file input
  };

  // ----------------------------------------
  // Date validation
  // ----------------------------------------
  const isValidDate = (val: string): boolean => {
    if (!val) return false;

    // Excel number date
    const excelNum = Number(val);
    if (!isNaN(excelNum) && excelNum > 0) return true;

    const d = new Date(val);
    return !isNaN(d.getTime());
  };

  // ----------------------------------------
  // Date formatter
  // ----------------------------------------
  const formatDate = (val: string): string => {
    const excelNum = Number(val);
    if (!isNaN(excelNum) && excelNum > 0) {
      const d = XLSX.SSF.parse_date_code(excelNum);
      return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    }

    const date = new Date(val);
    return date.toISOString().split("T")[0];
  };

  // ----------------------------------------
  // Import to backend
  // ----------------------------------------
  const importMutation = useMutation({
    mutationFn: async (data: StudentRow[]) => {
      const res = await apiRequest(
        "POST",
        `/api/batches/${batchId}/students/bulk`,
        {
          students: data,
        },
      );
      return await res.json();
    },
    onSuccess: (data: {
      success: number;
      failed: number;
      failures?: ImportFailure[];
    }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });

      if (data.failed > 0 && data.failures) {
        setImportFailures(data.failures);
        toast({
          title: "Import completed with warnings",
          description: `${data.success} successful, ${data.failed} failed.`,
        });
      } else {
        toast({
          title: "Import Successful",
          description: `${data.success} students imported successfully!`,
        });

        setStudents([]);
        setValidationErrors([]);
        setImportFailures([]);
        setFileName("");

        onOpenChange(false);
      }
    },
    onError: (err: Error) => {
      toast({
        title: "Import Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (students.length === 0) return;
    importMutation.mutate(students);
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    
    // ========== INSTRUCTIONS SHEET ==========
    const instructionsData = [
      ["STUDENT IMPORT TEMPLATE - INSTRUCTIONS"],
      [""],
      ["This template allows you to import students with their payment history."],
      [""],
      ["COLUMN DESCRIPTIONS:"],
      ["Full Name", "Required. Student's full name"],
      ["Phone", "Required. 10-digit mobile number (must be unique within batch)"],
      ["Email", "Optional. Student's email address"],
      ["Class/Standard", "Required. e.g., Class 10, Grade 5, etc."],
      ["Join Date", "Optional. Format: YYYY-MM-DD (defaults to today if empty)"],
      [""],
      ["PAYMENT COLUMNS:"],
      ["You can record up to 10 past payments per student."],
      ["Payment X Amount", "Payment amount in rupees (numbers only)"],
      ["Payment X Date", "Payment date. Format: YYYY-MM-DD"],
      ["Payment X Method", "One of: Cash, UPI, Bank Transfer, Cheque, Online, Other"],
      [""],
      ["VALID PAYMENT METHODS:"],
      ["Cash", "UPI", "Bank Transfer", "Cheque", "Online", "Other"],
      [""],
      ["EXAMPLE ROW:"],
      ["Full Name", "Phone", "Email", "Class/Standard", "Join Date", "", "Payment 1 Amount", "Payment 1 Date", "Payment 1 Method"],
      ["Rahul Sharma", "9876543210", "rahul@example.com", "Class 10", "2024-01-15", "", "5000", "2024-02-01", "UPI"],
      [""],
      ["TIPS:"],
      ["- Delete these instructions before importing (use the Students sheet only)"],
      ["- Leave unused payment columns blank"],
      ["- Phone numbers must be unique within the batch"],
      ["- Dates should be in YYYY-MM-DD format for best results"],
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");
    
    // ========== STUDENTS SHEET ==========
    // Build headers: Basic info + separator + payments
    const headers: string[] = [
      "Full Name", "Phone", "Email", "Class/Standard", "Join Date",
      "--- PAYMENTS ---"
    ];
    for (let i = 1; i <= 10; i++) {
      headers.push(`Payment ${i} Amount`, `Payment ${i} Date`, `Payment ${i} Method`);
    }
    
    // Example row with 2 payments filled
    const exampleRow: (string | number)[] = [
      "Rahul Sharma", "9876543210", "rahul@example.com", "Class 10", "2024-01-15",
      "", // separator column (leave empty)
      5000, "2024-02-01", "UPI",
      5000, "2024-03-01", "Cash",
    ];
    // Fill remaining payment columns with empty strings
    while (exampleRow.length < headers.length) {
      exampleRow.push("");
    }
    
    const studentsData = [headers, exampleRow];
    const wsStudents = XLSX.utils.aoa_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Students");
    
    XLSX.writeFile(wb, "student_import_template.xlsx");
  };

  // ----------------------------------------
  // UI Rendering
  // ----------------------------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Import multiple students into <strong>{batchName}</strong> using
            Excel
          </DialogDescription>
        </DialogHeader>

        {/* Upload Buttons */}
        <div className="space-y-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={downloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>

            <label className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("excel-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Excel
              </Button>

              <Input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* File name */}
          {fileName && (
            <Alert className="bg-blue-50/50">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                File loaded: <strong>{fileName}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">
                  Found {validationErrors.length} error(s):
                </p>
                <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="text-xs">
                      Row {err.row}: {err.errors.join(", ")}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Ready to import */}
          {students.length > 0 &&
            validationErrors.length === 0 &&
            importFailures.length === 0 && (
              <Alert className="bg-green-50/50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  {students.length} valid student(s) found. Ready to import!
                </AlertDescription>
              </Alert>
            )}

          {/* Backend failures */}
          {importFailures.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">
                  {importFailures.length} student(s) failed:
                </p>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-red-50">
                      <tr>
                        <th className="p-2 text-left">Row</th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Phone</th>
                        <th className="p-2 text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importFailures.map((fail, idx) => (
                        <tr key={idx}>
                          <td className="p-2">{fail.row}</td>
                          <td className="p-2">{fail.name}</td>
                          <td className="p-2">{fail.phone}</td>
                          <td className="p-2">{fail.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs mt-2">
                  Fix these issues in Excel and try importing again.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer buttons */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setStudents([]);
              setValidationErrors([]);
              setImportFailures([]);
              setFileName("");
              onOpenChange(false);
            }}
          >
            {importFailures.length > 0 ? "Close" : "Cancel"}
          </Button>

          <Button
            disabled={
              students.length === 0 ||
              validationErrors.length > 0 ||
              importMutation.isPending
            }
            onClick={handleImport}
          >
            {importMutation.isPending
              ? "Importing..."
              : `Import ${students.length} Student${
                  students.length === 1 ? "" : "s"
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
