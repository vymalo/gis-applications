'use client';

import { DateInputComponent } from '@app/components/inputs/date';
import { FileInputComponent } from '@app/components/inputs/file-input';
import { SelectComponent } from '@app/components/inputs/select';
import { TextInputComponent } from '@app/components/inputs/text';
import { TextareaInputComponent } from '@app/components/inputs/textarea';
import { ToggleInputComponent } from '@app/components/inputs/toggle';
import {
  MAX_CANDIDATE_BIRTH_DATE,
  MAX_CANDIDATE_GCE_DATE,
  MIN_CANDIDATE_BIRTH_DATE,
} from '@app/components/inputs/utils';
import { api } from '@app/trpc/react';
import { type Application } from '@prisma/client';
import { FieldArray, Form, Formik } from 'formik';
import Link from 'next/link';
import { Minus, Plus } from 'react-feather';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import {useRouter} from 'next/navigation'

const Schema = z.object({
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
      phoneNumbers: z
        .array(
          z.object({
            phoneNumber: z.string(),
            whatsappCall: z.boolean(),
            normalCall: z.boolean(),
          }),
        )
        .min(1, { message: 'At least one phone number is required' }),
      country: z.string(),
      city: z.string(),
      whereAreYou: z.string().optional(),
    })
    .required(),
});

interface Values {
  id: string | null;
  email: string;
  data: {
    firstName: string;
    lastName: string;
    birthDate: Date;
    whoAreYou?: string;
    phoneNumbers: {
      phoneNumber: string;
      whatsappCall?: boolean;
      normalCall?: boolean;
    }[];
    country: string;
    city: string;
    highSchoolOver: boolean;
    whereAreYou: string;
    universityStudent: boolean;
    universityStartDate: Date;
    universityEndDate: Date;
    universityCertificates: Date;
  };
}

export type SingleApplyProps =
  | {
      application?: null;
    }
  | {
      application: Application;
    };

