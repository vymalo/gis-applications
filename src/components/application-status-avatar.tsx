import { ApplicationStatus } from '@app/types/application-status';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

interface ApplicationStatusProps {
  name: string;
  status: ApplicationStatus;
  notified?: boolean;
}

const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.INIT]: 'bg-neutral text-neutral-content',
  [ApplicationStatus.PHONE_INTERVIEW_PHASE]: 'bg-warning text-warning-content',
  [ApplicationStatus.ONSITE_INTERVIEW_PHASE]: 'bg-primary text-primary-content',
  [ApplicationStatus.ACCEPTED]: 'bg-success text-success-content',
  [ApplicationStatus.REJECTED]: 'bg-error text-error-content',
  [ApplicationStatus.NEED_APPLICANT_INTERVENTION]:
    'bg-info text-info-content',
};

export function ApplicationStatusAvatar({
  name,
  status,
  notified = false,
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
    <div>
      <div
        className={twMerge('avatar avatar-placeholder', [
          !notified && 'avatar-online',
        ])}>
        <div className={twMerge('size-12 rounded-full', statusColors[status])}>
          <span>{initials}</span>
        </div>
      </div>
    </div>
  );
}
