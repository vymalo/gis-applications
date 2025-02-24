'use client';

import { useState } from 'react';

import { api } from '@app/trpc/react';
import { type ApplicationStatus } from '@prisma/client';

export interface LatestApplicationProps {
  status?: ApplicationStatus;
}

export function LatestApplication({ status }: LatestApplicationProps) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [q, setQuery] = useState<string>();

  const [latestApplication, { isPending, isError }] =
    api.application.getSome.useSuspenseQuery({
      page,
      size,
      q,
    });

  return (
    <div className='w-full'>
      {latestApplication.map(({ createdById, status, data }) => (
        <>{data['name']}</>
      ))}
    </div>
  );
}
