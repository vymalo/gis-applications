'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';

import { ApplicationStatusAvatar } from '@app/components/application-status-avatar';
import { DATE_FORMAT } from '@app/components/inputs/utils';
import { OpenWhatsappButton } from '@app/components/open-whatsapp-button';
import { PhoneTelButton } from '@app/components/phone-tel-button';
import { SearchField } from '@app/components/search-field';
import { useUpdateParams } from '@app/hooks/query';
import { api } from '@app/trpc/react';
import { StatusMapping } from '@app/utils/status-mapping';
import moment from 'moment';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, Send, Sliders } from 'react-feather';
import { twMerge } from 'tailwind-merge';

export interface LatestApplicationProps {
  initialPage?: number;
  initialSize?: number;
  initialQuery?: string;
  initialGroupBy?: string;
}

export function LatestApplication(props: LatestApplicationProps) {
  const updateParams = useUpdateParams();

  const [page, setPage] = useState(Number(props.initialPage ?? 0));
  const [size, setSize] = useState(Number(props.initialSize ?? 10));
  const [q, setQuery] = useState<string>(props.initialQuery ?? '');
  const [groupBy, setGroupBy] = useState(
    props.initialGroupBy ?? 'data.firstName',
  );

  const [latestApplication, {}] = api.application.getSome.useSuspenseQuery({
    page,
    size,
    q,
    groupBy,
  });

  const onQueryChange = useCallback((q: string) => {
    setQuery(q);
  }, []);

  useEffect(() => {
    updateParams({
      page,
      size,
      q,
      groupBy,
    });
  }, [page, size, q, groupBy, updateParams]);

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='app-title'>Applications</h1>
      <SearchField onChange={onQueryChange} />

      <div className='grid grid-cols-7'>
        <div className='col-span-2 sticky top-4'>
          <ul className='menu bg-base-200 w-full rounded-xl'>
            <li>
              <a className='opacity-50'>
                Group By <Sliders className='size-[1rem]' />
              </a>
              <ul>
                <li>
                  <button onClick={() => setGroupBy('status')}>Status</button>
                </li>
                <li>
                  <button onClick={() => setGroupBy('email')}>Email</button>
                </li>
                <li>
                  <button onClick={() => setGroupBy('data.lastName')}>
                    Last Name
                  </button>
                </li>
                <li>
                  <button onClick={() => setGroupBy('data.firstName')}>
                    First Name
                  </button>
                </li>
              </ul>
            </li>
            <li>
              <a className='opacity-50'>
                Batch actions <Send className='size-[1rem]' />
              </a>
              <ul>
                <li>
                  <button>
                    <span>Send phone Interview</span>
                  </button>
                  <button>
                    <span>Send onsite Interview</span>
                  </button>
                  <button>
                    <span>Send acceptance confirmation</span>
                  </button>
                  <button>
                    <span>Send rejection confirmation</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div className='col-span-5'>
          <ul className='list bg-base-100'>
            {latestApplication.map(([key, values]) => (
              <div key={key}>
                <li className='p-4 pb-2 text-xs opacity-60 tracking-wide'>
                  <div className='flex flex-row items-center gap-2'>
                    {groupBy === 'status' ? StatusMapping[key] : key}{' '}
                    <span className='badge badge-primary badge-sm'>
                      {values.length}
                    </span>
                  </div>
                </li>

                {values.map(({ id, data, email, status, createdAt, meta }) => (
                  <li className='list-row' key={id}>
                    <ApplicationStatusAvatar
                      name={`${data.firstName} ${data.lastName}`}
                      status={status}
                      notified={
                        meta.status?.invited?.[status] ?? status === 'INIT'
                      }
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
      </div>

      <div className='flex flex-row gap-4 items-center'>
        <div className='join'>
          <button
            disabled={page <= 0}
            onClick={() => setPage((page) => --page)}
            className='join-item btn btn-sm btn-primary btn-soft'>
            <ArrowLeft />
          </button>
          <button
            onClick={() => setPage((page) => ++page)}
            className='join-item btn btn-sm btn-primary btn-soft'>
            <ArrowRight />
          </button>
        </div>

        <div className='join'>
          <a className='join-item btn btn-sm btn-disabled'>Size</a>
          {[10, 20, 50, 100].map((s) => (
            <button
              key={s}
              className={twMerge('join-item btn btn-sm btn-primary btn-soft', [
                size === s && 'btn-active',
              ])}
              onClick={() => setSize(s)}>
              x{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
