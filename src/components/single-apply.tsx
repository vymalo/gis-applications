'use client';

import { DateInputComponent } from '@app/components/inputs/date';
import { FileInputComponent } from '@app/components/inputs/file-input';
import { SelectComponent } from '@app/components/inputs/select';
import { TextInputComponent } from '@app/components/inputs/text';
import { TextareaInputComponent } from '@app/components/inputs/textarea';
import { ToggleInputComponent } from '@app/components/inputs/toggle';
import { MAX_CANDIDATE_BIRTH_DATE, MIN_CANDIDATE_BIRTH_DATE } from '@app/components/inputs/utils';
import { api } from '@app/trpc/react';
import type {
  ApplicationData,
  ApplicationEducation,
  ApplicationPhone,
  ApplicationProgramChoice,
  ApplicationStoredDocument,
  NormalizedApplication,
} from '@app/types/application-data';
import { FieldArray, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'react-feather';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import dynamic from 'next/dynamic';

const programChoiceSchema = z.object({
  programCode: z.string().min(1, 'Program is required'),
  campus: z.string().optional(),
  startTerm: z.string().optional(),
  studyMode: z.string().optional(),
  fundingType: z.string().optional(),
  rank: z.number().int().min(1).optional(),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number required'),
  whatsappCall: z.boolean(),
  normalCall: z.boolean(),
  kind: z.string().optional(),
});

const educationSchema = z.object({
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

const documentSchema = z.object({
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
  name: z.string().min(1),
  publicUrl: z.string().min(1),
  educationId: z.string().nullable().optional(),
});

const Schema = z.object({
  email: z.email(),
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
  programChoices: z.array(programChoiceSchema).min(1),
  phones: z.array(phoneSchema).min(1, 'At least one phone number is required'),
  educations: z.array(educationSchema).min(1, 'At least one education entry'),
  documents: z.array(documentSchema).optional(),
});

const createDefaultApplicationData = (): ApplicationData => ({
  firstName: '',
  lastName: '',
  birthDate: MAX_CANDIDATE_BIRTH_DATE,
  whoAreYou: '',
  country: 'cameroon',
  city: '',
  whereAreYou: '',
  phones: [],
  programChoices: [],
  educations: [],
  documents: [],
});

interface Values {
  email: string;
  data: ApplicationData;
  programChoices: ApplicationProgramChoice[];
  phones: ApplicationPhone[];
  educations: ApplicationEducation[];
  documents: ApplicationStoredDocument[];
}

export type SingleApplyProps =
  | {
  application?: null;
}
  | {
  application: NormalizedApplication;
};

export function SingleApply({
                              application = null,
                              user = undefined,
                            }: SingleApplyProps & { user?: { email?: string | null } }) {
  const initialApplicationData =
    application?.data ?? createDefaultApplicationData();
  const initialProgramChoices =
    application?.programChoices ?? [
      { programCode: '', campus: '', startTerm: '', studyMode: '', fundingType: '', rank: 1 },
    ];
  const initialPhones =
    application?.phones ??
    [
      {
        phoneNumber: '',
        whatsappCall: false,
        normalCall: false,
        kind: 'PRIMARY',
      },
    ];
  const initialEducations =
    application?.educations ??
    [
      {
        type: 'GCE_OL',
        schoolName: '',
        city: '',
        country: '',
        fieldOfStudy: '',
        status: 'IN_PROGRESS',
      } as unknown as ApplicationEducation,
    ];
  const initialDocuments = application?.documents ?? [];
  const { mutateAsync } = api.application.save.useMutation();
  const router = useRouter();

  return (
    <Formik<Values>
      validationSchema={toFormikValidationSchema(Schema)}
      initialValues={{
        email: application?.email ?? user?.email ?? '',
        data: initialApplicationData,
        programChoices: initialProgramChoices as ApplicationProgramChoice[],
        phones: initialPhones as ApplicationPhone[],
        educations: initialEducations as ApplicationEducation[],
        documents: initialDocuments as ApplicationStoredDocument[],
      }}
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        setSubmitting(true);
        const result = await mutateAsync({
          ...values,
          id: application?.id,
        } as any);
        const applicationId = result?.id ?? application?.id;
        if (!applicationId) {
          resetForm();
          setSubmitting(false);
          return;
        }
        resetForm();
        router.push(`/apply/success?application_id=${applicationId}`);
        setSubmitting(false);
      }}>
      {({ values }) => (
        <Form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <h1 className="app-title md:col-span-2">Single Apply</h1>
          <p className="md:col-span-2">
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

          <TextInputComponent
            label="First name"
            name="data.firstName"
            autoComplete="given-name"
          />
          <TextInputComponent
            label="Last name"
            name="data.lastName"
            autoComplete="family-name"
          />
          <TextInputComponent
            label="Email"
            name="email"
            type="email"
            disabled={!!user}
          />
          <DateInputComponent
            label="Birth date"
            name="data.birthDate"
            maxDate={MAX_CANDIDATE_BIRTH_DATE}
            minDate={MIN_CANDIDATE_BIRTH_DATE}
            defaultDate={MAX_CANDIDATE_BIRTH_DATE}
          />

          <div className="col-span-full">
            <TextareaInputComponent
              label="Who are you?"
              name="data.whoAreYou"
              placeholder="Tell us more about you"
              rows={4}
            />
          </div>

          <div className="divider col-span-full">Contact</div>

          <div className="col-span-full">
            <div className="label">
              <span className="label-text text-base-content">
                Phone numbers
              </span>
            </div>

            <FieldArray
              name="phones"
              render={(arrayHelpers) => (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {values.phones.map((phoneNumber, index) => (
                    <div
                      key={index}
                      className="flex w-full flex-col items-end gap-4">
                      <TextInputComponent
                        label="Number (without +237)"
                        name={`phones.${index}.phoneNumber`}
                      />
                      <ToggleInputComponent
                        label="Whatsapp call?"
                        name={`phones.${index}.whatsappCall`}
                      />
                      <ToggleInputComponent
                        label="Normal call?"
                        name={`phones.${index}.normalCall`}
                      />
                      <SelectComponent
                        label="Kind"
                        name={`phones.${index}.kind`}>
                        <option value="PRIMARY">Primary</option>
                        <option value="SECONDARY">Secondary</option>
                        <option value="GUARDIAN">Guardian</option>
                        <option value="OTHER">Other</option>
                      </SelectComponent>

                      <button
                        className="btn btn-soft btn-error btn-circle"
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}>
                        <Minus />
                      </button>
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      className="btn btn-soft btn-primary"
                      onClick={() =>
                        arrayHelpers.push({
                          phoneNumber: '',
                          whatsappCall: false,
                          normalCall: false,
                          kind: 'SECONDARY',
                        })
                      }>
                      <span>Add a phone number</span>
                      <Plus />
                    </button>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectComponent label="Country" name="data.country">
              <option value="cameroon">Cameroon</option>
            </SelectComponent>
            <TextInputComponent label="City / Town" name="data.city" />

            <div className="col-span-full">
              <TextareaInputComponent
                label="Where are you?"
                name="data.whereAreYou"
                placeholder="You can add details about where you are"
                rows={4}
              />
            </div>
          </div>

          <div className="divider col-span-full">Program Choices</div>
          <div className="col-span-full">
            <FieldArray
              name="programChoices"
              render={(arrayHelpers) => (
                <div className="flex flex-col gap-4">
                  {values.programChoices.map((choice, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-4 md:grid-cols-3 border border-base-300 rounded-box p-4">
                      <TextInputComponent
                        label="Program code"
                        name={`programChoices.${index}.programCode`}
                      />
                      <TextInputComponent
                        label="Campus"
                        name={`programChoices.${index}.campus`}
                      />
                      <TextInputComponent
                        label="Start term"
                        name={`programChoices.${index}.startTerm`}
                      />
                      <TextInputComponent
                        label="Study mode"
                        name={`programChoices.${index}.studyMode`}
                      />
                      <TextInputComponent
                        label="Funding type"
                        name={`programChoices.${index}.fundingType`}
                      />
                      <TextInputComponent
                        label="Rank"
                        name={`programChoices.${index}.rank`}
                        type="number"
                      />
                      <button
                        type="button"
                        className="btn btn-soft btn-error btn-sm md:col-span-3"
                        onClick={() => arrayHelpers.remove(index)}>
                        Remove choice
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-soft btn-primary self-start"
                    onClick={() =>
                      arrayHelpers.push({
                        programCode: '',
                        campus: '',
                        startTerm: '',
                        studyMode: '',
                        fundingType: '',
                        rank: values.programChoices.length + 1,
                      })
                    }>
                    Add program choice
                  </button>
                </div>
              )}
            />
          </div>

          <div className="divider col-span-full">Education</div>
          <div className="col-span-full">
            <FieldArray
              name="educations"
              render={(arrayHelpers) => (
                <div className="flex flex-col gap-4">
                  {values.educations.map((education, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-4 md:grid-cols-2 border border-base-300 rounded-box p-4">
                      <SelectComponent
                        label="Type"
                        name={`educations.${index}.type`}>
                        <option value="GCE_OL">GCE O/L</option>
                        <option value="PROBATOIRE">Probatoire</option>
                        <option value="GCE_AL">GCE A/L</option>
                        <option value="BAC">BAC</option>
                        <option value="BTS">BTS</option>
                        <option value="BACHELOR">Bachelor</option>
                        <option value="OTHER">Other</option>
                      </SelectComponent>
                      <TextInputComponent
                        label="School name"
                        name={`educations.${index}.schoolName`}
                      />
                      <TextInputComponent
                        label="City"
                        name={`educations.${index}.city`}
                      />
                      <TextInputComponent
                        label="Country"
                        name={`educations.${index}.country`}
                      />
                      <TextInputComponent
                        label="Field of study"
                        name={`educations.${index}.fieldOfStudy`}
                      />
                      <SelectComponent
                        label="Status"
                        name={`educations.${index}.status`}>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </SelectComponent>
                      <TextInputComponent
                        label="Candidate number"
                        name={`educations.${index}.candidateNumber`}
                      />
                      <TextInputComponent
                        label="Session year"
                        name={`educations.${index}.sessionYear`}
                        type="number"
                      />
                      <DateInputComponent
                        label="Start date"
                        name={`educations.${index}.startDate`}
                      />
                      <DateInputComponent
                        label="End date"
                        name={`educations.${index}.endDate`}
                      />
                      <DateInputComponent
                        label="Completion date"
                        name={`educations.${index}.completionDate`}
                      />
                      <TextInputComponent
                        label="GPA / Grade"
                        name={`educations.${index}.gpa`}
                      />
                      <button
                        type="button"
                        className="btn btn-soft btn-error btn-sm md:col-span-2"
                        onClick={() => arrayHelpers.remove(index)}>
                        Remove education
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-soft btn-primary self-start"
                    onClick={() =>
                      arrayHelpers.push({
                        type: 'GCE_OL',
                        schoolName: '',
                        city: '',
                        country: '',
                        fieldOfStudy: '',
                        status: 'IN_PROGRESS',
                      })
                    }>
                    Add education
                  </button>
                </div>
              )}
            />
          </div>

          <div className="divider col-span-full">Documents</div>
          <div className="col-span-full">
            <FieldArray
              name="documents"
              render={(arrayHelpers) => (
                <div className="flex flex-col gap-4">
                  {values.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="card card-border bg-base-200/50 flex flex-col">

                      <div className="card-body">
                        <SelectComponent
                          label="Kind"
                          name={`documents.${index}.kind`}>
                          <option value="ID">ID</option>
                          <option value="GCE_OL_CERT">GCE O/L</option>
                          <option value="PROBATOIRE_CERT">Probatoire</option>
                          <option value="GCE_AL_CERT">GCE A/L</option>
                          <option value="BAC_CERT">BAC</option>
                          <option value="UNIVERSITY_CERT">University cert</option>
                          <option value="RECOMMENDATION">Recommendation</option>
                          <option value="MOTIVATION">Motivation</option>
                          <option value="CV">CV</option>
                          <option value="TRANSCRIPT">Transcript</option>
                          <option value="OTHER">Other</option>
                        </SelectComponent>
                        <TextInputComponent
                          label="Name"
                          name={`documents.${index}.name`}
                        />
                        <SelectComponent
                          label="Linked education"
                          name={`documents.${index}.educationId`}>
                          <option value="">Unlinked</option>
                          {values.educations.map((edu, eduIndex) => (
                            <option
                              key={eduIndex}
                              value={edu.id ?? `idx-${eduIndex}`}>
                              {edu.schoolName || `Education ${eduIndex + 1}`}
                            </option>
                          ))}
                        </SelectComponent>
                        <FileInputComponent
                          label="Upload document"
                          name={`documents.${index}.files`}
                          accept="image/*,application/pdf"
                          max={10}
                          multiple={false}
                        />

                        <div className="card-actions justify-end">
                          <button
                            type="button"
                            className="btn btn-soft btn-error btn-sm md:col-span-2"
                            onClick={() => arrayHelpers.remove(index)}>
                            Remove document
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-soft btn-primary self-start"
                    onClick={() =>
                      arrayHelpers.push({
                        kind: 'ID',
                        name: '',
                        publicUrl: '',
                        educationId: '',
                        files: [],
                      })
                    }>
                    Add document
                  </button>
                </div>
              )}
            />
          </div>

          <div />

          <button
            className="btn btn-soft btn-primary col-span-full"
            type="submit">
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}
