import { ContentTypes } from '../Builder';
import { BackendVars } from '../templates/backendVars';

const communityEmails = {
  'community-get-together': {
    id: 'community-get-together',
    label: 'Community Monthly Get Together',
    preview: 'Wir laden dich zu unserem Community Get-Together ein!',
    content: [
      {
        type: ContentTypes.Title,
        text: 'Wir laden dich zu unserem Community Get-Together ein!',
      },
      {
        type: ContentTypes.Paragraph,
        text: `Hallo ${BackendVars.firstName},`,
      },
      {
        type: ContentTypes.Paragraph,
        text: `möchtest du dich am Donnerstag, den ${BackendVars.date} unserem Get-Together anschließen? Als wertvolles Mitglied unserer Little World Community möchten wir mit dir einige Updates teilen und gemeinsam feiern, wie unsere Community wächst.`,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Mit mittlerweile über 3.000 Mitgliedern bei Little World trägst du maßgeblich dazu bei, eine inklusive Gesellschaft zu gestalten. Deine Investition von Zeit und Engagement, um Gespräche zu führen und andere zu unterstützen, ist von unschätzbarem Wert, damit wir uns alle wohl und geschätzt fühlen.',
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Gemeinsam haben wir bereits über 160 multikulturelle Gespräche in 2024 geführt, mit über 120 wirkungsvollen Stunden! Als Community zeigen wir, wie aus demokratischen Werten konkrete Taten werden. Im Call möchten wir teilen, wo wir heute als gemeinnütziges Start-up dank deiner Mitwirkung stehen und was wir für 2024 vorhaben, um gemeinsam weiter zu wachsen. Wir sind sehr gespannt darauf, deine Ideen und deine Erfahrungen zu hören. Denn nur durch deine wertvolle Mitwirkung können wir Little World gemeinsam noch besser machen.',
      },
      {
        type: ContentTypes.Button,
        text: 'Zum Call beitreten',
        href: BackendVars.linkUrl,
      },
      {
        type: ContentTypes.Paragraph,
        text: 'Wir freuen uns schon riesig auf dich und deinen Beitrag!',
      },
    ],
  },
};

export default communityEmails;
