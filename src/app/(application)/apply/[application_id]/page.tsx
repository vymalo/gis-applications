import { SingleApply } from '@app/components/single-apply';
import { api, HydrateClient } from '@app/trpc/server';
import { notFound } from 'next/navigation';

export default async function ApplicationAgain({
  params,
}: {
  params: Promise<{ application_id: string }>;
}) {
  const { application_id } = await params;
  const application = await api.application
    .getApplication({
      id: application_id,
    })
    .catch((err) => {
      console.warn(err);
      return null;
    });

  if (!application) {
    notFound();
  }

  return (
    <HydrateClient>
      <main>
        <SingleApply application={application} />
      </main>
    </HydrateClient>
  );
}
