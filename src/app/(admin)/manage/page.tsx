import { LatestApplication } from "@app/components/applications";
import { api, HydrateClient } from "@app/trpc/server";

export default async function Manage() {
  void api.application.getSome.prefetch({});

  return (
    <HydrateClient>
      <main>
        <LatestApplication />
      </main>
    </HydrateClient>
  );
}
