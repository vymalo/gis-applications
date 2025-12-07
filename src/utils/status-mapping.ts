import { ApplicationStatus } from '@app/types/application-status';

export const StatusMapping: Record<ApplicationStatus, string> = {
  [ApplicationStatus.INIT]: 'Init',
  [ApplicationStatus.ACCEPTED]: 'Accepted',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.ONSITE_INTERVIEW_PHASE]: 'Onsite Interview Phase',
  [ApplicationStatus.PHONE_INTERVIEW_PHASE]: 'Phone interview Phase',
  [ApplicationStatus.NEED_APPLICANT_INTERVENTION]: 'Needs Applicant Action',
};
