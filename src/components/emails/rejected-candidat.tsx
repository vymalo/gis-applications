import { CoreMail, TextParagraph } from '@app/components/emails/core-mail';
import type { Application } from '@prisma/client';

export const RejectedCandidat = (props: Application) => (
  <CoreMail {...props} preview='Sorry, your application was rejected'>
    <TextParagraph>
      We&#39;re sorry to inform you that your application was rejected.
    </TextParagraph>

    <TextParagraph>
      Due to the high number of applications, we are unable to provide feedback
      on individual applications. But we encourage you to apply again in the
      future.
    </TextParagraph>

    <TextParagraph>We wish you the best of luck in your future!</TextParagraph>
  </CoreMail>
);

export default RejectedCandidat;
