'use client';

import {
  MAX_CANDIDATE_BIRTH_DATE,
  MIN_CANDIDATE_BIRTH_DATE,
} from '@app/components/inputs/utils';
import { z } from 'zod';

export const programChoiceSchema = z.object({
  programCode: z.string().min(1, 'Program is required'),
  campus: z.string().optional(),
  startTerm: z.string().optional(),
  studyMode: z.string().optional(),
  fundingType: z.string().optional(),
  rank: z.number().int().min(1).optional(),
});

export const phoneSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number required'),
  whatsappCall: z.boolean(),
  normalCall: z.boolean(),
  kind: z.string().optional(),
});

export const educationSchema = z.object({
  type: z.enum([
    'GCE_OL',
    'GCE_AL',
    'BAC',
    'PROBATOIRE',
    'BTS',
    'BACHELOR',
    'OTHER',
  ]),
  schoolName: z.string().min(1),
  city: z.string().optional(),
  country: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  completionDate: z.date().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']).optional(),
  gpa: z.string().optional(),
  candidateNumber: z.string().optional(),
  sessionYear: z.number().int().optional(),
});

const filePickedSchema = z.object({
  name: z.string().optional(),
  publicUrl: z.string().min(1),
});

export const documentSchema = z.object({
  kind: z.enum([
    'ID',
    'GCE_OL_CERT',
    'PROBATOIRE_CERT',
    'GCE_AL_CERT',
    'BAC_CERT',
    'UNIVERSITY_CERT',
    'RECOMMENDATION',
    'MOTIVATION',
    'CV',
    'TRANSCRIPT',
    'OTHER',
  ]),
  name: z.string().optional(),
  publicUrl: z.string().optional(),
  files: z.array(filePickedSchema).optional(),
  educationId: z.string().nullable().optional(),
});

export const fullSchema = z.object({
  email: z.string().email(),
  data: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      birthDate: z
        .date()
        .max(MAX_CANDIDATE_BIRTH_DATE, { message: 'Too young' })
        .min(MIN_CANDIDATE_BIRTH_DATE, { message: 'Too old' }),
      whoAreYou: z.string().optional(),
      country: z.string(),
      city: z.string(),
      whereAreYou: z.string().optional(),
    })
    .loose()
    .required(),
  programChoices: z.array(programChoiceSchema).optional(),
  phones: z.array(phoneSchema).min(1, 'At least one phone number is required'),
  educations: z.array(educationSchema).min(1, 'At least one education entry'),
  documents: z.array(documentSchema).optional(),
});

export const basicsStepSchema = z.object({
  email: z.string().email(),
  data: z
    .object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      birthDate: z
        .date()
        .max(MAX_CANDIDATE_BIRTH_DATE, { message: 'Too young' })
        .min(MIN_CANDIDATE_BIRTH_DATE, { message: 'Too old' }),
    })
    .required(),
});

export const aboutStepSchema = z.object({
  data: z
    .object({
      whoAreYou: z.string().optional(),
    })
    .partial()
    .required(),
});

export const contactStepSchema = z.object({
  email: z.string().email().optional(),
  data: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      birthDate: z.date().optional(),
      country: z.string(),
      city: z.string(),
      whereAreYou: z.string().optional(),
      whoAreYou: z.string().optional(),
    })
    .required(),
  programChoices: z.array(programChoiceSchema).optional(),
  phones: z
    .array(phoneSchema)
    .min(1, 'At least one phone number is required'),
  educations: z.array(educationSchema).optional(),
  documents: z.array(documentSchema).optional(),
});

export const programStepSchema = fullSchema.partial();

export const educationStepSchema = z.object({
  email: z.string().email().optional(),
  data: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      birthDate: z.date().optional(),
      whoAreYou: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      whereAreYou: z.string().optional(),
    })
    .required(),
  programChoices: z.array(programChoiceSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  educations: z
    .array(educationSchema)
    .min(1, 'At least one education entry'),
  documents: z.array(documentSchema).optional(),
});

export const documentsStepSchema = z.object({
  documents: z.array(documentSchema).optional(),
});
