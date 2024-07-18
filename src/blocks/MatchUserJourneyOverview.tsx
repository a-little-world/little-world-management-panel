import React from 'react';
import useSWR from "swr"
import { Link } from '@a-little-world/little-world-design-system';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../shadcnui/ui/hover-card";
import { cratePostFetcher } from '../store';

const UserJourneyBuckets = [{
    "id": "sign-up",
    "title": "Sign-Up",
    "sub_buckets": [{
        "id": "journey_v2__user_created",
        "title": "User Created",
        "description": "User was created, but still has to verify mail, fill form and have a prematching call"
    }, {
        "id": "journey_v2__email_verified",
        "title": "Email Verified",
        "description": "User has verified email, but still has to fill form and have a prematching call"
    }, {
        "id": "journey_v2__user_form_completed",
        "title": "User Form Completed",
        "description": "User has filled form, but still has to have a prematching call"
    }, {
        "id": "journey_v2__booked_onboarding_call",
        "title": "Booked Onboarding Call",
        "description": "User has filled form and booked onboarding call"
    }, {
        "id": "journey_v2__first_search",
        "title": "First Search",
        "description": "User is doing first search i.e.: has no 'non-support' match"
    }, {
        "id": "journey_v2__first_search_learners",
        "title": "Learners First Search",
        "description": "User is doing first search i.e.: has no 'non-support' match"
    }, {
        "id": "journey_v2__first_search_volunteers",
        "title": "Volunteers First Search",
        "description": "User is doing first search i.e.: has no 'non-support' match"
    }]
}, {
    "id": "active-users",
    "title": "Active Users",
    "sub_buckets": [{
        "id": "journey_v2__user_searching_again",
        "title": "User Searching Again",
        "description": "User is searching and has at least one match"
    }, {
        "id": "journey_v2__pre_matching",
        "title": "Pre-Matching",
        "description": "User has `Pre-Matching` or `Kickoff-Matching` Match."
    }, {
        "id": "journey_v2__match_takeoff",
        "title": "Match Takeoff",
        "description": "User has `Pre-Matching` or `Kickoff-Matching` Match."
    }, {
        "id": "journey_v2__active_matching",
        "title": "Active Matching",
        "description": "User has and confirst and ongoing match, that is still having video calls or sending messages"
    }]
}, {
    "id": "inactive-users",
    "title": "Inactive Users",
    "sub_buckets": [{
        "id": "journey_v2__never_active",
        "title": "Never Active",
        "description": "Didn't ever become active"
    }, {
        "id": "journey_v2__no_show",
        "title": "No Show",
        "description": "Didn't show up to onboarding call"
    }, {
        "id": "journey_v2__user_ghosted",
        "title": "User Ghosted",
        "description": "User has matching in [3.G] 'ghosted' his match"
    }, {
        "id": "journey_v2__no_confirm",
        "title": "No Confirm",
        "description": "Learner that has matching in 'Never Confirmed'"
    }, {
        "id": "journey_v2__happy_inactive",
        "title": "Happy Inactive",
        "description": "Not searching, 1 or more matches at least one match in 'Completed Matching'"
    }, {
        "id": "journey_v2__too_low_german_level",
        "title": "Too Low German Level",
        "description": "User never active, but was flagged with a 'state.to_low_german_level=True'"
    }, {
        "id": "journey_v2__unmatched",
        "title": "Unmatched",
        "description": "First-search for over XX days, we failed to match the user at all"
    }, {
        "id": "journey_v2__gave_up_searching",
        "title": "Gave Up Searching",
        "description": "User that's `searching=False` and has 0 matches"
    }]
}];

export function HoverableLiveListDescription({ title, description, linkTo, count = -1 }) {
    return <HoverCard>
        <HoverCardTrigger>
            <Link to={linkTo}>{title}</Link> ( {count} ),{" "}
        </HoverCardTrigger>
        <HoverCardContent>
            {description}
        </HoverCardContent>
    </HoverCard>
}

export function MatchUserJourneyOverview() {

    const allBuckets = UserJourneyBuckets.flatMap((bucket) => bucket.sub_buckets);
    const allBucketIds = allBuckets.map((bucket) => bucket.id);

    const {
        mutate,
        error,
        data: userListCounts,
        isLoading,
    } = useSWR("/api/matching/users/statistics/user_journey_buckets/", cratePostFetcher({
        selected_filters: allBucketIds,
    }), {});

    console.log("UL Counts", userListCounts);

    return (
        <div className="flex flex-col h-full w-full">
            <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
                Little World Statistics & User Journey Overview
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                All the numbers in these overviews <span className="font-semibold">are live statistics</span> and are <span className="font-semibold">filtered down to the current users access</span>.
            </p>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                The User Journey
            </h2>
            <blockquote className="mt-6 border-l-2 pl-6 italic">
                ⚠️ The User Journey V2 is still in development, we are aware of some wrong list and will report when there are ready for user testing
            </blockquote>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We currently define our user journey in the following buckets:
            </p>
            <ul className="scroll-m-20 list-disc list-inside">{
                UserJourneyBuckets.map((bucket) => {
                    return <li key={bucket.id}>
                        <span className="text-xl font-semibold">{bucket.title}:</span> - {bucket.sub_buckets.map((sub_bucket) => {
                            const count = userListCounts?.find((item) => item.name === sub_bucket.id)?.count ?? -1;
                            return <>{" "} <HoverableLiveListDescription title={sub_bucket.title} description={sub_bucket.description} linkTo={`/matches/users/?list=${sub_bucket.id}`} count={count} /></>
                        })}
                    </li>
                })}
            </ul>
            <h2 className="pt-2 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                The Match Journey
            </h2>
        </div >
    );
}