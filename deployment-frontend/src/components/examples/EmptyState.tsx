import EmptyState from '../EmptyState';
import { BookOpen } from 'lucide-react';

export default function EmptyStateExample() {
  return (
    <div className="p-4">
      <EmptyState
        icon={BookOpen}
        title="No batches yet"
        description="Get started by creating your first batch to organize your students and manage their fees"
        actionLabel="Create First Batch"
        onAction={() => console.log('Create batch clicked')}
      />
    </div>
  );
}
