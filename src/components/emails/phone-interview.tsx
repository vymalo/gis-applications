import { CoreMail, TextParagraph } from '@app/components/emails/core-mail';
import type { Application } from '@prisma/client';

export const PhoneInterview = (props: Application) => (
  <CoreMail {...props} preview='You have been invited to a phone interview!'>
    <TextParagraph>
      We&#39;re excited to invite you to a phone interview.
    </TextParagraph>

    <TextParagraph>
      Your interview is scheduled on the 15th of August between 8:00 AM and 2:00
      PM. Please confirm your attendance by replying to this email.
    </TextParagraph>
  </CoreMail>
);

export default PhoneInterview;
