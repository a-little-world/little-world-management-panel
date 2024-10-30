import { ContentTypes } from '../Builder';
import { BackendVars } from '../shared/constants';
import communityText from './text/community.json';

const communityEmails = {
  'community-get-together': {
    id: 'community-get-together',
    label: 'Community Monthly Get Together',
    preview: communityText['community-get-together.preview'],
    subject: communityText['community-get-together.subject'],
    content: [
      {
        type: ContentTypes.Title,
        text: communityText['community-get-together.block-1'],
      },
      {
        type: ContentTypes.Paragraph,
        text: communityText['community-get-together.block-2'],
      },
      {
        type: ContentTypes.Paragraph,
        text: communityText['community-get-together.block-3'],
      },
      {
        type: ContentTypes.Paragraph,
        text: communityText['community-get-together.block-4'],
      },
      {
        type: ContentTypes.Paragraph,
        text: communityText['community-get-together.block-5'],
      },
      {
        type: ContentTypes.Button,
        text: communityText['community-get-together.block-6'],
        href: BackendVars.linkUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: communityText['community-get-together.block-7'],
      },
    ],
  },
};

export default communityEmails;
