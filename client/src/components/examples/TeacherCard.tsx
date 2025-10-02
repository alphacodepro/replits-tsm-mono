import TeacherCard from '../TeacherCard';

export default function TeacherCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <TeacherCard
        id="1"
        fullName="Priya Sharma"
        username="priya.sharma"
        email="priya@example.com"
        phone="+91 98765 43210"
        isActive={true}
        batchCount={5}
        studentCount={125}
        onViewDetails={() => console.log('View details clicked')}
        onToggleStatus={() => console.log('Toggle status clicked')}
        onDelete={() => console.log('Delete clicked')}
      />
      <TeacherCard
        id="2"
        fullName="Rajesh Kumar"
        username="rajesh.kumar"
        email="rajesh@example.com"
        phone="+91 98765 43211"
        isActive={true}
        batchCount={3}
        studentCount={78}
        onViewDetails={() => console.log('View details clicked')}
        onToggleStatus={() => console.log('Toggle status clicked')}
        onDelete={() => console.log('Delete clicked')}
      />
      <TeacherCard
        id="3"
        fullName="Amit Patel"
        username="amit.patel"
        phone="+91 98765 43212"
        isActive={false}
        batchCount={2}
        studentCount={45}
        onViewDetails={() => console.log('View details clicked')}
        onToggleStatus={() => console.log('Toggle status clicked')}
        onDelete={() => console.log('Delete clicked')}
      />
    </div>
  );
}
