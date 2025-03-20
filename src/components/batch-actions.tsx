'use client';

import { api } from '@app/trpc/react';

export function BatchActions() {
  const { application } = api.useUtils();
  const { mutateAsync: sendAcceptance } = api.mail.sendAcceptance.useMutation({
    onSuccess: () => application.invalidate(),
  });
  const { mutateAsync: sendOnsiteInterview } =
    api.mail.sendOnsiteInterview.useMutation({
      onSuccess: () => application.invalidate(),
    });
  const { mutateAsync: sendPhoneInterview } =
    api.mail.sendPhoneInterview.useMutation({
      onSuccess: () => application.invalidate(),
    });
  const { mutateAsync: sendRejection } = api.mail.sendRejection.useMutation({
    onSuccess: () => application.invalidate(),
  });

  return (
    <>
      <li>
        <button onClick={() => sendPhoneInterview({})}>
          <span>Send phone Interview</span>
        </button>
      </li>
      <li>
        <button onClick={() => sendOnsiteInterview({})}>
          <span>Send onsite Interview</span>
        </button>
      </li>
      <li>
        <button onClick={() => sendAcceptance({})}>
          <span>Send acceptance confirmation</span>
        </button>
      </li>
      <li>
        <button onClick={() => sendRejection({})}>
          <span>Send rejection confirmation</span>
        </button>
      </li>
    </>
  );
}
