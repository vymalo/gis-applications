'use client';

import { DocumentComment } from '@app/components/document-comment';
import { FormattedPhoneNumber } from '@app/components/formatted-phone-number';
import { DATE_FORMAT } from '@app/components/inputs/utils';
import { OpenWhatsappButton } from '@app/components/open-whatsapp-button';
import { PhoneTelButton } from '@app/components/phone-tel-button';
import { ToggleJson } from '@app/components/toggle-json';
import { api } from '@app/trpc/react';
import { ApplicationStatus } from '@app/types/application-status';
import moment from 'moment/moment';
import { Fragment, useCallback } from 'react';
import { Check, Home, PhoneIncoming, RefreshCw, X } from 'react-feather';

interface AdminSingleApplicationProps {
  applicationId: string;
}

export function AdminSingleApplication({
  applicationId,
}: AdminSingleApplicationProps) {
  const [application, { isPending, isError, refetch }] =
    api.application.getApplication.useSuspenseQuery({
      id: applicationId,
    });

  const { mutateAsync: updateStatus$ } =
    api.application.updateStatus.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  const updateStatus = useCallback(
    (status: ApplicationStatus) => async () => {
      await updateStatus$({
        status,
        applicationId,
      });
    },
    [applicationId, updateStatus$],
  );

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  if (!application) {
    return null;
  }

  const { data, status, meta } = application;
  const metaStatusInvited = meta?.status?.invited ?? {};

  return (
    <ToggleJson refresh={refetch} doc={application}>
      <h1 className='text-2xl font-bold'>#{application.email}</h1>
      <div className='grid grid-cols-4 gap-2'>
        <p className='opacity-50 col-span-1'>Status</p>
        <p className='col-span-3'>{status}</p>

        <div className='divider col-span-full'>Name</div>

        <div className='opacity-50 col-span-1'>First Name</div>
        <div className='col-span-3'>{data.firstName}</div>

        <div className='opacity-50 col-span-1'>Last Name</div>
        <div className='col-span-3'>{data.lastName}</div>

        <div className='opacity-50 col-span-1'>Birth Date</div>
        <div className='col-span-3'>
          {moment(data.birthDate).format(DATE_FORMAT)}
        </div>

        <div className='opacity-50 col-span-1'>Who are you?</div>
        <div className='col-span-3'>{data.whoAreYou}</div>

        <div className='divider col-span-full'>Identity</div>

        <div className='opacity-50 col-span-1'>
          Have a national ID card or passport?
        </div>
        <div className='col-span-3'>
          {data.hasIDCartOrPassport ? 'Yes' : 'No'}
        </div>

        <div className='col-span-full opacity-50'>
          ID card or passport or receipt
        </div>
        <div className='col-span-full grid grid-cols-2 gap-4'>
          {data?.iDCartOrPassportOrReceipt?.map(({ name, publicUrl }: any) => (
            <DocumentComment
              applicationId={applicationId}
              publicUrl={publicUrl}
              name={name}
              key={publicUrl}
            />
          ))}
        </div>

        <div className='divider col-span-full'>Phone numbers</div>

        <div className='col-span-2 opacity-50'>Phone number</div>
        <div className='col-span-1 opacity-50'>Whatsapp</div>
        <div className='col-span-1 opacity-50'>Normal calls</div>

        {data.phoneNumbers.map(
          ({ phoneNumber, whatsappCall, normalCall }: any) => (
            <Fragment key={phoneNumber}>
              <div className='col-span-2 flex flex-row items-center gap-2'>
                <FormattedPhoneNumber phoneNumber={phoneNumber} />

                {normalCall && <PhoneTelButton phoneNumber={phoneNumber} />}

                {whatsappCall && (
                  <OpenWhatsappButton phoneNumber={phoneNumber} />
                )}
              </div>
              <div className='col-span-1'>
                {whatsappCall ? (
                  <Check className='text-success' />
                ) : (
                  <X className='text-error' />
                )}
              </div>
              <div className='col-span-1'>
                {normalCall ? (
                  <Check className='text-success' />
                ) : (
                  <X className='text-error' />
                )}
              </div>
            </Fragment>
          ),
        )}

        <div className='divider col-span-full'>Contact</div>

        <div className='opacity-50 col-span-1'>Country</div>
        <div className='col-span-3'>{data.country}</div>

        <div className='opacity-50 col-span-1'>City</div>
        <div className='col-span-3'>{data.city}</div>

        <div className='opacity-50 col-span-1'>Where are you?</div>
        <div className='col-span-3'>{data.whereAreYou}</div>

        <div className='divider col-span-full'>Education</div>

        <div className='opacity-50 col-span-1'>Done with high school?</div>
        <div className='col-span-3'>{data.highSchoolOver ? 'Yes' : 'No'}</div>

        <div className='opacity-50 col-span-1'>
          GCE GCE O/L or Probatoire date
        </div>
        <div className='col-span-3'>
          {moment(data.highSchoolGceOLProbatoirDate).format(DATE_FORMAT)}
        </div>

        <div className='col-span-full opacity-50'>
          Your GCE O/L or Probatoire certificate(s)
        </div>
        <div className='col-span-full grid grid-cols-2 gap-4'>
          {data.highSchoolGceOLProbatoireCertificates?.map(
            ({ name, publicUrl }: any) => (
              <DocumentComment
                applicationId={applicationId}
                publicUrl={publicUrl}
                name={name}
                key={publicUrl}
              />
            ),
          )}
        </div>
        <div className='col-span-full h-20' />

        {data.highSchoolOver && (
          <>
            <div className='col-span-full opacity-50'>
              Your GCE A/L or BAC certificate(s)
            </div>
            <div className='col-span-full grid grid-cols-2 gap-4'>
              {data.highSchoolGceALBACCertificates?.map(
                ({ name, publicUrl }: any) => (
                  <DocumentComment
                    applicationId={applicationId}
                    publicUrl={publicUrl}
                    name={name}
                    key={publicUrl}
                  />
                ),
              )}
            </div>

            <div className='col-span-full h-20' />
          </>
        )}

        <div className='divider col-span-full'>University</div>

        <div className='opacity-50 col-span-1'>University student?</div>
        <div className='col-span-3'>
          {data.universityStudent ? 'Yes' : 'No'}
        </div>

        {data.universityStudent && (
          <>
            <div className='opacity-50 col-span-1'>University start date</div>
            <div className='col-span-3'>
              {moment(data.universityStartDate).format(DATE_FORMAT)}
            </div>

            <div className='opacity-50 col-span-1'>University end date</div>
            <div className='col-span-3'>
              {moment(data.universityEndDate).format(DATE_FORMAT)}
            </div>

            <div className='col-span-full opacity-50'>
              Your university certificate(s)
            </div>
            <div className='col-span-full grid grid-cols-2 gap-4'>
              {data.universityCertificates?.map(({ name, publicUrl }: any) => (
                <DocumentComment
                  applicationId={applicationId}
                  publicUrl={publicUrl}
                  name={name}
                  key={publicUrl}
                />
              ))}
            </div>

            <div className='col-span-full h-20' />
          </>
        )}

        {!(metaStatusInvited.REJECTED || metaStatusInvited.ACCEPTED) && (
          <>
            <div className='divider col-span-full'>Action</div>
            <div className='col-span-full grid grid-cols-4 gap-2'>
              <button
                disabled={
                  status === 'INIT' ||
                  Object.keys(metaStatusInvited).length !== 0
                }
                onClick={updateStatus('INIT')}
                className='btn btn-outline btn-secondary col-span-2'>
                <span>Cancel invitation</span>
                <RefreshCw />
              </button>

              <button
                disabled={
                  metaStatusInvited.PHONE_INTERVIEW_PHASE ||
                  metaStatusInvited.ONSITE_INTERVIEW_PHASE
                }
                onClick={updateStatus('PHONE_INTERVIEW_PHASE')}
                className='btn btn-outline btn-primary col-span-2'>
                <span>Should invite to phone interview</span>
                <PhoneIncoming />
              </button>

              <button
                disabled={metaStatusInvited.ONSITE_INTERVIEW_PHASE}
                onClick={updateStatus('ONSITE_INTERVIEW_PHASE')}
                className='btn btn-outline btn-primary col-span-2'>
                <span>Should invite to onsite interview</span>
                <Home />
              </button>

              <button
                onClick={updateStatus('ACCEPTED')}
                className='btn btn-outline btn-success col-span-2'>
                <span>Should accept application</span>
                <Check />
              </button>

              <button
                onClick={updateStatus('REJECTED')}
                className='btn btn-outline btn-error col-span-2'>
                <span>Should reject application</span>
                <X />
              </button>
            </div>
          </>
        )}
      </div>
    </ToggleJson>
  );
}
