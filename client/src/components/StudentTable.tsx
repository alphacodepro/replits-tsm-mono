import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, Phone } from "lucide-react";

interface Student {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  standard: string;
  joinDate: string;
  totalPaid: number;
  totalDue: number;
}

interface StudentTableProps {
  students: Student[];
  onViewPayments: (studentId: string) => void;
}

export default function StudentTable({ students, onViewPayments }: StudentTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Due</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No students added yet
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id} className="hover-elevate">
                <TableCell className="font-medium" data-testid={`text-student-name-${student.id}`}>
                  {student.fullName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {student.phone}
                    </div>
                    {student.email && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {student.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{student.standard}</TableCell>
                <TableCell>{student.joinDate}</TableCell>
                <TableCell className="text-right font-mono">₹{student.totalPaid.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">₹{student.totalDue.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {student.totalDue === 0 ? (
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onViewPayments(student.id)}
                    variant="ghost"
                    size="sm"
                    data-testid={`button-view-payments-${student.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Payments
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
