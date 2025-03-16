import { LatestApplication } from '@app/components/applications';
import { api, HydrateClient } from '@app/trpc/server';

export default async function Applications() {
  void api.application.getSome.prefetch({
    groupBy: 'data.firstName',
  });

  return (
    <HydrateClient>
      <main>
        <LatestApplication />
      </main>
    </HydrateClient>
  );
}
