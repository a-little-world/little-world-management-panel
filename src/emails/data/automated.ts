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
};

const automatedEmails = {
  ...patenmatchEmails,
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
  'automatic-emails-fm001': {
    id: 'automatic-emails-fm001',
    label: 'FM001 - Proposed Match Expired',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-fm001.preview'],
    subject: automatedText['automatic-emails-fm001.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-fm001.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm001.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm001.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm001.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-fm001.block-5'],
        href: BackendVars.restartSearchUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm001.block-6'],
      },
    ],
  },
  'automatic-emails-fm011': {
    id: 'automatic-emails-fm011',
    label: 'FM011 - Match Removed No Contact',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-fm011.preview'],
    subject: automatedText['automatic-emails-fm011.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-fm011.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm011.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm011.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm011.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-fm011.block-5'],
        href: '{{ match_removed_fm011_no_contact_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm011.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm011.block-7'],
      },
    ],
  },
  'automatic-emails-fm021': {
    id: 'automatic-emails-fm021',
    label: 'FM021 - Match Ended Feedback Request',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-fm021.preview'],
    subject: automatedText['automatic-emails-fm021.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-fm021.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm021.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm021.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm021.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-fm021.block-5'],
        href: '{{ match_removed_fm011_no_contact_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm021.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm021.block-7'],
      },
    ],
  },
  'automatic-emails-fm022': {
    id: 'automatic-emails-fm022',
    label: 'Failed Matching – User Ghosted',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-fm022.preview'],
    subject: automatedText['automatic-emails-fm022.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-fm022.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm022.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm022.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm022.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-fm022.block-5'],
      },
    ],
  },
  'automatic-emails-m012': {
    id: 'automatic-emails-m012',
    label: 'M012 - First Conversation Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m012.preview'],
    subject: automatedText['automatic-emails-m012.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m012.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m012.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m012.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m012.block-4'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-m012.block-5'],
        href: '{{ link_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m012.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m012.block-7'],
        href: '{{ messages_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m012.block-8'],
      },
    ],
  },
  'automatic-emails-m013': {
    id: 'automatic-emails-m013',
    label: 'M013 - Partner Waiting Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m013.preview'],
    subject: automatedText['automatic-emails-m013.subject'],
    content: [
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m013.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m013.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m013.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m013.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m013.block-5'],
        href: '{{ messages_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m013.block-6'],
      },
    ],
  },
  'automatic-emails-m014': {
    id: 'automatic-emails-m014',
    label: 'M014 - Contact Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m014.preview'],
    subject: automatedText['automatic-emails-m014.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m014.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m014.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m014.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m014.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m014.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m014.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m014.block-7'],
        href: '{{ messages_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m014.block-8'],
      },
    ],
  },
  'automatic-emails-m023': {
    id: 'automatic-emails-m023',
    label: 'M023 - Partner Waiting Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m023.preview'],
    subject: automatedText['automatic-emails-m023.subject'],
    content: [
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m023.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m023.block-2'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m023.block-3'],
        href: BackendVars.messagesUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m023.block-4'],
      },
    ],
  },
  'automatic-emails-m024': {
    id: 'automatic-emails-m024',
    label: 'M024 - No Answer Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m024.preview'],
    subject: automatedText['automatic-emails-m024.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m024.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m024.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m024.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m024.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m024.block-5'],
        href: '{{ no_response_poll_url }}',
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-m024.block-6'],
        href: '{{ messages_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m024.block-7'],
      },
    ],
  },
  'automatic-emails-m025': {
    id: 'automatic-emails-m025',
    label: 'M025 - Partner Follow-up',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m025.preview'],
    subject: automatedText['automatic-emails-m025.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m025.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m025.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m025.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m025.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m025.block-5'],
      },
    ],
  },
  'automatic-emails-m031': {
    id: 'automatic-emails-m031',
    label: 'M031 - Videocall Support Offer',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m031.preview'],
    subject: automatedText['automatic-emails-m031.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m031.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m031.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m031.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m031.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m031.block-5'],
      },
    ],
  },
  'automatic-emails-m032': {
    id: 'automatic-emails-m032',
    label: 'M032 - Videocall Planning Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m032.preview'],
    subject: automatedText['automatic-emails-m032.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m032.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m032.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m032.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m032.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m032.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m032.block-6'],
        href: '{{ still_in_contact_yes_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m032.block-7'],
      },
    ],
  },
  'automatic-emails-m033': {
    id: 'automatic-emails-m033',
    label: 'M033 - No Video-Call Update',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m033.preview'],
    subject: automatedText['automatic-emails-m033.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m033.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m033.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m033.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m033.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m033.block-5'],
        href: '{{ still_in_contact_yes_url }}',
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m033.block-6'],
        href: '{{ still_in_contact_no_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m033.block-7'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-m033.link-support-chat'],
        href: '{{ messages_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m033.block-8'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m033.block-9'],
      },
    ],
  },
  'automatic-emails-m042': {
    id: 'automatic-emails-m042',
    label: 'M042 - Contact Check',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m042.preview'],
    subject: automatedText['automatic-emails-m042.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m042.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m042.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m042.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m042.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m042.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m042.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m042.block-8'],
        href: '{{ still_in_contact_yes_url }}',
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-m042.block-9'],
        href: '{{ messages_url }}',
      },
    ],
  },
  'automatic-emails-m043': {
    id: 'automatic-emails-m043',
    label: 'M043 - 5 Videocalls Survey',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m043.preview'],
    subject: automatedText['automatic-emails-m043.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m043.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m043.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m043.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m043.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m043.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m043.block-6'],
        href: '{{ post_videocall_survey_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m043.block-7'],
      },
    ],
  },
  'automatic-emails-m044': {
    id: 'automatic-emails-m044',
    label: 'M044 - Share Story Invite',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m044.preview'],
    subject: automatedText['automatic-emails-m044.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m044.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m044.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m044.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m044.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m044.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m044.block-6'],
        href: '{{ share_story_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m044.block-7'],
      },
    ],
  },
  'automatic-emails-m045': {
    id: 'automatic-emails-m045',
    label: 'M045 - 10 Videocalls Completed',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m045.preview'],
    subject: automatedText['automatic-emails-m045.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m045.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m045.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m045.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m045.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m045.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m045.block-6'],
        href: '{{ completed_match_poll_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m045.block-7'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m045.block-8'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m045.block-9'],
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
    ],
  },
  'automatic-emails-m053': {
    id: 'automatic-emails-m053',
    label: 'M053 - 5-week Survey',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m053.preview'],
    subject: automatedText['automatic-emails-m053.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m053.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m053.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m053.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m053.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m053.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m053.block-6'],
        href: '{{ five_week_survey_url }}',
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m053.block-7'],
        href: BackendVars.stillInContactNoUrl,
      },
    ],
  },
  'automatic-emails-m054': {
    id: 'automatic-emails-m054',
    label: 'M054 - Share Story Invite',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m054.preview'],
    subject: automatedText['automatic-emails-m054.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m054.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m054.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m054.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m054.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m054.block-5'],
        href: '{{ share_story_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m054.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m054.block-7'],
        href: '{{ still_in_contact_no_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m054.block-8'],
      },
    ],
  },
  'automatic-emails-m055': {
    id: 'automatic-emails-m055',
    label: 'M055 - 10-week Match Celebration',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-m055.preview'],
    subject: automatedText['automatic-emails-m055.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-m055.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m055.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m055.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m055.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m055.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m055.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m055.block-7'],
        href: '{{ completed_match_poll_url }}',
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-m055.block-8'],
        href: BackendVars.stillInContactNoUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-m055.block-9'],
      },
    ],
  },
  'automatic-emails-native-app-beta-android': {
    id: 'automatic-emails-native-app-beta-android',
    label: 'Native App Beta Invite (Android)',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-native-app-beta-android.preview'],
    subject: automatedText['automatic-emails-native-app-beta-android.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-native-app-beta-android.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-android.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-android.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-android.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-android.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-android.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-native-app-beta-android.block-7'],
        href: '{{ android_beta_app_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-android.block-8'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-android.block-9'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText[
          'automatic-emails-native-app-beta-android.block-10'
        ],
        href: '{{ native_app_repo_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText[
          'automatic-emails-native-app-beta-android.block-11'
        ],
      },
      {
        type: ContentTypes.Link,
        text: automatedText[
          'automatic-emails-native-app-beta-android.block-12'
        ],
        href: '{{ native_app_bug_report_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText[
          'automatic-emails-native-app-beta-android.block-13'
        ],
      },
      {
        type: ContentTypes.Link,
        text: 'Zum Support-Chat',
        href: '{{ messages_url }}',
      },
    ],
  },
  'automatic-emails-native-app-beta-ios': {
    id: 'automatic-emails-native-app-beta-ios',
    label: 'Native App Beta Invite (iOS)',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-native-app-beta-ios.preview'],
    subject: automatedText['automatic-emails-native-app-beta-ios.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-native-app-beta-ios.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-native-app-beta-ios.block-7'],
        href: '{{ ios_beta_app_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-8'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-9'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-native-app-beta-ios.block-10'],
        href: '{{ native_app_repo_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-11'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-native-app-beta-ios.block-12'],
        href: '{{ native_app_bug_report_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-native-app-beta-ios.block-13'],
      },
      {
        type: ContentTypes.Link,
        text: 'Zum Support-Chat',
        href: '{{ messages_url }}',
      },
    ],
  },
  'automatic-emails-u001': {
    id: 'automatic-emails-u001',
    label: 'u001 - Verify email',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u001.preview'],
    subject: automatedText['automatic-emails-u001.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u001.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u001.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u001.block-3'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u001.block-4'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u001.block-5'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u001.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u001.block-7'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u001.block-8'],
      },
      {
        type: ContentTypes.Code,
        text: BackendVars.verificationCode,
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u001.block-9'],
        href: BackendVars.confirmationUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u001.block-10'],
      },
    ],
  },
  'automatic-emails-u012': {
    id: 'automatic-emails-u012',
    label: 'u012 - User Form Reminder 1',
    category_id: EmailCategories.Automated,
    subject: automatedText['automatic-emails-u012.subject'],
    preview: automatedText['automatic-emails-u012.preview'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u012.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u012.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u012.block-3'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u012.block-4'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u012.block-5'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u012.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u012.block-7'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u012.block-8'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u012.block-9'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u012.block-10'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u012.block-11'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u012.block-12'],
        href: BackendVars.userFormUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u012.block-13'],
      },
    ],
  },
  'automatic-emails-u023l': {
    id: 'automatic-emails-u023l',
    label: 'u023l - Onboarding Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u023l.preview'],
    subject: automatedText['automatic-emails-u023l.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u023l.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023l.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023l.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023l.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u023l.block-6'],
        href: '{{ prematching_call_booking_link }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023l.block-5'],
      },
    ],
  },
  'automatic-emails-u023v': {
    id: 'automatic-emails-u023v',
    label: 'u023v - Onboarding Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u023v.preview'],
    subject: automatedText['automatic-emails-u023v.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u023v.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-5'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u023v.block-6'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u023v.block-7'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u023v.block-8'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-9'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u023v.block-10'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-11'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u023v.block-12'],
        href: '{{ prematching_call_booking_link }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-13'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u023v.block-14'],
        href: '{{ self_onboarding_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u023v.block-15'],
      },
    ],
  },
  'automatic-emails-u024l': {
    id: 'automatic-emails-u024l',
    label: 'u024l - Onboarding Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u024l.preview'],
    subject: automatedText['automatic-emails-u024l.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u024l.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024l.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024l.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024l.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024l.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u024l.block-6'],
        href: '{{ prematching_call_booking_link }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024l.block-7'],
      },
    ],
  },
  'automatic-emails-u024v': {
    id: 'automatic-emails-u024v',
    label: 'u024v - Onboarding Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u024v.preview'],
    subject: automatedText['automatic-emails-u024v.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u024v.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024v.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024v.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024v.block-4'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u024v.block-5'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u024v.block-6'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u024v.block-7'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024v.block-8'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024v.block-9'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u024v.block-10'],
        href: '{{ self_onboarding_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024v.block-11'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u024v.block-12'],
        href: '{{ prematching_call_booking_link }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u024v.block-13'],
      },
    ],
  },
  'automatic-emails-u025': {
    id: 'automatic-emails-u025',
    label: 'u025 - Onboarding Reminder',
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
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u025.block-6'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u025.block-7'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u025.block-8'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u025.block-9'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u025.block-10'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u025.block-11'],
        href: '{{ self_onboarding_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u025.block-12'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u025.block-13'],
        href: '{{ prematching_call_booking_link }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u025.block-14'],
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
        text: automatedText['automatic-emails-u044.block-8'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-u044.ps-link-label'],
        href: '{{ prematching_call_booking_link }}',
      },
    ],
  },
  'automatic-emails-u053l': {
    id: 'automatic-emails-u053l',
    label: 'u053l - Onboarding No-Show Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u053l.preview'],
    subject: automatedText['automatic-emails-u053l.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u053l.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053l.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053l.block-3'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053l.block-4'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053l.block-5'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053l.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053l.block-7'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053l.block-8'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u053l.block-9'],
        href: '{{ prematching_call_booking_link }}',
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053l.block-10'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053l.block-11'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053l.block-12'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053l.block-13'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053l.block-14'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053l.block-15'],
      },
    ],
  },
  'automatic-emails-u053v': {
    id: 'automatic-emails-u053v',
    label: 'u053v - Onboarding No-Show Reminder',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u053v.preview'],
    subject: automatedText['automatic-emails-u053v.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u053v.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053v.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053v.block-3'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053v.block-4'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053v.block-5'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053v.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053v.block-7'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053v.block-8'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053v.block-9'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053v.block-10'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u053v.block-11'],
        href: '{{ prematching_call_booking_link }}',
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053v.block-12'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053v.block-13'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u053v.block-14'],
        href: '{{ self_onboarding_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u053v.block-15'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u053v.block-16'],
      },
    ],
  },
  'automatic-emails-u071': {
    id: 'automatic-emails-u071',
    label: 'u071 - Onboarding completed',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u071.preview'],
    subject: automatedText['automatic-emails-u071.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u071.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u071.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u071.block-3'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u071.block-4'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u071.block-5'],
      },
      {
        type: ContentTypes.Sentence,
        text: automatedText['automatic-emails-u071.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u071.block-7'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u071.block-8'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-u071.block-9'],
        href: '{{ group_calls_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u071.block-10'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u071.block-11'],
      },
      {
        type: ContentTypes.Link,
        text: automatedText['automatic-emails-u071.block-12'],
        href: '{{ newsletter_subscribe_url }}',
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
  'automatic-emails-u083': {
    id: 'automatic-emails-u083',
    label: 'U083 - Availability Reminder 2',
    category_id: EmailCategories.Automated,
    preview: automatedText['automatic-emails-u083.preview'],
    subject: automatedText['automatic-emails-u083.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['automatic-emails-u083.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u083.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u083.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u083.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u083.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u083.block-6'],
      },
      {
        type: ContentTypes.Button,
        text: automatedText['automatic-emails-u083.block-7'],
        href: '{{ availability_url }}',
      },
      {
        type: ContentTypes.Paragraph,
        text: automatedText['automatic-emails-u083.block-8'],
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
  'new-match': {
    id: 'new-match',
    label: 'New Match',
    category_id: EmailCategories.Automated,
    preview: automatedText['new-match.preview'],
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
  'new-match-engage': {
    id: 'new-match-engage',
    label: 'new-match-engage',
    category_id: EmailCategories.Automated,
    preview: automatedText['engage-new-match.preview'],
    subject: automatedText['engage-new-match.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: automatedText['engage-new-match.block-1'],
      },
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
