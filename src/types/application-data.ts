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

export type ApplicationDocumentStatus =
  | 'approved'
  | 'rejected'
  | 'pending';

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
}
