import type { Application } from '@prisma/client';
import { CoreMail, TextParagraph } from './core-mail';

export const AcceptedCandidat = (props: Application) => (
  <CoreMail {...props} preview='Welcome to our GIS Training Center!'>
    <TextParagraph>We&#39;re excited to welcome you to our GIS!</TextParagraph>

    <TextParagraph>
      More emails will follow with details about your training.
    </TextParagraph>
  </CoreMail>
);

export default AcceptedCandidat;
