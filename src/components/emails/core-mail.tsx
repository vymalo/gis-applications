import { Application } from '@prisma/client';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { type PropsWithChildren } from 'react';

interface CoreMailProps {
  preview: string;
}

const baseUrl = 'http://localhost:3000';

export const CustomHr = () => <Hr style={hr} />;

export function CoreMail({
  children,
  preview,
  data,
}: PropsWithChildren<CoreMailProps & Application>) {
  return (
    <Html>
      <Head />
      <Body>
        <Preview>{preview}</Preview>
        <Container>
          <Section>
            <Img
              src={`${baseUrl}/favicon.ico`}
              width='50'
              height='50'
              alt='Logo'
            />

            <CustomHr />

            <TextParagraph>Hello {data?.firstName},</TextParagraph>

            {children}

            <CustomHr />

            <TextParagraph>
              If you have any question, please visit our{' '}
              <Link style={anchor} href={baseUrl + '/res/faq'}>
                FAQ site
              </Link>
              .
            </TextParagraph>
            <TextParagraph>— The GIS Team</TextParagraph>

            <CustomHr />

            <TextParagraph>Bangangté, Cameroon</TextParagraph>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const TextParagraph = ({ children }: PropsWithChildren) => (
  <Text style={paragraph}>{children}</Text>
);

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const paragraph = {
  color: '#525f7f',

  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const anchor = {
  color: '#556cd6',
};
