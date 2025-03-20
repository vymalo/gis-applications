'use client';

import parsePhoneNumber from 'libphonenumber-js';

interface FormattedPhoneNumberProps {
  phoneNumber: string;
}

export function FormattedPhoneNumber({
  phoneNumber,
}: FormattedPhoneNumberProps) {
  const formatted = parsePhoneNumber(phoneNumber, 'CM');

  return <span>{formatted?.formatNational()}</span>;
}
