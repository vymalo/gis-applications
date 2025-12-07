import { createId } from '@paralleldrive/cuid2';
import { ilike, inArray } from 'drizzle-orm';

import {
  applicationConsents,
  applicationDocuments,
  applicationEducations,
  applicationPhones,
  applicationProgramChoices,
  applicationStatusHistory,
  applications,
  type Application,
  type ApplicationConsent,
  type ApplicationConsentInsert,
  type ApplicationDocument,
  type ApplicationDocumentInsert,
  type ApplicationEducation as ApplicationEducationRow,
  type ApplicationEducationInsert,
  type ApplicationPhone as ApplicationPhoneRow,
  type ApplicationPhoneInsert,
  type ApplicationProgramChoice,
  type ApplicationProgramChoiceInsert,
  type ApplicationStatusHistory,
  type User,
} from '@app/server/db/schema';
import {
  buildApplicationData,
  buildApplicationMeta,
  normalizeArray,
  toDateString,
} from '@app/server/application-normalizer';
import {
  ApplicationStatus,
} from '@app/types/application-status';
import type {
  ApplicationConsent as ApplicationConsentDto,
  ApplicationData,
  ApplicationDocumentStatus,
  ApplicationEducation as ApplicationEducationDto,
  ApplicationEducationStatus,
  ApplicationEducationType,
  ApplicationPhone as ApplicationPhoneDto,
  ApplicationPhoneKind,
  ApplicationProgramChoice as ApplicationProgramChoiceDto,
  ApplicationStoredDocument,
  NormalizedApplication,
} from '@app/types/application-data';

export type ApplicationRelations = {
  programChoices: Record<string, ApplicationProgramChoice[]>;
  educations: Record<string, ApplicationEducationRow[]>;
  documents: Record<string, ApplicationDocument[]>;
  phones: Record<string, ApplicationPhoneRow[]>;
  consents: Record<string, ApplicationConsent[]>;
  statusHistory: Record<string, ApplicationStatusHistory[]>;
};

const groupByApplicationId = <T extends { applicationId: string }>(
  items: T[],
): Record<string, T[]> =>
  items.reduce<Record<string, T[]>>((acc, item) => {
    const list = acc[item.applicationId] ?? [];
    list.push(item);
    acc[item.applicationId] = list;
    return acc;
  }, {});

const toStoredDocument = (
  doc: ApplicationDocument,
): ApplicationStoredDocument => ({
  id: doc.id,
  applicationId: doc.applicationId,
  educationId: doc.educationId ?? undefined,
  kind: doc.kind,
  name: doc.name,
  publicUrl: doc.publicUrl,
  status: doc.status,
  reviewerComment: doc.reviewerComment ?? null,
});

const toPhoneDto = (phone: ApplicationPhoneRow) => ({
  id: phone.id,
  phoneNumber: phone.phoneNumber,
  whatsappCall: phone.whatsappCall ?? false,
  normalCall: phone.normalCall ?? false,
  kind: phone.kind as ApplicationPhoneKind,
});

const toProgramChoiceDto = (
  choice: ApplicationProgramChoice,
): ApplicationProgramChoiceDto => ({
  id: choice.id,
  rank: choice.rank ?? undefined,
  programCode: choice.programCode,
  campus: choice.campus ?? undefined,
  startTerm: choice.startTerm ?? undefined,
  studyMode: choice.studyMode ?? undefined,
  fundingType: choice.fundingType ?? undefined,
});

const toEducationDto = (edu: ApplicationEducationRow) => ({
  id: edu.id,
  type: edu.type as ApplicationEducationType,
  schoolName: edu.schoolName,
  city: edu.city ?? undefined,
  country: edu.country ?? undefined,
  fieldOfStudy: edu.fieldOfStudy ?? undefined,
  startDate: edu.startDate ?? undefined,
  endDate: edu.endDate ?? undefined,
  completionDate: edu.completionDate ?? undefined,
  status: edu.status as ApplicationEducationStatus | undefined,
  gpa: edu.gpa ?? undefined,
  candidateNumber: edu.candidateNumber ?? undefined,
  sessionYear: edu.sessionYear ?? undefined,
});

