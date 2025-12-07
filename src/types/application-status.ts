import { z } from 'zod';

export const ApplicationStatus = {
  INIT: 'INIT',
  PHONE_INTERVIEW_PHASE: 'PHONE_INTERVIEW_PHASE',
  ONSITE_INTERVIEW_PHASE: 'ONSITE_INTERVIEW_PHASE',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  NEED_APPLICANT_INTERVENTION: 'NEED_APPLICANT_INTERVENTION',
} as const;

export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const applicationStatusValues = Object.values(
  ApplicationStatus,
) as ApplicationStatus[];

export const ApplicationStatusSchema = z.enum(applicationStatusValues);
