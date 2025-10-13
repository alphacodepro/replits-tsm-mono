import { useState } from "react";
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

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchName: string;
}

interface StudentRow {
  fullName: string;
  phone: string;
  email: string;
  standard: string;
  joinDate: string;
}

interface ValidationError {
  row: number;
  errors: string[];
}

export default function ImportStudentsDialog({
  open,
  onOpenChange,
  batchId,
  batchName,
}: ImportStudentsDialogProps) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [fileName, setFileName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (data: StudentRow[]) => {
      const res = await apiRequest("POST", `/api/batches/${batchId}/students/bulk`, { students: data });
      return await res.json();
    },
    onSuccess: (data: { count: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches", batchId] });
      toast({
        title: "Success",
        description: `${data.count} students imported successfully!`,
      });
      setStudents([]);
      setValidationErrors([]);
      setFileName("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadTemplate = () => {
    const template = [
      {
        "Full Name": "Rahul Sharma",
        "Phone": "+91 98765 43210",
        "Email": "rahul@example.com",
        "Class/Standard": "Class 10",
        "Join Date": "2024-01-15",
      },
      {
        "Full Name": "Priya Patel",
        "Phone": "+91 98765 43211",
        "Email": "priya@example.com",
        "Class/Standard": "Class 10",
        "Join Date": "2024-01-15",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    
    const colWidths = [
      { wch: 20 },
      { wch: 18 },
      { wch: 25 },
      { wch: 18 },
      { wch: 12 },
    ];
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, "student_import_template.xlsx");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const parsedStudents: StudentRow[] = [];
        const errors: ValidationError[] = [];

        jsonData.forEach((row, index) => {
          const rowErrors: string[] = [];
          const rowNumber = index + 2;

          const fullName = row["Full Name"]?.toString().trim() || "";
          const phone = row["Phone"]?.toString().trim() || "";
          const email = row["Email"]?.toString().trim() || "";
          const standard = row["Class/Standard"]?.toString().trim() || "";
          const joinDate = row["Join Date"]?.toString().trim() || "";

          if (!fullName) rowErrors.push("Full Name is required");
          if (!phone) rowErrors.push("Phone is required");
          if (!standard) rowErrors.push("Class/Standard is required");
          if (!joinDate) rowErrors.push("Join Date is required");

          if (joinDate && !isValidDate(joinDate)) {
            rowErrors.push("Invalid date format (use YYYY-MM-DD or Excel date)");
          }

          if (rowErrors.length > 0) {
            errors.push({ row: rowNumber, errors: rowErrors });
          } else {
            parsedStudents.push({
              fullName,
              phone,
              email: email || "",
              standard,
              joinDate: formatDate(joinDate),
            });
          }
        });

        setStudents(parsedStudents);
        setValidationErrors(errors);

        if (errors.length === 0) {
          toast({
            title: "File validated",
            description: `${parsedStudents.length} students ready to import`,
          });
        }
      } catch (error) {
        toast({
          title: "Error reading file",
          description: "Please make sure you uploaded a valid Excel file",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    
    const excelDateNumber = Number(dateStr);
    if (!isNaN(excelDateNumber) && excelDateNumber > 0) {
      return true;
    }

    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const formatDate = (dateStr: string): string => {
    const excelDateNumber = Number(dateStr);
    if (!isNaN(excelDateNumber) && excelDateNumber > 0) {
      const date = XLSX.SSF.parse_date_code(excelDateNumber);
      return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    return dateStr;
  };

  const handleImport = () => {
    if (students.length === 0) return;
    importMutation.mutate(students);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Import Students</DialogTitle>
          <DialogDescription className="text-sm">
            Import multiple students to {batchName} using an Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="flex-1 hover:scale-105 transition-transform duration-200 text-sm md:text-base"
              data-testid="button-download-template"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <label className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full hover:scale-105 transition-transform duration-200 text-sm md:text-base"
                onClick={() => document.getElementById("excel-upload")?.click()}
                data-testid="button-upload-excel"
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

          {fileName && (
            <Alert className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                File loaded: <span className="font-medium">{fileName}</span>
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-2">
                  Found {validationErrors.length} error(s):
                </p>
                <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-xs">
                      Row {error.row}: {error.errors.join(", ")}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {students.length > 0 && validationErrors.length === 0 && (
            <Alert className="bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-2">
                  {students.length} student(s) ready to import:
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {students.slice(0, 5).map((student, index) => (
                    <p key={index} className="text-xs">
                      • {student.fullName} - {student.standard} ({student.phone})
                    </p>
                  ))}
                  {students.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {students.length - 5} more
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStudents([]);
              setValidationErrors([]);
              setFileName("");
              onOpenChange(false);
            }}
            className="hover:scale-105 transition-transform duration-200 text-sm md:text-base w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={students.length === 0 || validationErrors.length > 0 || importMutation.isPending}
            className="hover:scale-105 transition-transform duration-200 text-sm md:text-base w-full sm:w-auto"
            data-testid="button-import-students"
          >
            {importMutation.isPending
              ? "Importing..."
              : `Import ${students.length} Student${students.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
