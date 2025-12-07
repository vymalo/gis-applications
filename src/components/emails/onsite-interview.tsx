import { CoreMail, TextParagraph } from '@app/components/emails/core-mail';
import type { ApplicationData } from '@app/types/application-data';

export const OnsiteInterview = ({ data }: { data: ApplicationData }) => (
  <CoreMail data={data} preview='Invitation go Onsite Interview!'>
    <TextParagraph>
      We&#39;re excited to invite you to an onsite interview.
    </TextParagraph>

    <TextParagraph>
      Your interview is scheduled on the 15th of August between 8:00 AM and 2:00
      PM. Please confirm your attendance by replying to this email.
    </TextParagraph>
  </CoreMail>
);

export default OnsiteInterview;
