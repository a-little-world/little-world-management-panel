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
}

export const EmailLayout = ({ children, previewText }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={body}>
      <Section>
        <Img
          style={logo}
          src={Logo}
          width="144px"
          height="40.35"
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
      <Footer />
    </Body>
  </Html>
);

export default EmailLayout;
