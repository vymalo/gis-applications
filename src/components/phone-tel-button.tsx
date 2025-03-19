import parsePhoneNumber from 'libphonenumber-js';
import Link from 'next/link';
import { useMemo } from 'react';
import { PhoneCall } from 'react-feather';

interface PhoneTelButtonProps {
  phoneNumber: string;
}

export function PhoneTelButton({ phoneNumber }: PhoneTelButtonProps) {
  const uri = useMemo(
    () => parsePhoneNumber(phoneNumber, 'CM')?.getURI(),
    [phoneNumber],
  );

  if (!uri) {
    return null;
  }

  return (
    <Link
      href={uri}
      target='_blank'
      rel='noopener noreferrer'
      className='btn btn-soft btn-primary btn-sm btn-circle'
      title='Call'>
      <PhoneCall />
    </Link>
  );
}
