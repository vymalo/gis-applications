import type { Application, User } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

interface ToApplicationProps {
  application: Omit<Application, 'createdById'> & { createdBy: User };
}

export function ToApplication({ application }: ToApplicationProps) {
  return (
    <Link href={`/apply/${application.id}`}>
      <Image
        src={application.createdBy.image}
        alt={application.createdBy.name}
      />
      <span>Edit</span>
      <ArrowRight />
    </Link>
  );
}
