import type { Application } from '@prisma/client';
import { CoreMail, TextParagraph } from './core-mail';

export const AcceptedCandidat = (props: Application) => (
  <CoreMail {...props} preview='Welcome to our GIS Training Center!'>
    <TextParagraph>We're excited to welcome you to our GIS!</TextParagraph>

    <TextParagraph>
      More emails will follow with details about your training.
    </TextParagraph>
  </CoreMail>
);

export default AcceptedCandidat;

const paragraph = {
  color: '#525f7f',

  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};
