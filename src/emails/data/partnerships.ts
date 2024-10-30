import { ContentTypes } from '../Builder';
import { BackendVars } from '../shared/constants';
import partnershipsText from './text/partnerships.json';

const partnershipsEmails = {
  'babbel-subscription-winner': {
    id: 'babbel-subscription-winner',
    label: 'Babbel Subscription Winner',
    preview: partnershipsText['babbel-subscription-winner.preview'],
    subject: partnershipsText['babbel-subscription-winner.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: partnershipsText['babbel-subscription-winner.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-subscription-winner.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-subscription-winner.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-subscription-winner.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-subscription-winner.block-5'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-subscription-winner.block-6'],
      },
    ],
  },
  'babbel-precode-survey': {
    id: 'babbel-precode-survey',
    label: 'Babbel Precode Survey',
    preview: partnershipsText['babbel-precode-survey.preview'],
    subject: partnershipsText['babbel-precode-survey.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: partnershipsText['babbel-precode-survey.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-precode-survey.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-precode-survey.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-precode-survey.block-4'],
      },
      {
        type: ContentTypes.Button,
        text: partnershipsText['babbel-precode-survey.block-5'],
        href: BackendVars.linkUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-precode-survey.block-6'],
      },
      {
        type: ContentTypes.Paragraph,
        text: partnershipsText['babbel-precode-survey.block-7'],
      },
    ],
  },
};

export default partnershipsEmails;
