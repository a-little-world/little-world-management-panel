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

/*
 * This allowes to register admin actions
 * For 'schema' you may specify any open api schema
 * -> it will be used to generate the admin form default inputs are always to users
 * These defaults can be used to populate the schema default
 * e.g.: allowing to dynamicly change the users selected for matching
 *
 * schema per default only uses 2 users as input ( for now )
 * but the matcher may add more input params in the form
 * -> the api schema can be downlaeded at `s1.littleworld-test.com/api/schema`
 */
export const ADMIN_ACTIONS = {
  notifyConnectedUserWebsocket: {
    path: '/api/admin/user/notify_websocket/',
    text: 'Notify connected user via websocket',
    schema: (u1, u2) => {
      return {
        type: 'object',
        properties: {
          usr_hash: {
            type: 'string',
            maxLength: 255,
            default: u1?.user.hash,
          },
        },
        required: ['partner_hash', 'usr_hash'],
      };
    },
  },
  makeMatch: {
    path: '/api/admin/user/match/',
    text: 'Make match',
    schema: (u1, u2) => {
      return {
        type: 'object',
        properties: {
          user1: {
            type: 'string',
            default: u1?.user.hash,
          },
          user2: {
            type: 'string',
            default: u2?.user.hash,
          },
          lookup: {
            type: 'string',
            default: 'hash',
          },
          force: {
            type: 'boolean',
            default: false,
          },
        },
        required: ['user1', 'user2'],
      };
    },
    parseRes: (res, err) => {
      return res;
    },
  },
  unmatch: {
    path: '/api/admin/user/unmatch/',
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
