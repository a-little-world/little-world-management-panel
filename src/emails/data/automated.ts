import KeyImage from '../../assets/key.png';
import { ContentTypes } from '../Builder';
import { BackendVars } from '../shared/constants';
import automatedText from './text/automated.json';

const automatedEmails = {
  'account-deleted': {
    id: 'account-deleted',
    label: 'Account Deleted',
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
  'match-resolved': {
    id: 'match-resolved',
    label: 'Match Resolved',
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
  unfinished_user_form_1: {
    id: 'unfinished_user_form_1',
    label: 'User Form Reminder 1',
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
        text: automatedText['verify-email.block-4'],
        href: BackendVars.confirmationUrl,
      },
    ],
  },
};

export default automatedEmails;
