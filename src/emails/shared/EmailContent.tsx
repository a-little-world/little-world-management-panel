import { Container, Img, Section, Text } from '@react-email/components';
import React from 'react';

import Footer from './Footer';
import { content, contentContainer, logo, sentence } from './styles';

interface EmailContentProps {
  children: React.ReactNode;
  themeContent: any;
  unsubscribeLink?: boolean;
}

const EmailContent: React.FC<EmailContentProps> = ({
  children,
  themeContent,
  unsubscribeLink,
}) => {
  return (
    <Container>
      <Section style={{ backgroundColor: '#fafbfb' }}>
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
      <Footer unsubscribeLink={unsubscribeLink} themeContent={themeContent} />
    </Container>
  );
};

export default EmailContent;
