import { type Application, type User } from '@app/server/db/schema';
import { ApplicationStatus } from '@app/types/application-status';

export type ApplicationPhoneNumber = {
  phoneNumber: string;
  whatsappCall?: boolean;
  normalCall?: boolean;
};

export type ApplicationDocument = {
  name: string;
  publicUrl: string;
};

export type ApplicationDocumentKind =
  | 'ID'
  | 'GCE_OL_CERT'
  | 'PROBATOIRE_CERT'
  | 'GCE_AL_CERT'
  | 'BAC_CERT'
  | 'UNIVERSITY_CERT'
  | 'RECOMMENDATION'
  | 'MOTIVATION'
  | 'CV'
  | 'TRANSCRIPT'
  | 'OTHER';

export type ApplicationDocumentStatus =
  | 'approved'
  | 'rejected'
  | 'pending';

export type ApplicationPhoneKind =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'GUARDIAN'
  | 'OTHER';

export type ApplicationEducationType =
  | 'GCE_OL'
  | 'GCE_AL'
  | 'BAC'
  | 'PROBATOIRE'
  | 'BTS'
  | 'BACHELOR'
  | 'OTHER';

export type ApplicationEducationStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface ApplicationProgramChoice {
  id?: string;
  rank?: number;
  programCode: string;
  campus?: string;
  startTerm?: string;
  studyMode?: string;
  fundingType?: string;
}

export interface ApplicationEducation {
  id?: string;
  type: ApplicationEducationType;
  schoolName: string;
  city?: string;
  country?: string;
  fieldOfStudy?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  completionDate?: string | Date;
  status?: ApplicationEducationStatus;
  gpa?: string;
  candidateNumber?: string;
  sessionYear?: number;
}

export interface ApplicationStoredDocument {
  id?: string;
  applicationId?: string;
  educationId?: string | null;
  kind: ApplicationDocumentKind;
  name: string;
  publicUrl: string;
  status?: ApplicationDocumentStatus;
  reviewerComment?: string | null;
}

export interface ApplicationPhone {
  id?: string;
  phoneNumber: string;
  whatsappCall?: boolean;
  normalCall?: boolean;
  kind?: ApplicationPhoneKind;
}

export interface ApplicationConsent {
  id?: string;
  consentType: string;
  value: boolean;
  grantedAt?: string | Date;
  version?: string | null;
}

export interface ApplicationStatusChange {
  id?: string;
  status: ApplicationStatus;
  changedAt?: string | Date;
  changedById?: string | null;
  note?: string | null;
}

export interface ApplicationMetaStatus {
  invited?: Partial<Record<ApplicationStatus, boolean>> | null;
}

export interface ApplicationMeta {
  status?: ApplicationMetaStatus;
  documentStatuses?: Record<string, ApplicationDocumentStatus>;
  documentComments?: Record<string, string>;
}

export interface ApplicationData {
  firstName: string;
  lastName: string;
  birthDate: string | Date;
  whoAreYou?: string;
  phoneNumbers: ApplicationPhoneNumber[];
  country: string;
  city: string;
  whereAreYou?: string;
  hasIDCartOrPassport?: boolean;
  iDCartOrPassportOrReceipt?: ApplicationDocument[];
  highSchoolOver?: boolean;
  highSchoolGceOLProbatoirDate?: string | Date;
  highSchoolGceOLProbatoireCertificates?: ApplicationDocument[];
  highSchoolGceALBACDate?: string | Date;
  highSchoolGceALBACCertificates?: ApplicationDocument[];
  universityStudent?: boolean;
  universityStartDate?: string | Date;
  universityEndDate?: string | Date;
  universityCertificates?: ApplicationDocument[];
  programChoices?: ApplicationProgramChoice[];
  educations?: ApplicationEducation[];
  documents?: ApplicationStoredDocument[];
  phones?: ApplicationPhone[];
  consents?: ApplicationConsent[];
  [key: string]: unknown;
}

export interface NormalizedApplication
  extends Omit<
    Application,
    | 'data'
    | 'meta'
    | 'status'
    | 'metaInvitedStatuses'
    | 'metaDocumentStatuses'
    | 'metaDocumentComments'
  > {
  data: ApplicationData;
  meta: ApplicationMeta | null;
  status: ApplicationStatus;
  createdBy: User | null;
  programChoices?: ApplicationProgramChoice[];
  educations?: ApplicationEducation[];
  documents?: ApplicationStoredDocument[];
  phones?: ApplicationPhone[];
  consents?: ApplicationConsent[];
  statusHistory?: ApplicationStatusChange[];
}
