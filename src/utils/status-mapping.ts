import { ApplicationStatus } from '@prisma/client';

export const StatusMapping: Record<ApplicationStatus, string> = {
  [ApplicationStatus.INIT]: 'Init',
  [ApplicationStatus.ACCEPTED]: 'Accepted',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.ONSITE_INTERVIEW_PHASE]: 'Onsite Interview Phase',
  [ApplicationStatus.PHONE_INTERVIEW_PHASE]: 'Phone interview Phase',
};
