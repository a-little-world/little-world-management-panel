import { ContentTypes } from '../Builder';
import { BackendVars } from '../templates/backendVars';

const automatedEmails = {
  'account-deleted': {
    id: 'account-deleted',
    label: 'Account Deleted',
    preview: '',
    content: [
      { type: ContentTypes.Title, text: 'Account erfolgreich gelöscht' },
      {
        type: ContentTypes.Paragraph,
        text: 'Wir möchten dich darüber informieren, dass dein Account erfolgreich gelöscht wurde.',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Bitte beachte, dass diese Aktion nicht rückgängig gemacht werden kann und alle deine verbleibenden Benutzerdaten dauerhaft gelöscht wurden.`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Falls du dich entscheidest, einen neuen Account zu registrieren, beachte bitte, dass du einen neuen Account von Grund auf erstellen musst.',
      },
      {
        type: ContentTypes.Button,
        text: 'Neuen Account erstellen',
        href: 'https://little-world.com/sign-up/',
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Bei Fragen oder Anliegen wende dich bitte an unser Support-Team.',
      },
    ],
  },
  welcome: {
    id: 'welcome',
    label: 'Welcome',
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
      },
    ],
  },
  'confirm-match-1': {
    id: 'confirm-match-1',
    label: 'Confirm Match 1',
    preview: 'Match gefunden - jetzt bestätigen',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Match gefunden - jetzt bestätigen',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `${BackendVars.partnerName} freut sich schon darauf, dich kennenzulernen! Ihr scheint auch schon eine Menge gemeinsam zu haben. Was das ist, erfährst Du hier:`,
      },
      {
        type: ContentTypes.Button,
        text: 'Jetzt match bestätigen',
        href: BackendVars.confirmMatchUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: `Dort kannst du auch den Gesprächsvorschlag mit ${BackendVars.partnerName} annehmen.`,
      },
    ],
  },
  'confirm-match-2': {
    id: 'confirm-match-2',
    label: 'Confirm Match 2',
    preview: 'Dein match wartet - höchste Zeit zu bestätigen',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Dein match wartet - höchste Zeit zu bestätigen',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `du hattest vor Kurzem eine Übereinstimmung auf der Plattform Little World. Gerne würde sich ${BackendVars.partnerName} mit dir unterhalten! Um ihn/sie allerdings nicht zu lange warten zu lassen, werden wir ${BackendVars.partnerName} weitervermitteln, sollten wir nichts von dir hören. Du möchtest mehr über ${BackendVars.partnerName} erfahren? Dann klicke hier:`,
      },
      {
        type: ContentTypes.Button,
        text: 'Jetzt match bestätigen',
        href: BackendVars.confirmMatchUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: `Dort kannst du auch den Gesprächsvorschlag mit ${BackendVars.partnerName} annehmen.`,
      },
    ],
  },
  'expired-match': {
    id: 'expired-match',
    label: 'Match Expired',
    preview: 'Dein Match ist abgelaufen - Finde einen neuen Partner',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Dein Match ist abgelaufen - Finde einen neuen Partner',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `leider ist die Zeit abgelaufen, um ${BackendVars.partnerName} auf der Plattform Little World zu bestätigen. Aber keine Sorge, du kannst dich einloggen und nach einem neuen Match suchen.`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Möchtest du jetzt nach einem neuen Match suchen? Dann klicke hier:',
      },
      {
        type: ContentTypes.Button,
        text: 'Jetzt match bestätigen',
        href: BackendVars.confirmMatchUrl,
      },
    ],
  },
  'new-match': {
    id: 'new-match',
    label: 'New Match',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: `Glückwunsch! Lerne jetzt ${BackendVars.partnerName} kennen,`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `wir freuen uns, dir mitteilen zu können, dass wir ${BackendVars.partnerName} als Gesprächspartner:in für dich gefunden haben!`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `Kontaktiere ${BackendVars.partnerName} einfach über Little World um ein erstes Gespräch zum Kennenlernen zu vereinbaren.`,
      },
      {
        type: ContentTypes.Button,
        text: `${BackendVars.partnerName} kennenlernen`,
        href: BackendVars.profileLinkUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Eines unserer Teammitglieder kann euch dabei gerne begleiten. Schreib Oliver (Support) dafür einfach eine kurze Nachricht.',
      },
    ],
  },
  'new-messages': {
    id: 'new-messages',
    label: 'New Messages',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Neue Nachrichten',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Du hast neue Nachricht(en) auf Little World erhalten. Du kannst deine Nachrichten in dem Chat von Little World ansehen, indem du auf folgenden Knopf drückst:',
      },
      {
        type: ContentTypes.Button,
        text: 'Neue Nachrichten anzeigen',
        href: BackendVars.messagesUrl,
      },
    ],
  },
  'match-resolved': {
    id: 'match-resolved',
    label: 'Match Resolved',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Neue Bekanntschaften suchen auf Little World',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Du hast dich entschieden, deinen aktuellen Vorschlag nicht anzunehmen. Kein Problem! Es warten noch viele andere interessante Bekanntschaften auf dich. Melde dich einfach wieder bei Little World an und starte deine Suche nach neuen Bekanntschaften aus aller Welt.',
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Kontaktiere {match_first_name} einfach über Little World um ein erstes Gespräch zum Kennenlernen zu vereinbaren.',
      },
      {
        type: ContentTypes.Button,
        text: 'Neue Suche starten',
        href: BackendVars.restartSearchUrl,
      },
    ],
  },
  'reset-password': {
    id: 'reset-password',
    label: 'Reset Password',
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
      },
    ],
  },
  'still-in-contact': {
    id: 'still-in-contact',
    label: 'Still in Contact?',
    preview: `Noch in Kontakt mit ${BackendVars.partnerName}?`,
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: `Noch in Kontakt mit ${BackendVars.partnerName}?`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `wie geht es dir und ${BackendVars.partnerName}? Wir hoffen, eure Gespräche bereiten euch weiterhin viel Freude. Bitte gib uns eine kurze Rückmeldung für unsere Wirkungsmessung: Unterhältst du dich noch mit ${BackendVars.partnerName}?`,
      },
      {
        type: ContentTypes.Button,
        text: 'Ja',
        href: 'https://little-world.com/contact-yes/',
      },
    ],
  },
  unfinished_user_form_1: {
    id: 'unfinished_user_form_1',
    label: 'User Form Reminder 1',
    preview: 'Umfrage beenden für Bekanntschaften aus aller Welt',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Umfrage beenden für Bekanntschaften aus aller Welt',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'nur fünf weitere Minuten trennen dich von neuen Bekanntschaften und interessanten Geschichten aus aller Welt. Beende jetzt deine Umfrage auf Little World. Dann kannst du kostenlos und flexibel mitmachen! Schon 30 Minuten pro Woche machen einen großen Unterschied.',
      },
      {
        type: ContentTypes.Button,
        text: 'Umfrage abschließen',
        href: BackendVars.userFormUrl,
      },
    ],
  },
  unfinished_user_form_2: {
    id: 'unfinished_user_form_2',
    label: 'User Form Reminder 2',
    preview: 'Mit 30 Minuten helfen - Umfrage beenden',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Mit 30 Minuten helfen - Umfrage beenden',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Dein Engagement zählt! Willst du Teil der Gemeinschaft von Little World werden und tolle Menschen aus aller Welt kennenlernen? Beende dafür in nur 5 Minuten unsere Umfrage:',
      },
      {
        type: ContentTypes.Button,
        text: 'Umfrage abschließen',
        href: BackendVars.userFormUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Du hast Fragen? Wir sind für dich da! Kontaktiere uns, indem du unten auf Kontakt klickst',
      },
    ],
  },
  'verify-email': {
    id: 'verify-email',
    label: 'Verify Email',
    preview: 'Bitte bestätige deine E-Mail-Adresse für Little World',
    subject: '',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Bitte bestätige deine E-Mail-Adresse für Little World',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'du hast dich kürzlich bei Little World registriert, aber deine E-Mail-Adresse noch nicht bestätigt. Um alle Funktionen unserer Plattform nutzen zu können und mit Menschen aus aller Welt in Kontakt zu treten, bitten wir dich, deine E-Mail-Adresse zu bestätigen.',
      },
      {
        type: ContentTypes.Button,
        text: 'E-mail bestätigen',
        href: BackendVars.confirmationUrl,
      },
    ],
  },
};

export default automatedEmails;
