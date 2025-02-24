import { ToApplication } from '@app/components/to-application';
import type { Application, User } from '@prisma/client';
import { X } from 'react-feather';

export interface FoundPreviousApplicationProps {
  application: Application & { createdBy: User };
}

export function FoundPreviousApplication({
  application,
}: FoundPreviousApplicationProps) {
  return (
    <div>
      <h2>Found Previous Application</h2>
      <ToApplication application={application} />
      <button type='button' className='btn btn-circle'>
        <X />
      </button>
    </div>
  );
}
