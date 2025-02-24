import type { Application, User } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

interface ToApplicationProps {
  application: Omit<Application, 'createdById'> & { createdBy: User | null };
}

export function ToApplication({ application }: ToApplicationProps) {
  return (
    <Link href={`/apply/${application.id}`}>
      {application.createdBy?.image && (
        <Image
          src={application.createdBy?.image}
          alt={application.createdBy?.id}
        />
      )}
      <span>Edit</span>
      <ArrowRight />
    </Link>
  );
}
