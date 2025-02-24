import Link from 'next/link';
import { ArrowRight } from 'react-feather';

export default async function ApplicationComplete({
  searchParams,
}: {
  searchParams: Promise<{ application_id: string }>;
}) {
  const { application_id } = await searchParams;
  return (
    <div>
      <h1>Application done</h1>
      <p>You&#39;ll receive a confirmation to the provided email</p>
      <p>
        If you wanna edt, go to your
        <Link href={`/apply/${application_id}`}>
          <span>Application</span>
          <ArrowRight />
        </Link>
      </p>
    </div>
  );
}
