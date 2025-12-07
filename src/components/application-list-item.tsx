import { ApplicationStatusAvatar } from '@app/components/application-status-avatar';
import { DATE_FORMAT } from '@app/components/inputs/utils';
import { OpenWhatsappButton } from '@app/components/open-whatsapp-button';
import { PhoneTelButton } from '@app/components/phone-tel-button';
import type { NormalizedApplication } from '@app/types/application-data';
import moment from 'moment/moment';
import Link from 'next/link';
import { Fragment } from 'react';
import { Eye } from 'react-feather';

export function ApplicationListItem(application: NormalizedApplication) {
  const { id, data, email, status, createdAt, meta } = application;
  return (
    <li className='list-row' key={id}>
      <ApplicationStatusAvatar
        name={`${data.firstName} ${data.lastName}`}
        status={status}
        notified={meta?.status?.invited?.[status] ?? status === 'INIT'}
      />

      <div className='flex flex-col gap-1'>
        <div>
          {data.firstName} {data.lastName}
        </div>
        <div className='text-xs font-semibold opacity-50'>{email}</div>
        <div className='text-xs'>{moment(createdAt).format(DATE_FORMAT)}</div>
      </div>
      <div className='flex flex-row gap-2 items-center'>
        {(data.phoneNumbers ?? []).map(
          ({ phoneNumber, whatsappCall, normalCall }) => (
            <Fragment key={phoneNumber}>
              {normalCall && <PhoneTelButton phoneNumber={phoneNumber} />}

              {whatsappCall && (
                <OpenWhatsappButton phoneNumber={phoneNumber} />
              )}
            </Fragment>
          ),
        )}

        <Link
          href={`/applications/${id}`}
          className='btn btn-circle btn-soft btn-primary btn-sm'>
          <Eye />
        </Link>
      </div>
    </li>
  );
}
