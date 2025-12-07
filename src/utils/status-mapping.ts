import { ApplicationStatus } from '@app/types/application-status';

export const StatusMapping: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: 'Draft',
  [ApplicationStatus.INIT]: 'Submitted',
  [ApplicationStatus.ACCEPTED]: 'Accepted',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.ONSITE_INTERVIEW_PHASE]: 'Onsite interview phase',
  [ApplicationStatus.PHONE_INTERVIEW_PHASE]: 'Phone interview phase',
  [ApplicationStatus.NEED_APPLICANT_INTERVENTION]: 'Needs Applicant Action',
};
