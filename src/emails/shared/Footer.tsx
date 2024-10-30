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

import footerBannerImage from '../../assets/email-footer-banner.png';
import facebook from '../../assets/facebook.png';
import instagram from '../../assets/instagram.png';
import linkedin from '../../assets/linkedin.png';
import { link, sentence } from '../shared/styles';

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

export const Footer = ({ unsubscribeLink }: { unsubscribeLink?: boolean }) => (
  <Container style={footer}>
    <Section>
      <Img style={bannerImage} src={footerBannerImage} />
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
        href="https://home.little-world.com/kontakt"
      >
        Kontakt
      </Link>
    </Text>
    <Section>
      <Row style={socials}>
        <Column style={{ width: '32px' }}>
          <Link
            style={footerLink}
            href="https://www.instagram.com/littleworld_de"
          >
            <Img src={instagram} width={32} />
          </Link>
        </Column>
        <Column>
          <Link href="https://www.facebook.com/LittleWorld.NonProfit">
            <Img style={{ margin: '0 auto' }} src={facebook} width={32} />
          </Link>
        </Column>
        <Column style={{ width: '32px' }}>
          <Link
            style={footerLink}
            href="https://www.linkedin.com/company/little-world/"
          >
            <Img src={linkedin} width={32} />
          </Link>
        </Column>
      </Row>
    </Section>
    <Text style={{ ...footerText, textAlign: 'center' }}>
      A Little World gUG, www.little-world.com
    </Text>
  </Container>
);

export default Footer;
