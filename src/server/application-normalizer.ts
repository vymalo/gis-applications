import type { Application } from '@app/server/db/schema';
import type {
  ApplicationData,
  ApplicationDocument,
  ApplicationMeta,
  ApplicationPhoneNumber,
} from '@app/types/application-data';

const normalizeDate = (
  value: string | Date | null | undefined,
): string | Date | null => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return null;
  }
  return value;
};

const normalizeArray = <T>(
  value: T[] | null | undefined,
  fallback: T[] = [],
): T[] => value ?? fallback;

const toDateString = (
  value: string | Date | null | undefined,
): string | null => {
  const normalized = normalizeDate(value);
  if (!normalized) {
    return null;
  }
  if (normalized instanceof Date) {
    return normalized.toISOString().slice(0, 10);
  }
  return normalized;
};

export const buildApplicationData = (
  application: Application,
): ApplicationData => ({
  firstName: application.firstName,
  lastName: application.lastName,
  birthDate: application.birthDate,
  whoAreYou: application.whoAreYou ?? undefined,
  phoneNumbers: normalizeArray<ApplicationPhoneNumber>(
    application.phoneNumbers as ApplicationPhoneNumber[],
  ),
  country: application.country,
  city: application.city,
  whereAreYou: application.whereAreYou ?? undefined,
  hasIDCartOrPassport: application.hasIdCartOrPassport ?? false,
  iDCartOrPassportOrReceipt: normalizeArray<ApplicationDocument>(
    application.idCartOrPassportOrReceipt as ApplicationDocument[],
  ),
  highSchoolOver: application.highSchoolOver ?? false,
  highSchoolGceOLProbatoirDate: normalizeDate(
    application.highSchoolGceOLProbatoirDate,
  ) ?? undefined,
  highSchoolGceOLProbatoireCertificates:
    normalizeArray<ApplicationDocument>(
      application.highSchoolGceOLProbatoireCertificates as ApplicationDocument[],
    ),
  highSchoolGceALBACDate:
    normalizeDate(application.highSchoolGceALBACDate) ?? undefined,
  highSchoolGceALBACCertificates: normalizeArray<ApplicationDocument>(
    application.highSchoolGceALBACCertificates as ApplicationDocument[],
  ),
  universityStudent: application.universityStudent ?? false,
  universityStartDate:
    normalizeDate(application.universityStartDate) ?? undefined,
  universityEndDate: normalizeDate(application.universityEndDate) ?? undefined,
  universityCertificates: normalizeArray<ApplicationDocument>(
    application.universityCertificates as ApplicationDocument[],
  ),
});

export const buildApplicationMeta = (
  application: Application,
): ApplicationMeta => ({
  status: {
    invited: application.metaInvitedStatuses ?? undefined,
  },
  documentStatuses: application.metaDocumentStatuses ?? undefined,
  documentComments: application.metaDocumentComments ?? undefined,
});

export const mapApplicationDataToColumns = (data: ApplicationData) => {
  const birthDate: string =
    toDateString(data.birthDate) ??
    new Date().toISOString().slice(0, 10);

  return {
    firstName: data.firstName,
    lastName: data.lastName,
    birthDate,
    whoAreYou: data.whoAreYou ?? null,
    phoneNumbers: normalizeArray<ApplicationPhoneNumber>(
      data.phoneNumbers as ApplicationPhoneNumber[],
    ),
    country: data.country,
    city: data.city,
    whereAreYou: data.whereAreYou ?? null,
    hasIdCartOrPassport: data.hasIDCartOrPassport ?? false,
    idCartOrPassportOrReceipt: normalizeArray<ApplicationDocument>(
      data.iDCartOrPassportOrReceipt as ApplicationDocument[],
    ),
    highSchoolOver: data.highSchoolOver ?? false,
    highSchoolGceOLProbatoirDate:
      toDateString(data.highSchoolGceOLProbatoirDate),
    highSchoolGceOLProbatoireCertificates:
      normalizeArray<ApplicationDocument>(
        data.highSchoolGceOLProbatoireCertificates as ApplicationDocument[],
      ),
    highSchoolGceALBACDate:
      toDateString(data.highSchoolGceALBACDate),
    highSchoolGceALBACCertificates: normalizeArray<ApplicationDocument>(
      data.highSchoolGceALBACCertificates as ApplicationDocument[],
    ),
    universityStudent: data.universityStudent ?? false,
    universityStartDate: toDateString(data.universityStartDate),
    universityEndDate: toDateString(data.universityEndDate),
    universityCertificates: normalizeArray<ApplicationDocument>(
      data.universityCertificates as ApplicationDocument[],
    ),
  };
};
