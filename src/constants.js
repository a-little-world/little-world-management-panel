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
  currentlySearching: {
    text: 'All searching',
    filters: ['state.matching_state:is:searching'],
  },
  authenticatedEmail: {
    text: 'Has authenticated email',
    filters: ['state.email_authenticated:is:True'],
  },
  userFormCompleted: {
    text: 'Has completed user form',
    filters: ['state.user_form_state:is:filled'],
  },
  markedLegit: {
    text: 'Was marked as legit',
    filters: ['state.user_category:is:legit'],
  },
  isVolunteer: {
    text: 'Is volunteer',
    filters: ['profile.user_type:is:volunteer'],
  },
  isLearner: {
    text: 'Is learner',
    filters: ['profile.user_type:is:learner'],
  },
  usesAvatar: {
    text: 'Uses avatar',
    filters: ['profile.image_type:is:avatar'],
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
  viewEmailTemplates: {
    path: '/api/admin/email/templates/',
    method: 'GET',
    text: 'View email templates and inputs',
    schema: (u1, u2) => {
      return {
        type: 'object',
        properties: {},
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
          send_email: {
            type: 'boolean',
            default: true,
          },
          send_message: {
            type: 'boolean',
            default: true,
          },
          send_notification: {
            type: 'boolean',
            default: true,
          },
        },
        required: ['user1', 'user2'],
      };
    },
  },
  updateMatchingScore: {
    text: 'Request Score Update',
    path: '/api/admin/user/update_score/',
    schema: (u1, u2) => {
      return {
        type: 'object',
        properties: {
          user: {
            type: 'string',
            default: u1?.user.hash,
          },
          lookup: {
            type: 'string',
            default: 'hash',
          },
        },
      };
    },
  },
  unmatch: {
    text: 'Unmatch users',
    path: '/api/admin/user/unmatch/',
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
      };
    },
  },
  writeRawTemplateMail: {
    path: '/api/admin/email/templates/encode/',
    text: 'Write template mail',
    transformData: data => {
      console.log('TRANSFORMING DAAT', data);
      return {
        params: data,
        template: 'raw',
      };
    },
    schema: (u1, u2) => {
      return {
        type: 'object',
        properties: {
          subject_header_text: {
            type: 'string',
            default: '',
          },
          greeting: {
            type: 'string',
            default: '',
          },
          content_start_text: {
            type: 'string',
            default: '',
          },
          content_body_text: {
            type: 'string',
            default: '',
          },
          link_box_text: {
            type: 'string',
            default: '',
          },
          button_text: {
            type: 'string',
            default: '',
          },
          button_link: {
            type: 'string',
            default: '',
          },
          below_link_text: {
            type: 'string',
            default: '',
          },
          footer_text: {
            type: 'string',
            default: '',
          },
          goodbye: {
            type: 'string',
            default: '',
          },
          goodbye_name: {
            type: 'string',
            default: '',
          },
        },
      };
    },
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