const toConsentDto = (consent: ApplicationConsent) => ({
  id: consent.id,
  consentType: consent.consentType,
  value: consent.value,
  grantedAt: consent.grantedAt ?? undefined,
  version: consent.version ?? undefined,
});

const toStatusHistoryDto = (entry: ApplicationStatusHistory) => ({
  id: entry.id,
  status: entry.status as ApplicationStatus,
  changedAt: entry.changedAt ?? undefined,
  changedById: entry.changedById ?? undefined,
  note: entry.note ?? undefined,
});

const applyPhonesToData = (
  data: ApplicationData,
  phones: ApplicationPhoneRow[],
) => {
  if (!phones.length) {
    return { data, phoneDtos: [] };
  }
  const phoneDtos = phones.map(toPhoneDto);
  return { data, phoneDtos };
};

const applyDocumentsToData = (
  data: ApplicationData,
  docs: ApplicationDocument[],
) => {
  if (!docs.length) {
    return { data, storedDocuments: [] as ApplicationStoredDocument[] };
  }

  const storedDocuments = docs.map(toStoredDocument);

  return {
    data,
    storedDocuments,
  };
};

export const editableStatusesForApplicant: ApplicationStatus[] = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.NEED_APPLICANT_INTERVENTION,
];

export const applicationService = {
  buildSearchConditions: (query: string) => {
    const fields = [
      applications.lastName,
      applications.firstName,
      applications.whoAreYou,
      applications.whereAreYou,
    ];
    return fields.map((field) => ilike(field, `%${query}%`));
  },

  loadApplicationRelations: async (
    db: typeof import('@app/server/db').db,
    applicationIds: string[],
  ): Promise<ApplicationRelations> => {
    if (!applicationIds.length) {
      return {
        programChoices: {},
        educations: {},
        documents: {},
        phones: {},
        consents: {},
        statusHistory: {},
      };
    }

    const [programChoices, educations, documents, phones, consents, statusHistory] =
      await Promise.all([
        db
          .select()
          .from(applicationProgramChoices)
          .where(inArray(applicationProgramChoices.applicationId, applicationIds)),
        db
          .select()
          .from(applicationEducations)
          .where(inArray(applicationEducations.applicationId, applicationIds)),
        db
          .select()
          .from(applicationDocuments)
          .where(inArray(applicationDocuments.applicationId, applicationIds)),
        db
          .select()
          .from(applicationPhones)
          .where(inArray(applicationPhones.applicationId, applicationIds)),
        db
          .select()
          .from(applicationConsents)
          .where(inArray(applicationConsents.applicationId, applicationIds)),
        db
          .select()
          .from(applicationStatusHistory)
          .where(inArray(applicationStatusHistory.applicationId, applicationIds)),
      ]);

    return {
      programChoices: groupByApplicationId(programChoices),
      educations: groupByApplicationId(educations),
      documents: groupByApplicationId(documents),
      phones: groupByApplicationId(phones),
      consents: groupByApplicationId(consents),
      statusHistory: groupByApplicationId(statusHistory),
    };
  },

  normalizeApplication: (
    row: { application: Application; createdBy: User | null },
    relations?: ApplicationRelations,
  ): NormalizedApplication => {
    const {
      metaInvitedStatuses,
      metaDocumentStatuses,
      metaDocumentComments,
      ...application
    } = row.application;

    const status = application.status ?? ApplicationStatus.DRAFT;

    const relationSet = relations
      ? {
          programChoices: relations.programChoices[application.id] ?? [],
          educations: relations.educations[application.id] ?? [],
          documents: relations.documents[application.id] ?? [],
          phones: relations.phones[application.id] ?? [],
          consents: relations.consents[application.id] ?? [],
          statusHistory: relations.statusHistory[application.id] ?? [],
        }
      : {
          programChoices: [],
          educations: [],
          documents: [],
          phones: [],
          consents: [],
          statusHistory: [],
        };

    const baseData = buildApplicationData(row.application);
    const { data: withPhones, phoneDtos } = applyPhonesToData(
      baseData,
      relationSet.phones,
    );
    const { data: withDocuments, storedDocuments } = applyDocumentsToData(
      withPhones,
      relationSet.documents,
    );

    return {
      ...application,
      createdBy: row.createdBy ?? null,
      data: withDocuments,
      meta: buildApplicationMeta(row.application),
      status: status as ApplicationStatus,
      programChoices: relationSet.programChoices.map(toProgramChoiceDto),
      educations: relationSet.educations.map(toEducationDto),
      documents: storedDocuments,
      phones: phoneDtos,
      consents: relationSet.consents.map(toConsentDto),
      statusHistory: relationSet.statusHistory.map(toStatusHistoryDto),
    };
  },

  deriveProgramChoices: (
    choices: unknown[] | undefined,
  ): ApplicationProgramChoiceInsert[] =>
    (choices as ApplicationProgramChoiceDto[] | undefined)?.map((choice) => ({
      applicationId: '',
      id: createId(),
      rank: choice.rank ?? 1,
      programCode: choice.programCode,
      campus: choice.campus ?? null,
      startTerm: choice.startTerm ?? null,
      studyMode: choice.studyMode ?? null,
      fundingType: choice.fundingType ?? null,
    })) ?? [],

  deriveEducations: (
    educations: unknown[] | undefined,
  ): ApplicationEducationInsert[] =>
    (educations as ApplicationEducationDto[] | undefined)?.map((education) => ({
      applicationId: '',
      id: createId(),
      type: education.type,
      schoolName: education.schoolName,
      city: education.city ?? null,
      country: education.country ?? null,
      fieldOfStudy: education.fieldOfStudy ?? null,
      startDate: toDateString(education.startDate) ?? null,
      endDate: toDateString(education.endDate) ?? null,
      completionDate: toDateString(education.completionDate) ?? null,
      status:
        (education.status as ApplicationEducationStatus | null) ?? 'IN_PROGRESS',
      gpa: education.gpa ?? null,
      candidateNumber: education.candidateNumber ?? null,
      sessionYear: education.sessionYear ?? null,
    })) ?? [],

  derivePhones: (
    phones: unknown[] | undefined,
    data: ApplicationData,
  ): ApplicationPhoneInsert[] => {
    const base =
      (phones as ApplicationPhoneDto[] | undefined) ??
      normalizeArray(data.phoneNumbers ?? []);

    return base
      .filter((phone) => phone.phoneNumber?.length)
      .map((phone) => {
        const phoneWithKind = phone as ApplicationPhoneDto;
        return {
          applicationId: '',
          id: createId(),
          phoneNumber: phone.phoneNumber,
          whatsappCall: !!phone.whatsappCall,
          normalCall: !!phone.normalCall,
          kind:
            (phoneWithKind.kind as ApplicationPhoneKind | undefined) ?? 'PRIMARY',
        } satisfies ApplicationPhoneInsert;
      });
  },

  deriveDocuments: (
    documents: unknown[] | undefined,
  ): ApplicationDocumentInsert[] => {
    const provided =
      ((documents as (ApplicationStoredDocument & {
        files?: { publicUrl: string; name?: string }[];
      })[] | undefined) ?? []) as (ApplicationStoredDocument & {
        files?: { publicUrl: string; name?: string }[];
      })[];

    const mapped: ApplicationDocumentInsert[] = [];

    provided.forEach((doc) => {
      const kind = doc.kind ?? 'OTHER';
      const firstFile = doc.files?.[0];
      const publicUrl = doc.publicUrl || firstFile?.publicUrl || '';
      if (!publicUrl) {
        return;
      }
      const fallbackName = firstFile?.name || kind;
      const name =
        (doc.name && doc.name.trim().length ? doc.name : fallbackName) ?? kind;
      const educationId =
        doc.educationId && doc.educationId.trim().length
          ? doc.educationId
          : null;

      mapped.push({
        applicationId: '',
        id: createId(),
        educationId,
        kind,
        name,
        publicUrl,
        status: (doc.status as ApplicationDocumentStatus | undefined) ?? 'pending',
        reviewerComment: doc.reviewerComment ?? null,
      });
    });

    return mapped;
  },

  deriveConsents: (
    consents: unknown[] | undefined,
  ): ApplicationConsentInsert[] =>
    (consents as ApplicationConsentDto[] | undefined)?.map((consent) => ({
      applicationId: '',
      id: createId(),
      consentType: consent.consentType,
      value: consent.value,
      grantedAt: consent.grantedAt != null ? new Date(consent.grantedAt) : undefined,
      version: consent.version ?? null,
    })) ?? [],
};
