export const userJourneyBucketsV4 = [
  {
    id: 'sign-up',
    title: 'Sign-Up',
    sub_buckets: [
      {
        id: 'journey_v2__user_created',
        title: 'User Created',
        description:
          'User was created, but still has to verify mail, fill form and have a prematching call',
      },
      {
        id: 'journey_v2__email_verified',
        title: 'Email Verified',
        description:
          'User has verified email, but still has to fill form and have a prematching call',
      },
      {
        id: 'journey_v2__user_form_completed',
        title: 'Form Complete, No-Call Booked',
        description:
          'User has filled form, but still has to have a prematching call',
      },
      {
        id: 'journey_v2__booked_onboarding_call',
        title: 'Onboarding started (booked call)',
        description:
          'User has filled form and has a future prematching / onboarding call booked',
      },
      {
        id: 'journey_v2__self_onboarding_started',
        title: 'Onboarding started (self-onboarding)',
        description:
          'Self-onboarding started but not completed; no future booked call',
      },
      {
        id: 'journey_v2__too_low_german_level',
        title: 'Too Low German Level',
        description:
          "User never active, but was flagged with a 'state.to_low_german_level=True'",
      },
      {
        id: 'journey_v2__no_show',
        title: 'No Show',
        description: "Didn't show up to onboarding call",
      },
    ],
  },
  {
    id: 'active-users',
    title: 'Active-Users',
    sub_buckets: [
      {
        id: 'journey_v2__pre_matching',
        title: 'Proposed-Matching',
        description: 'User has proposed or unviewed matches',
      },
      {
        id: 'journey_v2__match_takeoff',
        title: 'Match Takeoff',
        description: 'User has `Pre-Matching` or `Kickoff-Matching` Match.',
      },
      {
        id: 'journey_v2__ongoing_non_completed_match',
        title: 'Ongoing Non-Completed Matching',
        description:
          'User has and confirst and ongoing match, that is still having video calls or sending messages',
      },
      {
        id: 'journey_v2__first_search_v2',
        title: 'Searching No-Match',
        description:
          "User is doing first search i.e.: has no 'non-support' match",
      },
    ],
  },
  {
    id: 'success-users',
    title: 'Success-Users',
    sub_buckets: [
      {
        id: 'journey_v2__happy_inactive',
        title: 'Match Completed (& No Active Matching)',
        description: 'User has completed a match',
      },
      {
        id: 'journey_v2__happy_active',
        title: 'Match Completed Free Play',
        description: 'User Has complted a match but is still in contact',
      },
    ],
  },
  {
    id: 'failed-users',
    title: 'Failed-Users',
    sub_buckets: [
      {
        id: 'journey_v2__failed_matching',
        title: 'Failed Matching',
        description: 'User with only failed matchings',
      },
      {
        id: 'journey_v2__gave_up_searching',
        title: 'Gave Up Searching',
        description: "User that's `searching=False` and has 0 matches",
      },
      {
        id: 'journey_v2__user_deleted',
        title: 'User Was Deleted',
        description: 'User has left the platform',
      },
      {
        id: 'journey_v2__marked_unresponsive',
        title: 'User Was Marked as Unresponsive',
        description: 'User was marked as unresponsive',
      },
    ],
  },
];

export const matchJourneyBucketsV4 = [
  {
    id: 'pre-matching',
    title: 'Pre-Matching',
    sub_buckets: [
      {
        id: 'match_journey_v2__proposed_matches',
        title: 'Proposed Matches',
        description:
          'Matches that are proposed to users based on their preferences.',
      },
      {
        id: 'match_journey_v2__expired_proposals',
        title: 'Expired Proposals',
        description:
          'Matches that are proposed but not confirmed within a specified number of days.',
      },
      {
        id: 'match_journey_v2__unviewed',
        title: 'Unviewed',
        description:
          'Matches that are active and not yet confirmed by both users.',
      },
      {
        id: 'match_journey_v2__one_user_viewed',
        title: 'One User Viewed',
        description:
          'Matches that are active, not yet confirmed by both users, but confirmed by at least one user.',
      },
      {
        id: 'match_journey_v2__confirmed_no_contact',
        title: 'Confirmed No Contact',
        description:
          'Matches that are active, confirmed by both users, no unmatch reports, and neither user has sent messages or participated in video calls at all.',
      },
      {
        id: 'match_journey_v2__confirmed_single_party_contact',
        title: 'Confirmed Single Party Contact',
        description:
          'Matches that are active, confirmed, with one user having reported the unmatch or only one user having contacted the other.',
      },
    ],
  },
  {
    id: 'ongoing-matching',
    title: 'Ongoing-Matching',
    sub_buckets: [
      {
        id: 'match_journey_v2__first_contact',
        title: 'First Contact',
        description:
          'Matches where both users have either participated in the same video call or sent at least one message to each other.',
      },
      {
        id: 'match_journey_v2__match_ongoing',
        title: 'Match Ongoing',
        description:
          "Matches where users have exchanged multiple messages or video calls, their last message or video call is less than 14 days ago, and the match isn't older than the desired match duration.",
      },
    ],
  },
  {
    id: 'finished-matching',
    title: 'Finished-Matching',
    sub_buckets: [
      {
        id: 'EXTRA__suggestion_match_completed_on_plattform',
        title: 'Completed Match',
        description:
          'Users with a non-support match that reached 8 on-platform video-call units.',
      },
      {
        id: 'EXTRA__suggestion_match_completed_off_plattform',
        title: 'Completed Match Off Platform',
        description: 'Users with a match marked as completed off platform.',
      },
      {
        id: 'match_journey_v2__match_free_play',
        title: 'Match Free Play',
        description:
          "Matches that are over 10 weeks old and still active, also ensuring the match is still 'ongoing'.",
      },
    ],
  },
  {
    id: 'failed-matching',
    title: 'Failed-Matching',
    sub_buckets: [
      {
        id: 'match_journey_v2__never_confirmed',
        title: 'Never Confirmed',
        description:
          'Matches older than a specified number of days but still unconfirmed.',
      },
      {
        id: 'match_journey_v2__no_contact',
        title: 'No Contact',
        description:
          'Matches that are confirmed but without contact and older than a specified number of days.',
      },
      {
        id: 'match_journey_v2__user_ghosted',
        title: 'User Ghosted',
        description:
          'Matches that are confirmed, have a single party contact, and are older than a specified number of days.',
      },
      {
        id: 'match_journey_v2__contact_stopped',
        title: 'Contact Stopped',
        description:
          'Matches older than the desired match duration where users interacted but their interaction stopped before the desired duration.',
      },
      {
        id: 'match_journey_v2__reported_or_removed',
        title: 'Reported or unmatched',
        description: 'Matches that have been removed/reported or unmatched',
      },
    ],
  },
];

