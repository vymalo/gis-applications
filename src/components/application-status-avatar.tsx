import { ApplicationStatus } from '@prisma/client';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

interface ApplicationStatusProps {
  name: string;
  status: ApplicationStatus;
}

const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.INIT]: 'bg-neutral text-neutral-content',
  [ApplicationStatus.PHONE_INTERVIEW_PHASE]: 'bg-warning text-warning-content',
  [ApplicationStatus.ONSITE_INTERVIEW_PHASE]: 'bg-primary text-primary-content',
  [ApplicationStatus.ACCEPTED]: 'bg-success text-success-content',
  [ApplicationStatus.REJECTED]: 'bg-error text-error-content',
};

export function ApplicationStatusAvatar({
  name,
  status,
}: ApplicationStatusProps) {
  const initials = useMemo(
    () =>
      name
        .split(' ')
        .map((n) => n[0])
        .join(''),
    [name],
  );
  return (
    <div className='avatar avatar-placeholder'>
      <div className={twMerge('size-12 rounded-full', statusColors[status])}>
        <span>{initials}</span>
      </div>
    </div>
  );
}
