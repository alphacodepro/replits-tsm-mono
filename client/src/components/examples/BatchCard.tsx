import BatchCard from '../BatchCard';

export default function BatchCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <BatchCard
        id="1"
        name="Mathematics Class 10"
        subject="Advanced Mathematics"
        fee={5000}
        feePeriod="month"
        studentCount={25}
        onViewDetails={() => console.log('View details clicked')}
        onShowQR={() => console.log('Show QR clicked')}
        onCopyLink={() => console.log('Copy link clicked')}
      />
      <BatchCard
        id="2"
        name="Physics Class 12"
        subject="Mechanics & Waves"
        fee={6000}
        feePeriod="month"
        studentCount={18}
        onViewDetails={() => console.log('View details clicked')}
        onShowQR={() => console.log('Show QR clicked')}
        onCopyLink={() => console.log('Copy link clicked')}
      />
      <BatchCard
        id="3"
        name="Chemistry Basics"
        fee={4500}
        feePeriod="month"
        studentCount={30}
        onViewDetails={() => console.log('View details clicked')}
        onShowQR={() => console.log('Show QR clicked')}
        onCopyLink={() => console.log('Copy link clicked')}
      />
    </div>
  );
}
