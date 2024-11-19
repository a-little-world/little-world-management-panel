import footerBannerImage from '../../assets/email-footer-banner.png';
import Logo from '../../assets/logoWithText.png';
import PatenmatchBanner from '../../assets/patenmatchBanner.png';
import PatenmatchLogo from '../../assets/patenmatchLogo.png';

export const BackendVars = {
  date: '{{ date }}',
  firstName: '{{ first_name }}',
  secondName: '{{ second_name }}',
  email: '{{ email }}',
  partnerName: '{{ partner_first_name }}',
  verificationCode: '{{ verification_code }}',

  // urls
  acceptMatchUrl: '{{ accept_match_url }}',
  passwordResetUrl: '{{ reset_password_url }}',
  confirmContactUrl: '{{ confirm_in_contact_url }}',
  messagesUrl: '{{ messages_url }}',
  profileUrlUrl: '{{ profile_link_url }}',
  partnerProfileUrl: '{{ partner_profile_url }}',
  restartSearchUrl: '{{ restart_search_url }}',
  confirmationUrl: '{{ verification_url }}',
  userFormUrl: '{{ user_form_url }}',
  linkUrl: '{{ link_url }}',
  unsubscribeUrl: '{{ unsubscribe_url }}',
};

export const THEMES = {
  little_world: {
    contactUrl: 'https://home.little-world.com/kontakt',
    from: 'Dein Little World Team',
    footerText: 'A Little World gUG, little-world.com',
    footerBannerImage,
    logo: Logo,
    logoAlt: 'Little World logo',
    logoHeight: 40.35,
    logoWidth: 144,
    socials: {
      instagram: 'https://www.instagram.com/littleworld_de',
      facebook: 'https://www.facebook.com/LittleWorld.NonProfit',
      linkedin: 'https://www.linkedin.com/company/little-world/',
    },
  },
  patenmatch: {
    contactUrl: 'mailto:oliver.berlin@patenmatch.de',
    from: 'Dein Patenmatch Team',
    footerText:
      'Patenmatch.de is provided by A Little World gUG, patenmatch.de',
    footerBannerImage: PatenmatchBanner,
    logo: PatenmatchLogo,
    logoAlt: 'Patenmatch logo',
    logoHeight: null,
    logoWidth: 176,
  },
};

export enum EmailCategories {
  Automated = 'automated',
  Community = 'community',
  Dynamic = 'dynamic',
  Marketing = 'marketing',
  Newsletter = 'newsletter',
  Partnerships = 'partnerships',
}

export const EMAIL_CATEGORIES = [
  EmailCategories.Automated,
  EmailCategories.Dynamic,
  EmailCategories.Community,
  EmailCategories.Newsletter,
  EmailCategories.Marketing,
];

export const UNSUBSCRIBABLE_CATEGORIES = [
  EmailCategories.Community,
  EmailCategories.Newsletter,
  EmailCategories.Marketing,
];

export const getUnsubscribeUrl = (category: EmailCategories) =>
  UNSUBSCRIBABLE_CATEGORIES.includes(category)
    ? BackendVars.unsubscribeUrl
    : undefined;
