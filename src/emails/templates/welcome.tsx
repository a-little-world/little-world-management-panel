import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Text,
} from '@react-email/components';
import * as React from 'react';
import { BackendVars } from './backendVars';

import Logo from '../../assets/logoWithText.png';

export const WelcomeEmail = () => (
    <Html>
        <Head />
        <Preview>Willkommen bei Little World</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={Logo}
                    width="144px"
                    height="40.35"
                    alt="Little World's Logo"
                />
                <Heading style={h1}>Willkommen bei Little World</Heading>
                <Text style={{ ...text, marginBottom: '14px' }}>
                    Wir freuen uns, dass du dich bei Little World registriert hast!
                </Text>
                <Text style={{ ...text, marginBottom: '14px' }}>
                    Damit wir wissen, dass deine E-Mail-Adresse wirklich dir gehört,
                    bestätige diese bitte mit einem Klick auf den Knopf unten, oder gib
                    den Code:
                </Text>
                <code style={code}>{BackendVars.verificationCode}</code>
                <Text
                    style={{
                        ...text,
                        marginBottom: '16px',
                    }}
                >
                    auf unserer Website ein.
                </Text>
                <Button href="https://notion.so" target="_blank" style={button}>
                    E-mail bestätigen
                </Button>
                <Text
                    style={{
                        ...text,
                        marginBottom: '38px',
                    }}
                >
                    Solltest du dich nicht bei Little World registriert haben, kannst du
                    diese E-Mail ignorieren.
                </Text>
                <Text
                    style={{
                        ...text,
                        marginBottom: '38px',
                    }}
                >
                    Beste Grüße, Dein Little World Team
                </Text>
                <Text style={footer}>
                    <Link
                        href="https://home.little-world.com"
                        target="_blank"
                        style={{ ...link, color: '#898989' }}
                    >
                        Little World
                    </Link>
                    , Deutsch Sprechen
                    <br />
                    leicht gemacht.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;

const main = {
    backgroundColor: '#ffffff',
};

const container = {
    paddingLeft: '12px',
    paddingRight: '12px',
    margin: '0 auto',
};

const h1 = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
};

const link = {
    color: '#0063AF',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '14px',
    textDecoration: 'underline',
};

const button = {
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    color: '#0063AF',
    padding: '8px',
    border: '2px solid #0063AF',
    borderRadius: '90px',
    textAlign: 'center',
    width: '172px',
    fontSize: '16px',
    marginBottom: '24px',
};

const text = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '14px',
    margin: '24px 0',
};

const footer = {
    color: '#898989',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '12px',
    lineHeight: '22px',
    marginBottom: '24px',
};

const code = {
    display: 'inline-block',
    padding: '16px 4.5%',
    width: '90.5%',
    backgroundColor: '#f4f4f4',
    borderRadius: '5px',
    border: '1px solid #eee',
    color: '#333',
};
