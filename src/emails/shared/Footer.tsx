import {
  Column,
  Container,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import facebook from '../../assets/facebook.png';
import instagram from '../../assets/instagram.png';
import linkedin from '../../assets/linkedin.png';
import { link, sentence } from '../shared/styles';
import { THEMES } from './constants';

export const footer = {
  borderCollapse: 'separate',
  backgroundColor: '#fafbfb',
  color: 'rgb(156 163 175)',
  fontFamily: 'Open Sans,Helvetica,Arial,sans serif',
  lineHeight: '22px',
  marginBottom: '40px',
  padding: '8px',
  paddingTop: '0px',
  margin: '0 auto',
  maxWidth: '37.5em',
};

const bannerImage = {
  maxWidth: '100%',
  borderBottomLeftRadius: '32px',
  borderBottomRightRadius: '32px',
  display: 'block',
  margin: '0 auto',
  width: '100%',
};

const footerLink = {
  ...link,
  color: 'rgb(156 163 175)',
};

const footerActions = {
  textAlign: 'center',
  width: '100%',
  margin: '24px 0',
};

const footerText = {
  ...sentence,
  color: 'rgb(156 163 175)',
  marginTop: '24px',
  padding: 0,
  textAlign: 'center',
  width: '100%',
};

const socials = {
  width: '202px',
  padding: '0px',
  borderCollapse: 'separate',
};

export const Footer = ({
  unsubscribeLink,
  themeContent,
}: {
  unsubscribeLink?: string;
  themeContent: (typeof THEMES)[keyof typeof THEMES];
}) => {
  return (
    <Container style={footer}>
      <Section>
        <Img style={bannerImage} src={themeContent.footerBannerImage} />
      </Section>
      <Text style={footerActions}>
        {unsubscribeLink && (
          <>
            <Link
              style={{ ...footerLink, marginRight: '8px' }}
              href={unsubscribeLink}
            >
              Unsubscribe
            </Link>{' '}
            ・
          </>
        )}
        {/* <Column style={{ textAlign: 'center', width: '33%' }}>
          <Link style={{ ...footerLink, margin: '0 16px' }}>
            Manage Preferences
          </Link>
        </Column> */}
        <Link
          style={{ ...footerLink, marginLeft: unsubscribeLink ? '8px' : '0' }}
          href={themeContent.contactUrl}
        >
          Kontakt
        </Link>
      </Text>
      {themeContent.socials && (
        <Section>
          <Row style={socials}>
            <Column style={{ width: '32px' }}>
              <Link style={footerLink} href={themeContent.socials.instagram}>
                <Img src={instagram} width={32} />
              </Link>
            </Column>
            <Column>
              <Link href={themeContent.socials.facebook}>
                <Img style={{ margin: '0 auto' }} src={facebook} width={32} />
              </Link>
            </Column>
            <Column style={{ width: '32px' }}>
              <Link style={footerLink} href={themeContent.socials.linkedin}>
                <Img src={linkedin} width={32} />
              </Link>
            </Column>
          </Row>
        </Section>
      )}
      <Text style={{ ...footerText, textAlign: 'center' }}>
        {themeContent.footerText}
      </Text>
    </Container>
  );
};

export default Footer;
