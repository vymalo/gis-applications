import { AcceptedCandidat } from '@app/components/emails/accepted-candidat';
import { MagicLinkEmail } from '@app/components/emails/magic-link';
import { OnsiteInterview } from '@app/components/emails/onsite-interview';
import { PhoneInterview } from '@app/components/emails/phone-interview';
import { RejectedCandidat } from '@app/components/emails/rejected-candidat';
import { env } from '@app/env';
import type { Application } from '@app/server/db/schema';
import type { ApplicationData } from '@app/types/application-data';
import { render } from '@react-email/render';
import { type SendMailOptions } from 'nodemailer';

const toMailAddress = (value: string | null | undefined) => value ?? undefined;

export async function getSendPhoneInterviewOptions({
  application,
}: {
  application: Application;
}): Promise<SendMailOptions> {
  const data = application.data as ApplicationData;
  const el = <PhoneInterview data={data} />;

  const [html, text] = await Promise.all([
    render(el, {
      pretty: true,
    }),
    render(el, {
      pretty: true,
      plainText: true,
    }),
  ]);

  return {
    from: toMailAddress(env.SMTP_FROM),
    cc: toMailAddress(env.SMTP_CC),
    replyTo: toMailAddress(env.SMTP_REPLY_TO),
    to: application.email,
    subject: '[GIS] Invitation to Phone interview!',
    html,
    text,
  };
}

export async function getSendOnsiteInterviewOptions({
  application,
}: {
  application: Application;
}): Promise<SendMailOptions> {
  const data = application.data as ApplicationData;
  const el = <OnsiteInterview data={data} />;

  const [html, text] = await Promise.all([
    render(el, {
      pretty: true,
    }),
    render(el, {
      pretty: true,
      plainText: true,
    }),
  ]);

  return {
    from: toMailAddress(env.SMTP_FROM),
    cc: toMailAddress(env.SMTP_CC),
    replyTo: toMailAddress(env.SMTP_REPLY_TO),
    to: application.email,
    subject: '[GIS] Invitation to OnSite Interview!',
    html,
    text,
  };
}

export async function getAcceptedOptions({
  application,
}: {
  application: Application;
}): Promise<SendMailOptions> {
  const data = application.data as ApplicationData;
  const el = <AcceptedCandidat data={data} />;

  const [html, text] = await Promise.all([
    render(el, {
      pretty: true,
    }),
    render(el, {
      pretty: true,
      plainText: true,
    }),
  ]);

  return {
    from: toMailAddress(env.SMTP_FROM),
    cc: toMailAddress(env.SMTP_CC),
    replyTo: toMailAddress(env.SMTP_REPLY_TO),
    to: application.email,
    subject: '[GIS] Welcome to GIS Training!',
    html,
    text,
  };
}

export async function getRejectedOptions({
  application,
}: {
  application: Application;
}): Promise<SendMailOptions> {
  const data = application.data as ApplicationData;
  const el = <RejectedCandidat data={data} />;

  const [html, text] = await Promise.all([
    render(el, {
      pretty: true,
    }),
    render(el, {
      pretty: true,
      plainText: true,
    }),
  ]);

  return {
    from: toMailAddress(env.SMTP_FROM),
    cc: toMailAddress(env.SMTP_CC),
    replyTo: toMailAddress(env.SMTP_REPLY_TO),
    to: application.email,
    subject: '[GIS] Sorry!',
    html,
    text,
  };
}

export async function getMagicLinkOptions({
  email,
  url,
}: {
  email: string;
  url: string;
}): Promise<SendMailOptions> {
  const el = <MagicLinkEmail url={url} />;

  const [html, text] = await Promise.all([
    render(el, {
      pretty: true,
    }),
    render(el, {
      pretty: true,
      plainText: true,
    }),
  ]);

  return {
    from: toMailAddress(env.SMTP_FROM),
    cc: toMailAddress(env.SMTP_CC),
    replyTo: toMailAddress(env.SMTP_REPLY_TO),
    to: email,
    subject: '[GIS] Sign in to GIS Applications',
    html,
    text,
  };
}
