import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

export interface MagicLinkEmailProps {
  url: string;
}

export const MagicLinkEmail = ({ url }: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Body>
      <Preview>Sign in to GIS Applications</Preview>
      <Container>
        <Text>Sign in to GIS Applications</Text>
        <Text>
          Use the link below to sign in. This link can be used once and will
          expire shortly.
        </Text>
        <Link href={url}>{url}</Link>
      </Container>
    </Body>
  </Html>
);

export default MagicLinkEmail;

