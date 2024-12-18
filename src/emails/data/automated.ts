import KeyImage from '../../assets/key.png';
import { ContentTypes } from '../Builder';
import { BackendVars, EmailCategories } from '../shared/constants';
import automatedText from './text/automated.json';
import patenmatchTexts from './text/patenmatch.json';

const patenmatchTexts = {
  'patenmatch-waiting': {
    id: 'patenmatch-waiting',
    label: 'Patenmatch Waiting Status',
    category_id: EmailCategories.AutomatedPatenmatch,
    theme: 'patenmatch',
    preview: automatedText['patenmatch-waiting.preview'],
    subject: automatedText['patenmatch-waiting.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['patenmatch-waiting.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-waiting.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-waiting.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-waiting.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['patenmatch-waiting.block-5'],
        href: 'https://home.little-world.com/projecttogether-uebergibt-patenmatch-an-little-world',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-waiting.block-6'],
      },
    ],
  },
  'patenmatch-signup': {
    id: 'patenmatch-signup',
    label: 'Patenmatch Signup Welcome',
    category_id: EmailCategories.AutomatedPatenmatch,
    theme: 'patenmatch',
    preview: automatedText['patenmatch-signup.preview'],
    subject: automatedText['patenmatch-signup.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['patenmatch-signup.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-signup.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-signup.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-signup.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['patenmatch-signup.block-5'],
        href: 'https://home.little-world.com/projecttogether-uebergibt-patenmatch-an-little-world',
      },
      {
        type: ContentTypes.Button,
        text: automatedText['patenmatch-signup.block-5'],
        href: '{{ patenmatch_email_verification_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-signup.block-6'],
      },
    ],
  },
  'patenmatch-example': {
    id: 'patenmatch-example',
    label: 'Patenmatch example',
    category_id: EmailCategories.AutomatedPatenmatch,
    theme: 'patenmatch',
    preview: automatedText['patenmatch-example.preview'],
    subject: automatedText['patenmatch-example.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['patenmatch-example.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-example.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-example.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-example.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['patenmatch-example.block-5'],
        href: 'https://patenmatch.de/',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-example.block-6'],
      },
    ],
  },
  'patenmatch-orga-forward-user': {
    id: 'patenmatch-orga-forward-user',
    label: 'Patenmatch Organization Forward User',
    category_id: EmailCategories.AutomatedPatenmatch,
    theme: 'patenmatch',
    preview: automatedText['patenmatch-orga-forward-user.preview'],
    subject: automatedText['patenmatch-orga-forward-user.subject'],
    content: [
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-orga-forward-user.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-orga-forward-user.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-orga-forward-user.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-orga-forward-user.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-orga-forward-user.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-orga-forward-user.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['patenmatch-orga-forward-user.block-7'],
      },
    ],
  },
}

const automatedEmails = {
  ...patenmatchTexts,
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
        text: automatedText['verify-email.block-4'],
        href: BackendVars.confirmationUrl,
      },
    ],
  },
};

export function getAutomatedPatentmatchEmails() {
  let automatedEmailsPatenmatch = {};

  Object.keys(automatedEmails).forEach(key => {
      if (automatedEmails[key].category_id === EmailCategories.AutomatedPatenmatch) {
        automatedEmailsPatenmatch[key] = {
          ...automatedEmails[key],
          category_id: EmailCategories.AutomatedPatenmatch,
        };
    }
  });
  return automatedEmailsPatenmatch;
}


export default automatedEmails;
