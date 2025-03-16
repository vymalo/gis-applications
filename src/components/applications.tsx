'use client';

import { Fragment, useCallback, useState } from 'react';

import { ApplicationStatusAvatar } from '@app/components/application-status-avatar';
import { DATE_FORMAT } from '@app/components/inputs/utils';
import { OpenWhatsappButton } from '@app/components/open-whatsapp-button';
import { PhoneTelButton } from '@app/components/phone-tel-button';
import { SearchField } from '@app/components/search-field';
import { api } from '@app/trpc/react';
import { type ApplicationStatus } from '@prisma/client';
import moment from 'moment';
import Link from 'next/link';
import { Eye } from 'react-feather';

export interface LatestApplicationProps {
  status?: ApplicationStatus;
}

export function LatestApplication({ status }: LatestApplicationProps) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [q, setQuery] = useState<string>('');
  const [groupBy, setGroupBy] = useState('data.firstName');

  const [latestApplication, { isPending, isError }] =
    api.application.getSome.useSuspenseQuery({
      page,
      size,
      q,
      groupBy,
    });

  const onQueryChange = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='app-title'>Applications</h1>
      <SearchField onChange={onQueryChange} />

      <ul className='list bg-base-100'>
        {latestApplication.map(([key, values]) => (
          <div key={key}>
            <li className='p-4 pb-2 text-xs opacity-60 tracking-wide'>{key}</li>

            {values.map(({ id, data, email, status, createdAt }) => (
              <li className='list-row' key={id}>
                <ApplicationStatusAvatar
                  name={`${data.firstName} ${data.lastName}`}
                  status={status}
                />

                <div className='flex flex-col gap-1'>
                  <div>
                    {data.firstName} {data.lastName}
                  </div>
                  <div className='text-xs font-semibold opacity-50'>
                    {email}
                  </div>
                  <div className='text-xs'>
                    {moment(createdAt).format(DATE_FORMAT)}
                  </div>
                </div>
                <div className='flex flex-row gap-2'>
                  {data.phoneNumbers.map(
                    ({ phoneNumber, whatsappCall, normalCall }) => (
                      <Fragment key={phoneNumber}>
                        <PhoneTelButton
                          small
                          phoneNumber={phoneNumber}
                          normalCall={normalCall}
                        />

                        <OpenWhatsappButton
                          whatsappCall={whatsappCall}
                          phoneNumber={phoneNumber}
                        />
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
            ))}
          </div>
        ))}
      </ul>
    </div>
  );
}
