import parsePhoneNumber from 'libphonenumber-js';
import Link from 'next/link';
import { PhoneCall } from 'react-feather';
import { twMerge } from 'tailwind-merge';

interface PhoneTelButtonProps {
  phoneNumber: string;
  normalCall: boolean;
  small?: boolean;
}

export function PhoneTelButton({
  phoneNumber,
  normalCall,
  small = false,
}: PhoneTelButtonProps) {
  if (!normalCall) {
    return phoneNumber;
  }

  const formatted = parsePhoneNumber(phoneNumber, 'CM');

  if (!formatted) {
    return null;
  }

  return (
    <Link
      href={formatted.getURI()}
      target='_blank'
      rel='noopener noreferrer'
      className={twMerge('btn btn-soft btn-primary btn-sm', [
        small && 'btn-circle',
      ])}
      title='Call'>
      <PhoneCall />
      {!small && formatted.formatInternational()}
    </Link>
  );
}
