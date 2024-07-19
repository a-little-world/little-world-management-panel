import { ContentTypes } from './Builder';
import { BackendVars } from './templates/backendVars';

const emailsData = {
  welcome: {
    preview: 'Willkommen bei Little World',
    subject: '',
    content: [
      { type: ContentTypes.Title, text: 'Willkommen bei Little World' },
      {
        type: ContentTypes.Paragraph,
        text: 'Wir freuen uns, dass du dich bei Little World registriert hast!',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Damit wir wissen, dass deine E-Mail-Adresse wirklich dir gehört,
            bestätige diese bitte mit einem Klick auf den Knopf unten, oder gib
            den Code:`,
      },
      {
        type: ContentTypes.Code,
        text: BackendVars.verificationCode,
      },
      {
        type: ContentTypes.Paragraph,
        text: `auf unserer Website ein.`,
      },
      {
        type: ContentTypes.Button,
        text: 'E-mail bestätigen',
        href: BackendVars.confirmationUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Solltest du dich nicht bei Little World registriert haben, kannst du diese E-Mail ignorieren.',
        href: BackendVars.confirmationUrl,
      },
    ],
  },
  'reset-password': {
    preview: 'Passwort zurücksetzen',
    subject: '',
    content: [
      { type: ContentTypes.Title, text: 'Passwort Vergessen?' },
      {
        type: ContentTypes.Illustration,
        imgProps: {
          src: 'https://little-world-production-bucket.s3.eu-central-1.amazonaws.com/static/img/email/icon_key.png',
          width: '72',
          alt: 'Key picture',
        },
      },
      {
        type: ContentTypes.Sentence,
        text: 'Macht doch nichts!',
        centred: true,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Hier kannst du dein Passwort zurück setzen',
        centred: true,
      },
      {
        type: ContentTypes.Button,
        text: 'Passwort zurücksetzen',
        href: BackendVars.passwordResetUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Solltest du dich nicht bei Little World registriert haben, kannst du diese E-Mail ignorieren.',
        href: BackendVars.confirmationUrl,
      },
    ],
  },
};

export default emailsData;