export const userJourneyBuckets = [
  {
    id: 'sign-up',
    title: 'Sign-Up',
    sub_buckets: [
      {
        id: 'journey_v2__user_created',
        title: 'User Created',
        description:
          'User was created, but still has to verify mail, fill form and have a prematching call',
      },
      {
        id: 'journey_v2__email_verified',
        title: 'Email Verified',
        description:
          'User has verified email, but still has to fill form and have a prematching call',
      },
      {
        id: 'journey_v2__user_form_completed',
        title: 'Form Complete, No-Call Booked',
        description:
          'User has filled form, but still has to have a prematching call',
      },
      {
        id: 'journey_v2__booked_onboarding_call',
        title: 'Onboarding started (booked call)',
        description:
          'User has filled form and has a future prematching / onboarding call booked',
      },
      {
        id: 'journey_v2__self_onboarding_started',
        title: 'Onboarding started (self-onboarding)',
        description:
          'Self-service onboarding started but not completed; no future booked call',
      },
      {
        id: 'journey_v2__first_search',
        title: 'First Search',
        description:
          "User is doing first search i.e.: has no 'non-support' match",
      },
      {
        id: 'journey_v2__first_search_learners',
        title: 'Learners First Search',
        description:
          "User is doing first search i.e.: has no 'non-support' match",
      },
      {
        id: 'journey_v2__first_search_volunteers',
        title: 'Volunteers First Search',
        description:
          "User is doing first search i.e.: has no 'non-support' match",
      },
    ],
  },
  {
    id: 'active-users',
    title: 'Active-Users',
    sub_buckets: [
      {
        id: 'journey_v2__user_searching_again',
        title: 'User Searching Again',
        description: 'User is searching and has at least one match',
      },
      {
        id: 'journey_v2__pre_matching',
        title: 'Pre-Matching',
        description: 'User has `Pre-Matching` or `Kickoff-Matching` Match.',
      },
      {
        id: 'journey_v2__match_takeoff',
        title: 'Match Takeoff',
        description: 'User has `Pre-Matching` or `Kickoff-Matching` Match.',
      },
      {
        id: 'journey_v2__active_matching',
        title: 'Active Matching',
        description:
          'User has and confirst and ongoing match, that is still having video calls or sending messages',
      },
    ],
  },
  {
    id: 'inactive-users',
    title: 'Inactive-Users',
    sub_buckets: [
      {
        id: 'journey_v2__never_active',
        title: 'Never Active',
        description: "Didn't ever become active",
      },
      {
        id: 'journey_v2__no_show',
        title: 'No Show',
        description: "Didn't show up to onboarding call",
      },
      {
        id: 'journey_v2__no_confirm',
        title: 'No Confirm',
        description: "Learner that has matching in 'Never Confirmed'",
      },
      {
        id: 'journey_v2__happy_inactive',
        title: 'Happy Inactive',
        description:
          "Not searching, 1 or more matches at least one match in 'Completed Matching'",
      },
      {
        id: 'journey_v2__unmatched',
        title: 'Unmatched',
        description:
          'First-search for over XX days, we failed to match the user at all',
      },
      {
        id: 'journey_v2__gave_up_searching',
        title: 'Gave Up Searching',
        description: "User that's `searching=False` and has 0 matches",
      },
    ],
  },
  {
    id: 'past-users',
    title: 'Past-Users',
    sub_buckets: [
      {
        id: 'journey_v2__user_deleted',
        title: 'User Was Deleted',
        description: 'User has left the platform',
      },
    ],
  },
];
