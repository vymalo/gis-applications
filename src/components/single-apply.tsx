'use client';

import { api } from '@app/trpc/react';
import type {
  ApplicationData,
  NormalizedApplication,
} from '@app/types/application-data';
import {
  aboutStepSchema,
  basicsStepSchema,
  contactStepSchema,
  documentsStepSchema,
  educationStepSchema,
  fullSchema,
  programStepSchema,
} from '@app/components/single-apply-schemas';
import {
  MAX_CANDIDATE_BIRTH_DATE,
} from '@app/components/inputs/utils';
import { basicsStep } from '@app/components/single-apply-steps/basics-step';
import { aboutStep } from '@app/components/single-apply-steps/about-step';
import { contactStep } from '@app/components/single-apply-steps/contact-step';
import { programStep } from '@app/components/single-apply-steps/program-step';
import { educationStep } from '@app/components/single-apply-steps/education-step';
import { documentsStep } from '@app/components/single-apply-steps/documents-step';
import { reviewStep } from '@app/components/single-apply-steps/review-step';
import { Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import type { SingleApplyValues } from '@app/components/single-apply-types';

const steps = [
  { id: 'basics', label: 'Basics' },
  { id: 'about', label: 'About you' },
  { id: 'contact', label: 'Contact' },
  { id: 'program', label: 'Program' },
  { id: 'education', label: 'Education' },
  { id: 'documents', label: 'Documents' },
  { id: 'review', label: 'Review' },
] as const;

type StepId = (typeof steps)[number]['id'];

const stepValidationSchemaMap: Partial<Record<StepId, z.ZodTypeAny>> = {
  basics: basicsStepSchema,
  about: aboutStepSchema,
  contact: contactStepSchema,
  // program has no inputs; skip validation to avoid blocking
  education: educationStepSchema,
  documents: documentsStepSchema,
  review: fullSchema,
};

const coerceBirthDate = (
  value?: string | Date | null,
  fallback?: Date,
): Date => {
  if (!value) {
    return fallback ?? MAX_CANDIDATE_BIRTH_DATE;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf())
    ? fallback ?? MAX_CANDIDATE_BIRTH_DATE
    : parsed;
};

const createDefaultApplicationData = (
  birthDate?: Date,
): ApplicationData => ({
  firstName: '',
  lastName: '',
  birthDate: birthDate ?? MAX_CANDIDATE_BIRTH_DATE,
  whoAreYou: '',
  country: 'cameroon',
  city: '',
  whereAreYou: '',
  phones: [],
  programChoices: [],
  educations: [],
  documents: [],
});

const coerceOptionalDate = (value?: string | Date | null) => {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
};

export type SingleApplyProps = {
  application?: NormalizedApplication | null;
};

export function SingleApply({
                              application = null,
                              user = undefined,
                            }: SingleApplyProps & {
  user?: {
    email?: string | null;
    name?: string | null;
    birthDate?: string | Date | null;
  };
}) {
  const [stepParam, setStepParam] = useQueryState<StepId>(
    'step',
    parseAsStringEnum(steps.map((step) => step.id as StepId)).withDefault(
      'basics',
    ),
  );
  const currentStepId = stepParam ?? 'basics';
  const [submitIntent, setSubmitIntent] = useState<'next' | 'submit'>('next');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | undefined>(
    application?.id,
  );

  const initialApplicationData: ApplicationData = useMemo(() => {
    if (application?.data) {
      return {
        ...application.data,
        birthDate: coerceBirthDate(application.data.birthDate),
      };
    }

    const base = createDefaultApplicationData(
      coerceBirthDate(user?.birthDate ?? undefined),
    );
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      base.firstName = parts[0] ?? '';
      base.lastName = parts.slice(1).join(' ');
    }
    return base;
  }, [application, user]);

  const initialProgramChoices = useMemo(
    () =>
      application?.programChoices ?? [],
    [application],
  );

  const initialPhones = useMemo(
    () =>
      application?.phones ?? [
        {
          phoneNumber: '',
          whatsappCall: false,
          normalCall: false,
          kind: 'PRIMARY' as const,
        },
      ],
    [application],
  );

  const initialEducations = useMemo(
    () => {
      const base =
        application?.educations ??
        [
          {
            type: 'GCE_OL' as const,
            schoolName: '',
            city: '',
            country: '',
            fieldOfStudy: '',
            status: 'IN_PROGRESS' as const,
          },
        ];

      return base.map((edu) => ({
        ...edu,
        startDate: coerceOptionalDate(edu.startDate),
        endDate: coerceOptionalDate(edu.endDate),
        completionDate: coerceOptionalDate(edu.completionDate),
      }));
    },
    [application],
  );

  const initialDocuments = useMemo(
    () =>
      (application?.documents ?? []).map((doc) => ({
        ...doc,
        files: undefined,
      })),
    [application],
  );

  const { mutateAsync } = api.application.save.useMutation();
  const updateProfile = api.auth.updateProfile.useMutation();
  const router = useRouter();
  const currentStepIndex = steps.findIndex(
    (step) => step.id === currentStepId,
  );
  const safeStepIndex =
    currentStepIndex >= 0 && currentStepIndex < steps.length
      ? currentStepIndex
      : 0;
  const currentStep = steps[safeStepIndex] ?? steps[0];
  const stepValidationSchema = useMemo(() => {
    return stepValidationSchemaMap[currentStep.id];
  }, [currentStep.id]);

  const buildPayload = (
    values: SingleApplyValues,
    includeAll: boolean,
    activeStepId: StepId,
  ) => {
    const payload: any = {
      id: applicationId,
      email: values.email,
      data: values.data,
    };

    const activeIndex = steps.findIndex((step) => step.id === activeStepId);

    const includeUpTo = (target: StepId) =>
      includeAll ||
      steps.findIndex((step) => step.id === target) <= activeIndex;

    if (includeUpTo('contact')) {
      payload.phones = values.phones;
    }
    if (includeUpTo('education')) {
      payload.educations = values.educations;
    }
    if (includeUpTo('documents')) {
      payload.documents = values.documents.map((doc) => {
        const kind = doc.kind ?? 'OTHER';
        const firstFile = doc.files?.[0];
        const publicUrl = doc.publicUrl || firstFile?.publicUrl || '';
        const name =
          (doc.name && doc.name.trim().length
            ? doc.name
            : firstFile?.name || kind) ?? kind;
        const educationId =
          doc.educationId && doc.educationId.trim().length
            ? doc.educationId
            : undefined;

        return {
          ...doc,
          kind,
          name,
          publicUrl,
          educationId,
          files: undefined,
        };
      });
    }

    return payload;
  };

  return (
    <Formik<SingleApplyValues>
      validationSchema={
        stepValidationSchema
          ? toFormikValidationSchema(stepValidationSchema)
          : undefined
      }
      initialValues={useMemo(
        () => ({
          email: application?.email ?? user?.email ?? '',
          data: initialApplicationData,
          programChoices: initialProgramChoices,
          phones: initialPhones,
          educations: initialEducations,
          documents: initialDocuments,
        }),
        [
          application?.email,
          initialApplicationData,
          initialProgramChoices,
          initialPhones,
          initialEducations,
          initialDocuments,
          user?.email,
        ],
      )}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        setErrorMessage(null);
        try {
          const isFinalSubmit = submitIntent === 'submit';

          if (isFinalSubmit) {
            fullSchema.parse(values);
          }

          // Program step has no inputs; move forward without a network roundtrip.
          if (currentStep.id === 'program') {
            const nextIndex = Math.min(
              safeStepIndex + 1,
              steps.length - 1,
            );
            const nextStep =
              steps[nextIndex] ?? steps[safeStepIndex] ?? steps[0];
            void setStepParam(nextStep.id);
            return;
          }

          const result = await mutateAsync(
            buildPayload(values, isFinalSubmit, currentStep.id),
          );
          const newId = result?.id ?? applicationId;

          if (newId && newId !== applicationId) {
            setApplicationId(newId);
          }

          if (user?.email) {
            const firstName = values.data.firstName;
            const lastName = values.data.lastName;
            const birthDate = values.data.birthDate;
            if (firstName && lastName && birthDate) {
              void updateProfile
                .mutateAsync({
                  firstName,
                  lastName,
                  birthDate: coerceBirthDate(birthDate),
                })
                .catch(() => undefined);
            }
          }

          if (isFinalSubmit) {
            if (!newId) {
              return;
            }
            router.push(`/apply/success?application_id=${newId}`);
            return;
          }

          const nextIndex = Math.min(safeStepIndex + 1, steps.length - 1);
          const nextStep = steps[nextIndex] ?? steps[safeStepIndex] ?? steps[0];
          void setStepParam(nextStep.id);
        } catch (error) {
          console.error(error);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to save your progress right now.',
          );
        } finally {
          setSubmitting(false);
        }
      }}>
      {({ isSubmitting }) => {
        const StepComponent =
          currentStep.id === 'basics'
            ? basicsStep
            : currentStep.id === 'about'
              ? aboutStep
              : currentStep.id === 'contact'
                ? contactStep
                : currentStep.id === 'program'
                  ? programStep
                  : currentStep.id === 'education'
                    ? educationStep
                    : currentStep.id === 'documents'
                      ? documentsStep
                      : reviewStep;

        return (
        <Form className="flex flex-col gap-8 max-w-3xl mx-auto">
          <header className="flex flex-col gap-2">
            <h1 className="app-title">Apply to the GIS Program</h1>
            <p>
              You shall apply for the GIS Program here. If any question, please
              review the{' '}
              <Link
                target="_blank"
                rel="canonical"
                href="/res/faq"
                className="link link-primary">
               FAQ
              </Link>{' '}
              page.
            </p>
          </header>

          <ol className="steps w-full overflow-x-auto">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;
              const state =
                isActive || isCompleted ? 'step-primary' : '';
              return (
                <li
                  key={step.id}
                  className={`step ${state}`}>
                  {step.label}
                </li>
              );
            })}
          </ol>
          <StepComponent user={user} />

          {errorMessage && (
            <div className="alert alert-error">
              <div>
                <p className="font-semibold">We could not save this step.</p>
                <p className="text-sm opacity-80">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              className="btn btn-soft"
              disabled={safeStepIndex === 0}
              onClick={() => {
                const prevIndex = Math.max(safeStepIndex - 1, 0);
                const prevStep = steps[prevIndex] ?? steps[0];
                void setStepParam(prevStep.id);
              }}>
              Back
            </button>
            <button
              className="btn btn-soft btn-primary"
              type="submit"
              disabled={isSubmitting}
              onClick={() =>
                setSubmitIntent(
                  safeStepIndex === steps.length - 1 ? 'submit' : 'next',
                )
              }>
              {safeStepIndex === steps.length - 1
                ? 'Submit application'
                : 'Save & continue'}
            </button>
          </div>
        </Form>
      );}}
    </Formik>
  );
}
