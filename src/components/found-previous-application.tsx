'use client';

import { ToApplication } from '@app/components/to-application';
import { type ApplicationUser } from 'app-types';
import { useState } from 'react';
import { X } from 'react-feather';

export interface FoundPreviousApplicationProps {
  application: ApplicationUser;
}

export function FoundPreviousApplication({
  application,
}: FoundPreviousApplicationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (isDeleting) {
    return null;
  }

  return (
    <div>
      <h2 className='text-lg font-semibold'>
        You already started an application
      </h2>
      <div className='flex flex-row gap-4 items-center'>
        <div>
          <ToApplication application={application} />
        </div>
        <button
          onClick={() => setIsDeleting(true)}
          type='button'
          className='btn btn-circle btn-sm'>
          <X />
        </button>
      </div>
    </div>
  );
}
