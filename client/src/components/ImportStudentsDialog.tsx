import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
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
  batchFee?: number;
  feePeriod?: string;
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
  // Optional additional details
  guardianName?: string;
  guardianPhone?: string;
  schoolName?: string;
  city?: string;
  dateOfBirth?: string;
  notes?: string;
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
  batchFee,
  feePeriod,
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
          // Supports multiple formats:
          // - Simplified: "Payment Amount", "Payment Date", "Payment Method" (new default template)
          // - Numbered: "Payment 1 Amount", "Payment 2 Amount", etc.
          // - Legacy: "Inst1_Amount", "Inst2_Amount", etc.
          const installments: InstallmentData[] = [];
          
          // First, check for simplified single payment columns (new template format)
          const simpleAmount = row["Payment Amount"]?.toString().trim();
          const simpleDate = row["Payment Date"]?.toString().trim();
          const simpleMethod = row["Payment Method"]?.toString().trim() || null;
          
          if (simpleAmount) {
            const amount = Number(simpleAmount);
            if (!isNaN(amount) && amount > 0) {
              const instDate = simpleDate && isValidDate(simpleDate) 
                ? formatDate(simpleDate) 
                : (rawJoinDate && isValidDate(rawJoinDate) ? formatDate(rawJoinDate) : "");
              
              if (instDate) {
                installments.push({
                  amount,
                  date: instDate,
                  method: simpleMethod,
                });
              }
            }
          }
          
          // Then check for numbered payment columns (Payment 1, Payment 2, etc.)
          for (let i = 1; i <= 10; i++) {
            // Try numbered format first, fallback to legacy format
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

          // Extract optional additional details
          const guardianName = row["Guardian Name"]?.toString().trim() || undefined;
          const guardianPhone = row["Guardian Phone"]?.toString().trim() || undefined;
          const schoolName = row["School Name"]?.toString().trim() || undefined;
          const city = row["City"]?.toString().trim() || undefined;
          const rawDateOfBirth = row["Date of Birth"]?.toString().trim() || "";
          const notes = row["Notes"]?.toString().trim() || undefined;
          
          // Parse date of birth (DD-MM-YYYY format) to ISO string
          let dateOfBirth: string | undefined = undefined;
          if (rawDateOfBirth) {
            // Try DD-MM-YYYY format first
            const dobMatch = rawDateOfBirth.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (dobMatch) {
              const [, day, month, year] = dobMatch;
              const dobDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              if (!isNaN(dobDate.getTime())) {
                dateOfBirth = dobDate.toISOString();
              }
            } else if (isValidDate(rawDateOfBirth)) {
              // Fallback to other date formats
              dateOfBirth = new Date(formatDate(rawDateOfBirth)).toISOString();
            }
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
              // Optional additional details
              guardianName,
              guardianPhone,
              schoolName,
              city,
              dateOfBirth,
              notes,
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

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tuition Management System';
    
    // ========== INSTRUCTIONS SHEET ==========
    const instructionsSheet = workbook.addWorksheet('Instructions');
    
    // Set column width
    instructionsSheet.getColumn(1).width = 85;
    
    const instructionsData = [
      ["STUDENT IMPORT - QUICK GUIDE"],
      [""],
      ["Welcome! This template helps you add multiple students at once."],
      [""],
      ["WHAT YOU NEED TO FILL:"],
      [""],
      ["REQUIRED (Blue columns):"],
      ["   - Full Name: Student's complete name"],
      ["   - Phone: 10-digit mobile number (each student needs a unique number)"],
      ["   - Email: Student's email address"],
      ["   - Class/Standard: Example - Class 10, Grade 5, 12th Science"],
      ["   - Join Date: When did the student join? (Example: 15-01-2024)"],
      [""],
      ["BATCH FEE INFO (Gray column - DO NOT EDIT):"],
      ["   - This column shows the batch fee for your reference only"],
      ["   - It is automatically filled and will be ignored during import"],
      ["   - Any changes you make to this column will not be saved"],
      [""],
      ["OPTIONAL - Payment (Green columns):"],
      ["   - Payment Amount: Amount paid in rupees (just the number, like 5000)"],
      ["   - Payment Date: When was the payment made? (Example: 01-02-2024)"],
      ["   - Payment Method: How they paid - Cash, UPI, Bank Transfer, Cheque, Online, or Other"],
      [""],
      ["OPTIONAL - Extra Details (Yellow columns):"],
      ["   - Guardian Name: Parent or guardian's name"],
      ["   - Guardian Phone: Parent's phone number"],
      ["   - School Name: Name of the school"],
      ["   - City: City or town name"],
      ["   - Date of Birth: Student's birthday (Example: 25-03-2010)"],
      ["   - Notes: Any extra information about the student"],
      [""],
      ["TIPS:"],
      ["   - Look at the example row in the Students sheet - it shows exactly how to fill the data"],
      ["   - Leave any optional columns blank if you don't have that information"],
      ["   - Need to add more payments? Add columns: Payment 2 Amount, Payment 2 Date, Payment 2 Method"],
      ["   - Dates can be DD-MM-YYYY (like 15-01-2024) or YYYY-MM-DD (like 2024-01-15)"],
      [""],
      ["READY TO IMPORT:"],
      ["   1. Fill your student data in the 'Students' sheet"],
      ["   2. Save this file"],
      ["   3. Upload it using the 'Upload Excel' button"],
    ];
    
    instructionsData.forEach((row, index) => {
      const excelRow = instructionsSheet.addRow(row);
      // Style the title row
      if (index === 0) {
        excelRow.font = { bold: true, size: 16 };
      }
      // Style section headers
      if (row[0]?.startsWith("REQUIRED") || row[0]?.startsWith("OPTIONAL") || 
          row[0]?.startsWith("TIPS:") || row[0]?.startsWith("READY") || row[0]?.startsWith("WHAT YOU") ||
          row[0]?.startsWith("BATCH FEE")) {
        excelRow.font = { bold: true, size: 12 };
      }
    });
    
    // ========== STUDENTS SHEET ==========
    const studentsSheet = workbook.addWorksheet('Students');
    
    // Format batch fee for display
    const formattedBatchFee = batchFee 
      ? `₹${batchFee.toLocaleString('en-IN')}${feePeriod ? `/${feePeriod}` : ''}`
      : '₹0';
    
    // Set columns (with Batch Fee Info column after Join Date)
    // Column order: 1-5 Student Info (Blue), 6 Batch Fee Info (Gray), 7-9 Payment (Green), 10-15 Additional (Yellow)
    studentsSheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 22 },
      { header: 'Phone', key: 'phone', width: 14 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Class/Standard', key: 'standard', width: 16 },
      { header: 'Join Date', key: 'joinDate', width: 14 },
      { header: 'Batch Fee (Info)\n(for reference)', key: 'batchFeeInfo', width: 18 },
      { header: 'Payment Amount', key: 'paymentAmount', width: 16 },
      { header: 'Payment Date', key: 'paymentDate', width: 14 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Guardian Name', key: 'guardianName', width: 20 },
      { header: 'Guardian Phone', key: 'guardianPhone', width: 14 },
      { header: 'School Name', key: 'schoolName', width: 22 },
      { header: 'City', key: 'city', width: 14 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 14 },
      { header: 'Notes', key: 'notes', width: 30 },
    ];
    
    // Style header row with colors
    const headerRow = studentsSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FF000000' } };
    headerRow.height = 35;
    
    // Color coding for header groups
    // Student Info (Required) - Light Blue: columns 1-5
    const lightBlue = 'FFDBEAFE';
    for (let col = 1; col <= 5; col++) {
      const cell = headerRow.getCell(col);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: col === 1 ? 'medium' : 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'medium' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
    
    // Batch Fee Info (Read-only) - Light Gray: column 6
    const lightGray = 'FFE5E7EB';
    const batchFeeCell = headerRow.getCell(6);
    batchFeeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightGray } };
    batchFeeCell.font = { bold: true, italic: true, color: { argb: 'FF6B7280' } };
    batchFeeCell.border = {
      top: { style: 'thin' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' },
    };
    batchFeeCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    
    // Payment Info (Optional) - Light Green: columns 7-9
    const lightGreen = 'FFD1FAE5';
    for (let col = 7; col <= 9; col++) {
      const cell = headerRow.getCell(col);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightGreen } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: col === 7 ? 'medium' : 'thin' },
        bottom: { style: 'medium' },
        right: { style: col === 9 ? 'medium' : 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
    
    // Additional Details (Optional) - Light Yellow: columns 10-15
    const lightYellow = 'FFFEF3C7';
    for (let col = 10; col <= 15; col++) {
      const cell = headerRow.getCell(col);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightYellow } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: col === 10 ? 'medium' : 'thin' },
        bottom: { style: 'medium' },
        right: { style: col === 15 ? 'medium' : 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
    
    // Add example row with batch fee info auto-filled
    const exampleRow = studentsSheet.addRow([
      'Priya Sharma', '9876543210', 'priya.sharma@email.com', 'Class 10', '15-01-2024',
      formattedBatchFee,
      5000, '01-02-2024', 'UPI',
      'Ramesh Sharma', '9876543211', 'Delhi Public School', 'Mumbai', '25-03-2010', 'Good at Mathematics'
    ]);
    
    // Style example row
    exampleRow.eachCell((cell, colNumber) => {
      if (colNumber === 6) {
        // Batch Fee Info column - gray, italic, read-only appearance
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
        cell.font = { italic: true, color: { argb: 'FF6B7280' } };
        cell.alignment = { horizontal: 'center' };
      } else {
        // Regular columns - light gray example styling
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        cell.font = { italic: true, color: { argb: 'FF6B7280' } };
      }
    });
    
    // Freeze header row
    studentsSheet.views = [{ state: 'frozen', ySplit: 1 }];
    
    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_template.xlsx';
    link.click();
    URL.revokeObjectURL(url);
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
