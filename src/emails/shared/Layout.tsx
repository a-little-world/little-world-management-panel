import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import Logo from '../../assets/logoWithText.png';
import Footer from './Footer';
import { body, content, contentContainer, logo, sentence } from './styles';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
  canUnsubscribe?: boolean;
}

export const EmailLayout = ({
  children,
  previewText,
  canUnsubscribe,
}: EmailLayoutProps) => (
  <Html>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <style type="text/css">
        {`body {background-color: #fafbfb; padding:0;}`}
      </style>
    </Head>
    <Preview>{previewText}</Preview>
    <Body style={body}>
      <Container>
        <Section>
          <Img
            width={144}
            height={40.35}
            style={logo}
            src={Logo}
            alt="Little World's Logo"
          />
        </Section>
        <Container style={contentContainer}>
          <Section style={content}>
            {children}
            <Text style={sentence}>Beste Grüße,</Text>
            <Text style={sentence}>Dein Little World Team</Text>
          </Section>
        </Container>
        <Footer canUnsubscribe={canUnsubscribe} />
      </Container>
    </Body>
  </Html>
);

export default EmailLayout;
