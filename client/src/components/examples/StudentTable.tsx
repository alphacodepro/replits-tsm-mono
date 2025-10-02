import StudentTable from '../StudentTable';

export default function StudentTableExample() {
  const mockStudents = [
    {
      id: '1',
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@example.com',
      standard: 'Class 10',
      joinDate: '2024-01-15',
      totalPaid: 15000,
      totalDue: 0,
    },
    {
      id: '2',
      fullName: 'Priya Patel',
      phone: '+91 98765 43211',
      email: 'priya@example.com',
      standard: 'Class 10',
      joinDate: '2024-02-01',
      totalPaid: 10000,
      totalDue: 5000,
    },
    {
      id: '3',
      fullName: 'Amit Kumar',
      phone: '+91 98765 43212',
      standard: 'Class 10',
      joinDate: '2024-02-10',
      totalPaid: 5000,
      totalDue: 10000,
    },
  ];

  return (
    <div className="p-4">
      <StudentTable
        students={mockStudents}
        onViewPayments={(id) => console.log('View payments for student:', id)}
      />
    </div>
  );
}
