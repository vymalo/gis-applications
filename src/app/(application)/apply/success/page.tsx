import { CopyCurrentUrl } from '@app/components/copy-current-url';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

export default async function ApplicationComplete({
  searchParams,
}: {
  searchParams: Promise<{ application_id: string }>;
}) {
  const { application_id } = await searchParams;
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='app-title'>Application done</h1>
      <p>You&#39;ll receive a confirmation to the provided email</p>

      {application_id && (
        <div>
          <p>If you wanna edt, go to your</p>
          <Link
            className='btn btn-soft btn-primary'
            href={`/apply/${application_id}`}>
            <span>Application</span>
            <ArrowRight />
          </Link>
        </div>
      )}

      <div>
        <p>If you wanna share this, use this link</p>
        <CopyCurrentUrl />
      </div>
    </div>
  );
}
