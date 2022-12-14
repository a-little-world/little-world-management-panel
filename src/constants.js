/*
 * TODO: these should be set by external environment variables
 */
export const baseUrl = 'http://localhost:3333';
export const baseLogin = {
  username: 'admin@little-world.com',
  passoword: 'Admin123',
};

/*
  @tbscode TODO: disussion
  There are two kinds of filters:
  - user filters: They filter the list of users that are shown on the admin page
      > e.g.: all learners, all people looking for a match
  - profile filter: They filter which fields from the profile should be displayed
      > e.g.: telephone, email, profile_image
*/
export const USER_FILTERS = {
  allUsersSearching: {
    text: 'All searching',
    filters: ['state.matching_state:is:1'],
  },
  allUsersSearchingThatAreLearners: {
    text: 'All learners that are searching',
    filters: ['state.matching_state:is:1', 'profile.learner:is:1'], // This is no-one user currently
  },
  allLearners: {
    text: 'All learners',
    filters: ['profile.learner:is:1'],
  },
  allVolunteers: {
    text: 'All Volunteers',
    filters: ['profile.learner:is:0'],
  },
};

export const ADMIN_ACTIONS = {
  notifyConnectedUserWebsocket: {
    path: '/api/admin/notify_websocket/',
    text: 'Notify connected user via websocket',
  },
  makeMatch: {
    path: '/api/admin/make_match/',
    text: 'Make match',
  },
};

export const DUMMY_USER_FILTERS = ['Learners', 'Local Only', 'Telephone Only'];

export const ADDITIONAL_USER_FIELDS = [
  'additional_interests',
  'language_level',
  'language_skill_description',
  'partner_sex',
  'partner_location',
  'conversation_medium',
];
