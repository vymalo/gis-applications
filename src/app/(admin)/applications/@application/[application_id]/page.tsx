import { AdminSingleApplication } from '@app/components/admin-single-application';
import { Modal } from '@app/components/modal';
import { api } from '@app/trpc/server';
import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ application_id: string }>;
}) {
  const { application_id } = await params;
  const application = await api.application.getApplication({
    id: application_id,
  });

  if (!application) {
    notFound();
  }

  return {
    title: `Application of ${application.email}`,
  };
}

export default async function SingleApplicationModalPage({
  params,
}: {
  params: Promise<{ application_id: string }>;
}) {
  const { application_id } = await params;
  if (!application_id) {
    redirect('/applications');
  }

  return (
    <Modal>
      <AdminSingleApplication applicationId={application_id} />
    </Modal>
  );
}
