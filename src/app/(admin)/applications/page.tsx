import { LatestApplication } from '@app/components/applications';
import { api, HydrateClient } from '@app/trpc/server';

interface SearchParams {
  page: number;
  size: number;
  q: string;
  groupBy: string;
}

export default async function Applications({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page, size, q, groupBy } = await searchParams;
  void api.application.getSome.prefetch({
    groupBy: 'data.firstName',
  });

  return (
    <HydrateClient>
      <main>
        <LatestApplication
          initialPage={page}
          initialSize={size}
          initialQuery={q}
          initialGroupBy={groupBy}
        />
      </main>
    </HydrateClient>
  );
}
