import KeyImage from '../../assets/key.png';
import { ContentTypes } from '../Builder';
import { BackendVars, EmailCategories } from '../shared/constants';
import automatedText from './text/automated.json';
import patenmatchTexts from './text/patenmatch.json';

const patenmatchEmails = {
  'patenmatch-matching-back-online': {
    id: 'patenmatch-matching-back-online',
    label: 'Patenmatch Matching is back online',
    category_id: EmailCategories.AutomatedPatenmatch,
    sender_id: 'info-patenmatch',
    theme: 'patenmatch',
    preview: patenmatchTexts['patenmatch-matching-back-online.preview'],
    subject: patenmatchTexts['patenmatch-matching-back-online.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: patenmatchTexts['patenmatch-matching-back-online.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-matching-back-online.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-matching-back-online.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-matching-back-online.block-4'],
      },
      {
        type: ContentTypes.Link,
        text: patenmatchTexts['patenmatch-matching-back-online.block-5'],
        href: 'https://home.little-world.com/projecttogether-uebergibt-patenmatch-an-little-world',
      },
      {
        type: ContentTypes.Button,
        text: patenmatchTexts['patenmatch-matching-back-online.block-6'],
        href: '{{ patenmatch_email_verification_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-matching-back-online.block-7'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-matching-back-online.block-8'],
      },
    ],
  },
  'patenmatch-signup': {
    id: 'patenmatch-signup',
    label: 'Patenmatch Signup Welcome',
    sender_id: 'info-patenmatch',
    category_id: EmailCategories.AutomatedPatenmatch,
    theme: 'patenmatch',
    preview: patenmatchTexts['patenmatch-signup.preview'],
    subject: patenmatchTexts['patenmatch-signup.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: patenmatchTexts['patenmatch-signup.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-signup.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-signup.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-signup.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: patenmatchTexts['patenmatch-signup.block-match-link-text'],
        href: '{{ patenmatch_email_verification_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-signup.block-6'],
      },
    ],
  },
  'patenmatch-orga-forward-user': {
    id: 'patenmatch-orga-forward-user',
    label: 'Patenmatch Organization Forward User',
    category_id: EmailCategories.AutomatedPatenmatch,
    theme: 'patenmatch',
    sender_id: 'info-patenmatch',
    preview: patenmatchTexts['patenmatch-orga-forward-user.preview'],
    subject: patenmatchTexts['patenmatch-orga-forward-user.subject'],
    content: [
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-orga-forward-user.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-orga-forward-user.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-orga-forward-user.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-orga-forward-user.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-orga-forward-user.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-orga-forward-user.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: patenmatchTexts['patenmatch-orga-forward-user.block-7'],
      },
    ],
  },
}

