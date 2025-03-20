import parsePhoneNumber from 'libphonenumber-js';
import Link from 'next/link';
import { ExternalLink } from 'react-feather';

interface OpenWhatsappButtonProps {
  phoneNumber: string;
}

export function OpenWhatsappButton({ phoneNumber }: OpenWhatsappButtonProps) {
  const formatted = parsePhoneNumber(phoneNumber, 'CM');

  return (
    <Link
      href={
        `https://api.whatsapp.com/send?text=${encodeURIComponent('😃Hello!')}&phone=` +
        formatted?.number
      }
      target='_blank'
      rel='noopener noreferrer'
      className='btn btn-circle btn-soft btn-primary btn-sm'
      title='Open Whatsapp'>
      <ExternalLink />
    </Link>
  );
}
