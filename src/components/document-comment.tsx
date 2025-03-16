'use client';

import { TextareaInputComponent } from '@app/components/inputs/textarea';
import { api } from '@app/trpc/react';
import { Form, Formik } from 'formik';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { Check, ExternalLink, Save, X } from 'react-feather';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface DocumentCommentProps {
  publicUrl: string;
  name: string;
  applicationId: string;
}

const Schema = z.object({
  comment: z.string().nullable(),
  publicUrl: z.string(),
  applicationId: z.string(),
});

type Values = { comment: string; publicUrl: string; applicationId: string };

export function DocumentComment({
  publicUrl,
  name,
  applicationId,
}: DocumentCommentProps) {
  const utils = api.useUtils();

  const { data, isPending, refetch } =
    api.application.getDocumentComment.useQuery({
      publicUrl,
      applicationId,
    });

  const {
    data: checkData,
    isPending: checkIsPending,
    refetch: checkRefetch,
  } = api.application.getDocumentCheckStatus.useQuery({
    publicUrl,
    applicationId,
  });

  const { mutateAsync: saveDocumentCheckStatus } =
    api.application.saveDocumentCheckStatus.useMutation({
      onSuccess: async () => {
        await utils.application.getDocumentCheckStatus.invalidate();
        await checkRefetch();
      },
    });

  const { mutateAsync: saveDocumentComment } =
    api.application.saveDocumentComment.useMutation({
      onSuccess: async () => {
        await utils.application.getDocumentComment.invalidate();
        await refetch();
      },
    });

  const saveStatus = useCallback(
    async (status: 'approved' | 'rejected') => {
      if (checkData === status) {
        return await saveDocumentCheckStatus({
          publicUrl,
          applicationId,
          status: 'pending',
        });
      }
      
      await saveDocumentCheckStatus({
        publicUrl,
        applicationId,
        status: status,
      });
    },
    [checkData, saveDocumentCheckStatus, publicUrl, applicationId],
  );

  return (
    <div className='flex flex-col gap-2'>
      <div className='w-full h-48 relative rounded-4xl'>
        <Image
          fill
          className='object-contain'
          src={publicUrl}
          alt={publicUrl}
        />
      </div>

      <div className='flex flex-row flex-wrap gap-2 items-center'>
        <p>{name}</p>

        <Link
          className='btn btn-soft btn-circle btn-sm btn-primary'
          href={publicUrl}
          target='_blank'
          rel='noopener noreferrer'>
          <ExternalLink />
        </Link>

        {checkIsPending && (
          <>
            <div className='skeleton size-8 rounded-full' />
            <div className='skeleton size-8 rounded-full' />
            <div className='skeleton size-8 rounded-full' />
          </>
        )}

        <button
          className={twMerge('btn btn-soft btn-circle btn-sm btn-success', [
            checkData === 'approved' && 'btn-active',
          ])}
          onClick={() => saveStatus('approved')}>
          <Check />
        </button>

        <button
          className={twMerge('btn btn-soft btn-circle btn-sm btn-error', [
            checkData === 'rejected' && 'btn-active',
          ])}
          onClick={() => saveStatus('rejected')}>
          <X />
        </button>
      </div>

      {!isPending && (
        <Formik<Values>
          initialValues={{ comment: data ?? '', publicUrl, applicationId }}
          validationSchema={toFormikValidationSchema(Schema)}
          onSubmit={async (values) => {
            await saveDocumentComment(values);
          }}>
          <Form className='flex flex-row items-end relative gap-2'>
            <TextareaInputComponent
              label='Comment'
              name='comment'
              placeholder='Tell me...'
              rows={2}
            />

            <button
              className='btn btn-soft btn-sm btn-primary btn-circle absolute top-10 right-4'
              type='submit'>
              <Save />
            </button>
          </Form>
        </Formik>
      )}

      {isPending && (
        <>
          <div className='skeleton h-20 w-full' />
        </>
      )}
    </div>
  );
}