const automatedEmails = {
  ...patenmatchEmails,
  'prematching-call-no-show': {
    id: 'prematching-call-no-show',
    label: 'Prematching call no show',
    category_id: EmailCategories.Automated,
    preview: automatedText['prematching-call-no-show.preview'],
    subject: automatedText['prematching-call-no-show.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['prematching-call-no-show.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-no-show.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-no-show.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-no-show.block-4'],
      },
      {
        type: ContentTypes.Link,
        text: 'Buche einen neuen Termin',
        href: automatedText['prematching-call-no-show.booking-link'],
      },
      {
        type: ContentTypes.Paragraph,
        text: "",
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-no-show.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-no-show.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-no-show.block-7'],
      },
    ],
  },
  'prematching-call-post-thanks': {
    id: 'prematching-call-post-thanks',
    label: 'Prematching call thanks for coming',
    category_id: EmailCategories.Automated,
    preview: automatedText['prematching-call-post-thanks.preview'],
    subject: automatedText['prematching-call-post-thanks.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['prematching-call-post-thanks.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-post-thanks.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-post-thanks.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-post-thanks.block-4'],
      },
      {
        type: ContentTypes.Link,
        text: 'Little World Gruppengespräche',
        href: 'https://home.little-world.com/#gruppentermine',
      },
      {
        type: ContentTypes.Paragraph,
        text: "",
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['prematching-call-post-thanks.block-5'],
      },
    ],
  },
  'account-deleted': {
    id: 'account-deleted',
    label: 'Account Deleted',
    category_id: EmailCategories.Automated,
    preview: automatedText['account-deleted.preview'],
    subject: automatedText['account-deleted.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['account-deleted.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['account-deleted.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['account-deleted.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['account-deleted.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['account-deleted.block-5'],
        href: 'https://little-world.com/sign-up/',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['account-deleted.block-6'],
      },
    ],
  },
  welcome: {
    id: 'welcome',
    label: 'Welcome',
    category_id: EmailCategories.Automated,
    preview: automatedText['welcome.preview'],
    subject: automatedText['welcome.subject'],
    content: [
      { type: ContentTypes.Title, text: automatedText['welcome.block-1'] },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['welcome.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['welcome.block-3'],
      },
      {
        type: ContentTypes.Code,
        text: BackendVars.verificationCode,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['welcome.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['welcome.block-5'],
        href: BackendVars.confirmationUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['welcome.block-6'],
      },
    ],
  },
  'confirm-match-1': {
    id: 'confirm-match-1',
    label: 'Confirm Match 1',
    category_id: EmailCategories.Automated,
    preview: automatedText['confirm-match-1.preview'],
    subject: automatedText['confirm-match-1.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['confirm-match-1.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['confirm-match-1.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['confirm-match-1.block-3'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['confirm-match-1.block-4'],
        href: BackendVars.acceptMatchUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['confirm-match-1.block-5'],
      },
    ],
  },
  'confirm-match-2': {
    id: 'confirm-match-2',
    label: 'Confirm Match 2',
    category_id: EmailCategories.Automated,
    preview: automatedText['confirm-match-2.preview'],
    subject: automatedText['confirm-match-2.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['confirm-match-2.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['confirm-match-2.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['confirm-match-2.block-3'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['confirm-match-2.block-4'],
        href: BackendVars.acceptMatchUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['confirm-match-2.block-5'],
      },
    ],
  },
  'expired-match': {
    id: 'expired-match',
    label: 'Match Expired',
    category_id: EmailCategories.Automated,
    preview: automatedText['expired-match.preview'],
    subject: automatedText['expired-match.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['expired-match.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['expired-match.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['expired-match.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['expired-match.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['expired-match.block-5'],
        href: BackendVars.acceptMatchUrl,
      },
    ],
  },
    'new-match': {
    id: 'new-match',
    label: 'New Match',
    category_id: EmailCategories.Automated,
    preview: automatedText['new-match.block-5'],
    subject: automatedText['new-match.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['new-match.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['new-match.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['new-match.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['new-match.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['new-match.block-5'],
        href: BackendVars.partnerProfileUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['new-match.block-6'],
      },
    ],
  },
    'new-messages': {
      id: 'new-messages',
      label: 'New Messages',
      category_id: EmailCategories.Automated,
      preview: automatedText['new-messages.preview'],
      subject: automatedText['new-messages.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['new-messages.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['new-messages.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['new-messages.block-3'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['new-messages.block-4'],
          href: BackendVars.messagesUrl,
        },
      ],
    },
      'automatic-emails-m051': {
        id: 'automatic-emails-m051',
        label: 'M051 - Off-Platform Contact',
        category_id: EmailCategories.Automated,
        preview: automatedText['automatic-emails-m051.preview'],
        subject: automatedText['automatic-emails-m051.subject'],
        content: [
          {
            type: ContentTypes.Title,
            text: automatedText['automatic-emails-m051.block-1'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-m051.block-2'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-m051.block-3'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-m051.block-4'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-m051.block-5'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-m051.block-6'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-m051.block-7'],
          },
        ],
      },
    'automatic-emails-u023': {
      id: 'automatic-emails-u023',
      label: 'Onboarding Reminder',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u023.preview'],
      subject: automatedText['automatic-emails-u023.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u023.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u023.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u023.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u023.block-4'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u023.block-7'],
          href: '{{ prematching_call_booking_link }}',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u023.block-5'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u023.block-6'],
        },
      ],
    },
    'automatic-emails-u024': {
      id: 'automatic-emails-u024',
      label: 'Hast du dein Onboarding schon gebucht?',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u024.preview'],
      subject: automatedText['automatic-emails-u024.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u024.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u024.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u024.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u024.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u024.block-5'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u024.block-6'],
          href: '{{ prematching_call_booking_link }}',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u024.block-7'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u024.block-8'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u024.block-9'],
        },
      ],
    },
      'automatic-emails-u025': {
        id: 'automatic-emails-u025',
        label: 'Viele Lernende warten – bist du dabei?',
        category_id: EmailCategories.Automated,
        preview: automatedText['automatic-emails-u025.preview'],
        subject: automatedText['automatic-emails-u025.subject'],
        content: [
          {
            type: ContentTypes.Title,
            text: automatedText['automatic-emails-u025.block-1'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u025.block-2'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u025.block-3'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u025.block-4'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u025.block-5'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u025.block-6'],
          },
          {
            type: ContentTypes.Button,
            text: automatedText['automatic-emails-u025.block-7'],
            href: '{{ prematching_call_booking_link }}',
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u025.block-8'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u025.block-9'],
          },
        ],
      },
      'automatic-emails-u043': {
        id: 'automatic-emails-u043',
        label: 'Onboarding Call Reminder (24h)',
        category_id: EmailCategories.Automated,
        preview: automatedText['automatic-emails-u043.preview'],
        subject: automatedText['automatic-emails-u043.subject'],
        content: [
          {
            type: ContentTypes.Title,
            text: automatedText['automatic-emails-u043.block-1'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-2'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-3'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-4'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-5'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-6'],
          },
          {
            type: ContentTypes.Button,
            text: automatedText['automatic-emails-u043.block-7'],
            href: '{{ call_link }}',
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-8'],
          },
          {
            type: ContentTypes.Link,
            text: automatedText['automatic-emails-u043.link-reschedule'],
            href: '{{ prematching_call_booking_link }}',
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-9'],
          },
          {
            type: ContentTypes.Link,
            text: automatedText['automatic-emails-u043.link-chat'],
            href: '{{ messages_url }}',
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-10'],
          },
          {
            type: ContentTypes.Link,
            text: automatedText['automatic-emails-u043.link-password-reset'],
            href: 'https://little-world.com/forgot-password/',
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-11'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u043.block-12'],
          },
        ],
      },
    'automatic-emails-u053': {
      id: 'automatic-emails-u053',
      label: 'Onboarding No-Show Reminder',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u053.preview'],
      subject: automatedText['automatic-emails-u053.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u053.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u053.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u053.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u053.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u053.block-5'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u053.block-9'],
          href: '{{ prematching_call_booking_link }}',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u053.block-6'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u053.block-10'],
          href: '{{ messages_url }}',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u053.block-7'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u053.block-8'],
        },
      ],
    },
      'automatic-emails-u044': {
        id: 'automatic-emails-u044',
        label: 'Onboarding Call Reminder (1h)',
        category_id: EmailCategories.Automated,
        preview: automatedText['automatic-emails-u044.preview'],
        subject: automatedText['automatic-emails-u044.subject'],
        content: [
          {
            type: ContentTypes.Title,
            text: automatedText['automatic-emails-u044.block-1'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u044.block-2'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u044.block-3'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u044.block-4'],
          },
          {
            type: ContentTypes.Button,
            text: automatedText['automatic-emails-u044.block-5'],
            href: '{{ call_link }}',
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u044.block-6'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u044.block-7'],
          },
          {
            type: ContentTypes.Paragraph,
            text: automatedText['automatic-emails-u044.block-8'],
          },
          {
            type: ContentTypes.Link,
            text: automatedText['automatic-emails-u044.ps-link-label'],
            href: '{{ prematching_call_booking_link }}',
          },
        ],
      },
    'automatic-emails-u072': {
      id: 'automatic-emails-u072',
      label: 'Group Calls Follow-up',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u072.preview'],
      subject: automatedText['automatic-emails-u072.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u072.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u072.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u072.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u072.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u072.block-5'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u072.block-6'],
          href: 'https://home.little-world.com/#gruppentermine',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u072.block-7'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u072.block-8'],
        },
      ],
    },
    'automatic-emails-u082': {
      id: 'automatic-emails-u082',
      label: 'Group Calls Invitation',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u082.preview'],
      subject: automatedText['automatic-emails-u082.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u082.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u082.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u082.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u082.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u082.block-5'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u082.block-6'],
          href: 'https://home.little-world.com/#gruppentermine',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u082.block-7'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u082.block-8'],
        },
      ],
    },
    'automatic-emails-u073': {
      id: 'automatic-emails-u073',
      label: 'Availability Reminder',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u073.preview'],
      subject: automatedText['automatic-emails-u073.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u073.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u073.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u073.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u073.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u073.block-5'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u073.block-6'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u073.block-7'],
          href: '{{ availability_url }}',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u073.block-8'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u073.block-9'],
        },
      ],
    },
    'automatic-emails-u084': {
      id: 'automatic-emails-u084',
      label: 'Delayed Match Update',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u084.preview'],
      subject: automatedText['automatic-emails-u084.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u084.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u084.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u084.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u084.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u084.block-5'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u084.block-6'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u084.block-7'],
          href: 'https://home.little-world.com/#gruppentermine',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u084.block-8'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u084.block-9'],
        },
      ],
    },
    'automatic-emails-u074': {
      id: 'automatic-emails-u074',
      label: 'Delayed Match Reminder',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u074.preview'],
      subject: automatedText['automatic-emails-u074.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u074.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-5'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-6'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-7'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u074.block-8'],
          href: 'https://home.little-world.com/#gruppentermine',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-9'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u074.block-10'],
        },
      ],
    },
    'automatic-emails-u081': {
      id: 'automatic-emails-u081',
      label: 'U081 - Matching gestartet',
      category_id: EmailCategories.Automated,
      preview: automatedText['automatic-emails-u081.preview'],
      subject: automatedText['automatic-emails-u081.subject'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['automatic-emails-u081.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-4'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-5'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-6'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-7'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u081.block-8'],
          href: 'https://home.little-world.com/#gruppentermine',
        },
        {
          type: ContentTypes.Button,
          text: automatedText['automatic-emails-u081.block-9'],
          href: 'https://home.little-world.com/#ressourcen',
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-10'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-11'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['automatic-emails-u081.block-12'],
        },
      ],
    },
    'match-resolved': {
      id: 'match-resolved',
      label: 'Match Resolved',
      category_id: EmailCategories.Automated,
      subject: automatedText['match-resolved.subject'],
      preview: automatedText['match-resolved.preview'],
      content: [
        {
          type: ContentTypes.Title,
          text: automatedText['match-resolved.block-1'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['match-resolved.block-2'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['match-resolved.block-3'],
        },
        {
          type: ContentTypes.Paragraph,
          text: automatedText['match-resolved.block-4'],
        },
        {
          type: ContentTypes.Button,
          text: automatedText['match-resolved.block-5'],
          href: BackendVars.restartSearchUrl,
        },
      ],
    },
  'reset-password': {
    id: 'reset-password',
    label: 'Reset Password',
    category_id: EmailCategories.Automated,
    subject: automatedText['reset-password.subject'],
    preview: automatedText['reset-password.preview'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['reset-password.block-1'],
      },
      {
        type: ContentTypes.Illustration,
        imgProps: {
          src: KeyImage,
          width: '72',
          alt: 'Key picture',
        },
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['reset-password.block-2'],
        centred: true,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['reset-password.block-3'],
        centred: true,
      },
      {
        type: ContentTypes.Button,
        text: automatedText['reset-password.block-4'],
        href: BackendVars.passwordResetUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['reset-password.block-5'],
      },
    ],
  },
  'still-in-contact': {
    id: 'still-in-contact',
    label: 'Still in Contact?',
    category_id: EmailCategories.Automated,
    subject: automatedText['still-in-contact.subject'],
    preview: automatedText['still-in-contact.preview'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['still-in-contact.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['still-in-contact.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['still-in-contact.block-3'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['still-in-contact.block-4'],
        href: BackendVars.confirmContactUrl,
      },
    ],
  },
  'still-in-contact-inactive': {
    id: 'still-in-contact-inactive',
    label: 'Still in Contact (Inactive Match)',
    category_id: EmailCategories.Automated,
    preview: automatedText['still-in-contact-inactive.preview'],
    subject: automatedText['still-in-contact-inactive.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['still-in-contact-inactive.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['still-in-contact-inactive.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['still-in-contact-inactive.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['still-in-contact-inactive.block-4'],
      },
      {
        type: ContentTypes.TwoButtons,
        leftText: automatedText['still-in-contact-inactive.block-5'],
        rightText: automatedText['still-in-contact-inactive.block-6'],
        leftHref: BackendVars.stillInContactYesUrl,
        rightHref: BackendVars.stillInContactNoUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['still-in-contact-inactive.block-7'],
      },
    ],
  },
  unfinished_user_form_1: {
    id: 'unfinished_user_form_1',
    label: 'User Form Reminder 1',
    category_id: EmailCategories.Automated,
    subject: automatedText['unfinished_user_form_1.subject'],
    preview: automatedText['unfinished_user_form_1.preview'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['unfinished_user_form_1.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['unfinished_user_form_1.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['unfinished_user_form_1.block-3'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['unfinished_user_form_1.block-4'],
        href: BackendVars.userFormUrl,
      },
    ],
  },
  unfinished_user_form_2: {
    id: 'unfinished_user_form_2',
    label: 'User Form Reminder 2',
    category_id: EmailCategories.Automated,
    preview: automatedText['unfinished_user_form_2.preview'],
    subject: automatedText['unfinished_user_form_2.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['unfinished_user_form_2.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['unfinished_user_form_2.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['unfinished_user_form_2.block-3'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['unfinished_user_form_2.block-4'],
        href: BackendVars.userFormUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['unfinished_user_form_2.block-5'],
      },
    ],
  },
  'verify-email': {
    id: 'verify-email',
    label: 'Verify Email',
    category_id: EmailCategories.Automated,
    preview: automatedText['verify-email.preview'],
    subject: automatedText['verify-email.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['verify-email.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['verify-email.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['verify-email.block-3'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['verify-email.block-5'],
        href: BackendVars.confirmationUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['verify-email.block-4'],
      },
      {
        type: ContentTypes.Code,
        text: BackendVars.verificationCode,
      }
    ],
  },
  'new-match-engage': {
    id: 'new-match-engage',
    label: 'new-match-engage',
    category_id: EmailCategories.Automated,
    preview: automatedText['new-match-engage.preview'],
    subject: automatedText['engage-new-match.subject'],
    content: [
      { type: ContentTypes.Title,
        text: automatedText['engage-new-match.block-1'] },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['engage-new-match.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['engage-new-match.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['engage-new-match.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['engage-new-match.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['engage-new-match.block-6'],
        href: BackendVars.loginUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['engage-new-match.block-7'],
      },
    ],
  },
};

export function getAutomatedPatentmatchEmails() {
  let automatedEmailsPatenmatch = {};

  Object.keys(automatedEmails).forEach(key => {
    if (
      automatedEmails[key].category_id === EmailCategories.AutomatedPatenmatch
    ) {
      automatedEmailsPatenmatch[key] = {
        ...automatedEmails[key],
        category_id: EmailCategories.AutomatedPatenmatch,
      };
    }
  });
  return automatedEmailsPatenmatch;
}

export default automatedEmails;
