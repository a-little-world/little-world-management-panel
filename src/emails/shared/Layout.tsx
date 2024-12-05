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

import Footer from './Footer';
import { THEMES } from './constants';
import { body, content, contentContainer, logo, sentence } from './styles';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
  themeContent: (typeof THEMES)[keyof typeof THEMES];
  unsubscribeLink?: boolean;
}

export const EmailLayout = ({
  children,
  previewText,
  themeContent,
  unsubscribeLink,
}: EmailLayoutProps) => {
  return (
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
              width={themeContent.logoWidth}
              height={themeContent.logoHeight}
              style={{
                ...logo,
                width: themeContent.logoWidth,
                maxWidth: themeContent.logoWidth,
                height: themeContent.logoHeight,
              }}
              src={themeContent.logo}
              alt={themeContent.logoAlt}
            />
          </Section>
          <Container style={contentContainer}>
            <Section style={content}>
              {children}
              <Text style={sentence}>Beste Grüße,</Text>
              <Text style={sentence}>{themeContent.from}</Text>
            </Section>
          </Container>
          <Footer
            unsubscribeLink={unsubscribeLink}
            themeContent={themeContent}
          />
        </Container>
      </Body>
    </Html>
  );
};

export default EmailLayout;
