import type { NormalizedApplication } from '@app/types/application-data';
import { ApplicationStatus } from '@app/types/application-status';
import { StatusMapping } from '@app/utils/status-mapping';
import { twMerge } from 'tailwind-merge';

const pipelineStages: { status: ApplicationStatus; label: string }[] = [
  { status: ApplicationStatus.INIT, label: 'Submitted' },
  { status: ApplicationStatus.PHONE_INTERVIEW_PHASE, label: 'Phone interview' },
  {
    status: ApplicationStatus.ONSITE_INTERVIEW_PHASE,
    label: 'Onsite interview',
  },
  { status: ApplicationStatus.ACCEPTED, label: 'Decision' },
];

const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return 'just now';
  }
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'just now';
  }
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

type ApplicationStatusPipelineProps = {
  application: NormalizedApplication;
  isPrimary?: boolean;
};

export function ApplicationStatusPipeline({
  application,
  isPrimary = false,
}: ApplicationStatusPipelineProps) {
  const isRejected = application.status === ApplicationStatus.REJECTED;
  const stageIndex = pipelineStages.findIndex(
    (stage) => stage.status === application.status,
  );

  const currentStageIndex =
    stageIndex >= 0
      ? stageIndex
      : isRejected
        ? pipelineStages.length - 1
        : 0;

  const statusLabel =
    StatusMapping[application.status] ?? application.status.toLowerCase();

  return (
    <div
      className={twMerge(
        'card card-border bg-base-200/40',
        isPrimary && 'border-primary shadow-lg',
      )}>
      <div className='card-body gap-4'>
        <div className='flex flex-col gap-1'>
          <p className='text-sm uppercase tracking-wide opacity-70'>
            Application
          </p>
          <p className='text-xl font-semibold'>
            {application.data.firstName} {application.data.lastName}
          </p>
          <p className='text-sm opacity-70'>{application.email}</p>
        </div>

        <ol className='steps steps-vertical md:steps-horizontal w-full'>
          {pipelineStages.map((stage, index) => {
            const isCurrent = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;
            const state =
              isCurrent || isCompleted ? 'step-primary' : '';
            const label =
              stage.status === ApplicationStatus.ACCEPTED && isRejected
                ? 'Decision'
                : stage.label;

            return (
              <li
                key={stage.status}
                className={twMerge('step', state)}>
                {label}
              </li>
            );
          })}
        </ol>

        <div className='flex flex-col gap-1'>
          <p className='font-semibold'>{statusLabel}</p>
          <p className='text-sm opacity-80'>
            {isRejected
              ? 'We could not move forward with your application.'
              : application.status === ApplicationStatus.ACCEPTED
                ? 'You have been accepted. Check your inbox for the next steps.'
                : 'We will notify you by email as soon as this status changes.'}
          </p>
          <p className='text-xs uppercase tracking-wide opacity-60'>
            Updated {formatDate(application.updatedAt ?? application.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
