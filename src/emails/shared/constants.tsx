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
