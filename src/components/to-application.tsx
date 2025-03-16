import { type ApplicationUser } from '@app/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

interface ToApplicationProps {
  application: ApplicationUser;
}

export function ToApplication({ application }: ToApplicationProps) {
  return (
    <Link
      href={`/apply/${application.id}`}
      className='items-center btn btn-soft btn-primary'>
      {application.createdBy?.image && (
        <Image
          className='w-8 rounded-full'
          src={application.createdBy?.image}
          alt={application.createdBy?.id}
        />
      )}

      {!application.createdBy?.image && application.createdBy?.name?.[0] && (
        <div className='avatar avatar-placeholder'>
          <div className='bg-primary text-primary-content w-6 rounded-full'>
            <span className='uppercase text-sm'>
              {application.createdBy?.name?.[0]}
            </span>
          </div>
        </div>
      )}

      <span>View</span>
      <ArrowRight />
    </Link>
  );
}