export function SingleApply({ application = null }: SingleApplyProps) {
  const { mutateAsync } = api.application.save.useMutation();
  const router = useRouter();

  return (
    <Formik<Values>
      validationSchema={toFormikValidationSchema(Schema)}
      initialValues={{
        email: application?.email ?? '',
        data: application?.data ?? {
          firstName: '',
          lastName: '',
          birthDate: MAX_CANDIDATE_BIRTH_DATE,
          whoAreYou: '',
          phoneNumbers: [],
          country: 'cameroon',
          city: '',
          whereAreYou: '',
        },
      }}
      onSubmit={async ({ id: _, ...rest }, { resetForm, setSubmitting }) => {
        setSubmitting(true);
        const { id } = await mutateAsync({ ...rest, id: application?.id });
        resetForm();
        router.push(`/apply/success?application_id=${id}`);
        setSubmitting(false);
      }}>
      {({ values }) => (
        <Form className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <h1 className='app-title md:col-span-2'>
            Single Apply
          </h1>
          <p className='md:col-span-2'>
            You shall apply for the GIS Program here. If any question, please
            review the{' '}
            <Link
              target='_blank'
              rel='canonical'
              href='/res/faq'
              className='link'>
              FAQ
            </Link>{' '}
            page.
          </p>

          <TextInputComponent
            label='First name'
            name='data.firstName'
            autoComplete='given-name'
          />
          <TextInputComponent
            label='Last name'
            name='data.lastName'
            autoComplete='family-name'
          />
          <TextInputComponent label='Email' name='email' type='email' />
          <DateInputComponent
            label='Birth date'
            name='data.birthDate'
            maxDate={MAX_CANDIDATE_BIRTH_DATE}
            minDate={MIN_CANDIDATE_BIRTH_DATE}
            defaultDate={MAX_CANDIDATE_BIRTH_DATE}
          />

          <div className='col-span-full'>
            <TextareaInputComponent
              label='Who are you?'
              name='data.whoAreYou'
              placeholder='Tell us more about you'
              rows={4}
            />
          </div>

          <div className='divider col-span-full'>Contact</div>

          <div className='col-span-full'>
            <div className='label'>
              <span className='label-text'>Phone numbers</span>
            </div>

            <FieldArray
              name='data.phoneNumbers'
              render={(arrayHelpers) => (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {values.data.phoneNumbers.map((phoneNumber, index) => (
                    <div
                      key={index}
                      className='flex w-full flex-col items-end gap-4'>
                      <TextInputComponent
                        label='Number'
                        name={`data.phoneNumbers.${index}.phoneNumber`}
                      />
                      <ToggleInputComponent
                        label='Whatsapp call?'
                        name={`data.phoneNumbers.${index}.whatsappCall`}
                      />
                      <ToggleInputComponent
                        label='Normal call?'
                        name={`data.phoneNumbers.${index}.normalCall`}
                      />

                      <button
                        className='btn btn-soft btn-error btn-circle'
                        type='button'
                        onClick={() => arrayHelpers.remove(index)}>
                        <Minus />
                      </button>
                    </div>
                  ))}

                  <div className='md:col-span-2'>
                    <button
                      type='button'
                      className='btn btn-soft btn-primary btn-circle'
                      onClick={() =>
                        arrayHelpers.push({
                          phoneNumber: '',
                          whatsappCall: false,
                          normalCall: false,
                        })
                      }>
                      <Plus />
                    </button>
                  </div>
                </div>
              )}
            />
          </div>

          <div className='col-span-full grid grid-cols-1 gap-4 md:grid-cols-2'>
            <SelectComponent label='Country' name='data.country'>
              <option value='cameroon'>Cameroon</option>
            </SelectComponent>
            <TextInputComponent label='City / Town' name='data.city' />

            <div className='col-span-full'>
              <TextareaInputComponent
                label='Where are you?'
                name='data.whereAreYou'
                placeholder='You can add details about where you are'
                rows={4}
              />
            </div>
          </div>

          <div className='divider col-span-full'>Education</div>

          <div className='col-span-full flex flex-col gap-4'>
            <ToggleInputComponent
              label='Done with high school?'
              name='data.highSchoolOver'
            />

            <DateInputComponent
              label='GCE GCE O/L or Probatoire date'
              name='data.highSchoolGceOLProbatoirDate'
              maxDate={MAX_CANDIDATE_GCE_DATE}
            />

            <FileInputComponent
              label='Your GCE O/L or Probatoire certificate(s)'
              name='data.highSchoolGceOLProbatoireCertificates'
              accept='image/png,image/jpeg,image/jpg '
              max={10}
            />

            {values.data.highSchoolOver && (
              <>
                <DateInputComponent
                  label='GCE A/L or BAC date'
                  name='data.highSchoolGceALBACDate'
                  maxDate={MAX_CANDIDATE_GCE_DATE}
                />

                <FileInputComponent
                  label='Your GCE A/L or BAC certificate(s)'
                  name='data.highSchoolGceALBACCertificates'
                  accept='image/png,image/jpeg,image/jpg '
                  max={10}
                />
              </>
            )}
          </div>

          <div className='divider col-span-full'>University</div>

          <div className='col-span-full flex flex-col gap-4'>
            <ToggleInputComponent
              label='University student?'
              name='data.universityStudent'
            />

            {values.data.universityStudent && (
              <>
                <DateInputComponent
                  label='University start date'
                  name='data.universityStartDate'
                />

                <DateInputComponent
                  label='University end date'
                  name='data.universityEndDate'
                />

                <FileInputComponent
                  label='Your university certificate(s)'
                  name='data.universityCertificates'
                  accept='image/png,image/jpeg,image/jpg '
                  max={10}
                />
              </>
            )}
          </div>

          <div />

          <button
            className='btn btn-soft btn-primary col-span-full'
            type='submit'>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}
