import type { ApplicationData } from '@app/types/application-data';
import { CoreMail, TextParagraph } from './core-mail';

export const AcceptedCandidat = ({ data }: { data: ApplicationData }) => (
  <CoreMail data={data} preview='Welcome to our GIS Training Center!'>
    <TextParagraph>We&#39;re excited to welcome you to our GIS!</TextParagraph>

    <TextParagraph>
      More emails will follow with details about your training.
    </TextParagraph>
  </CoreMail>
);

export default AcceptedCandidat;
