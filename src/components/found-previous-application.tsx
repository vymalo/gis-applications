import { ToApplication } from '@app/components/to-application';
import { type ApplicationUser } from '@app/types';
import { X } from 'react-feather';

export interface FoundPreviousApplicationProps {
  application: ApplicationUser;
}

export function FoundPreviousApplication({
  application,
}: FoundPreviousApplicationProps) {
  return (
    <div>
      <h2>Found Previous Application</h2>
      <div>
        <ToApplication application={application} />
      </div>
      <button type='button' className='btn btn-circle'>
        <X />
      </button>
    </div>
  );
}
