import type { Application } from '@app/server/db/schema';
import type {
  ApplicationData,
  ApplicationDocument,
  ApplicationMeta,
  ApplicationPhoneNumber,
} from '@app/types/application-data';

export const normalizeDate = (
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

export const normalizeArray = <T>(
  value: T[] | null | undefined,
  fallback: T[] = [],
): T[] => value ?? fallback;

export const toDateString = (
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
  country: application.country,
  city: application.city,
  whereAreYou: application.whereAreYou ?? undefined,
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
    country: data.country,
    city: data.city,
    whereAreYou: data.whereAreYou ?? null,
  };
};
