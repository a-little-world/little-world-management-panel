import React from 'react';
import useSWR from "swr"
import { Link } from '@a-little-world/little-world-design-system';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../shadcnui/ui/hover-card";
import { cratePostFetcher } from '../store';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

const spinnerVariants =
    "w-[10px] h-[10px] border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin";

const LoadingSpinner = React.forwardRef((props, ref) => {
    const { className = "", ...rest } = props;
    const size = "1em";
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("animate-spin", className)}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
});


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
    "title": "Active-Users",
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
    "title": "Inactive-Users",
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
}, {
    "id": "past-users",
    "title": "Past-Users",
    "sub_buckets": [{
        "id": "journey_v2__user_deleted",
        "title": "User Was Deleted",
        "description": "User has left the platform"
    }]
}];

const MatchJourneyBuckets = [{
    "id": "pre-matching",
    "title": "Pre-Matching",
    "sub_buckets": [{
        "id": "match_journey_v2__unviewed",
        "title": "Unviewed",
        "description": "Matches that are active and not yet confirmed by both users."
    }, {
        "id": "match_journey_v2__one_user_viewed",
        "title": "One User Viewed",
        "description": "Matches that are active, not yet confirmed by both users, but confirmed by at least one user."
    }, {
        "id": "match_journey_v2__confirmed_no_contact",
        "title": "Confirmed No Contact",
        "description": "Matches that are active, confirmed by both users, no unmatch reports, and neither user has sent messages or participated in video calls at all."
    }, {
        "id": "match_journey_v2__confirmed_single_party_contact",
        "title": "Confirmed Single Party Contact",
        "description": "Matches that are active, confirmed, with one user having reported the unmatch or only one user having contacted the other."
    }]
}, {
    "id": "ongoing-matching",
    "title": "Ongoing-Matching",
    "sub_buckets": [{
        "id": "match_journey_v2__first_contact",
        "title": "First Contact",
        "description": "Matches where both users have either participated in the same video call or sent at least one message to each other."
    }, {
        "id": "match_journey_v2__match_ongoing",
        "title": "Match Ongoing",
        "description": "Matches where users have exchanged multiple messages or video calls, their last message or video call is less than 14 days ago, and the match isn't older than the desired match duration."
    }, {
        "id": "match_journey_v2__match_free_play",
        "title": "Match Free Play",
        "description": "Matches that are over 10 weeks old and still active, also ensuring the match is still 'ongoing'."
    }]
}, {
    "id": "finished-matching",
    "title": "Finished-Matching",
    "sub_buckets": [{
        "id": "match_journey_v2__completed_match",
        "title": "Completed Match",
        "description": "Matches that are over 10 weeks old, inactive, still in contact, and exchanged a desired number of messages and video calls."
    }]
}, {
    "id": "failed-matching",
    "title": "Failed-Matching",
    "sub_buckets": [
        {
            "id": "match_journey_v2__never_confirmed",
            "title": "Never Confirmed",
            "description": "Matches older than a specified number of days but still unconfirmed."
        },
        {
            "id": "match_journey_v2__no_contact",
            "title": "No Contact",
            "description": "Matches that are confirmed but without contact and older than a specified number of days."
        },
        {
            "id": "match_journey_v2__user_ghosted",
            "title": "User Ghosted",
            "description": "Matches that are confirmed, have a single party contact, and are older than a specified number of days."
        },
        {
            "id": "match_journey_v2__contact_stopped",
            "title": "Contact Stopped",
            "description": "Matches older than the desired match duration where users interacted but their interaction stopped before the desired duration."
        }
    ]
}
];

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus at sem pellentesque, mollis lorem non, maximus erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer rhoncus ex eu ornare condimentum. Phasellus tristique eget elit et dignissim. Pellentesque sed diam diam. Quisque magna nisl, congue nec tincidunt vitae, sodales ut justo. Vestibulum mattis arcu vitae sem scelerisque egestas. Fusce elementum blandit lacus vel tincidunt. Proin egestas felis nec dui consectetur, in lacinia diam tempor. Suspendisse varius erat at neque eleifend lacinia. Donec est justo, hendrerit eu orci in, elementum maximus ex. Vestibulum imperdiet, arcu id venenatis pulvinar, mauris ligula varius sem, eu varius velit risus ullamcorper sem. Aenean elementum id nibh ut pellentesque. Nulla lacinia ante et tempor pharetra. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque auctor elementum urna, sed interdum ipsum porttitor sed. Proin varius massa et velit hendrerit, sit amet rhoncus quam malesuada. Sed nec laoreet lacus. Suspendisse dictum congue purus id dignissim. Maecenas a feugiat diam. Nulla velit elit, euismod faucibus sem semper, rhoncus vestibulum enim. Morbi sit amet nisi id nunc lobortis feugiat id sed lectus. In condimentum mi quam, at commodo ante ultricies placerat. Morbi egestas a lorem a aliquam. Fusce vehicula, metus vel porttitor commodo, felis purus gravida mauris, eu aliquam arcu massa eget felis. Maecenas fringilla tellus arcu. Maecenas nec enim lobortis purus sagittis scelerisque. Praesent lobortis massa sit amet libero fermentum, eu bibendum mauris pulvinar. Suspendisse finibus auctor consequat. Fusce vitae rutrum purus. Vivamus vel tempor felis. Ut at purus at est rhoncus ullamcorper. Aenean malesuada augue eget est eleifend fermentum. Nulla magna nibh, hendrerit eu libero a, accumsan finibus neque. Proin non nunc ultricies, fringilla justo at, ornare odio. Nunc in diam posuere nibh pellentesque consequat non id velit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed faucibus, nisl sit amet varius tempus, dolor lacus porttitor dui, at tincidunt elit elit vel neque. Proin elit mi, placerat in volutpat quis, sodales at massa. Nunc nibh nunc, tincidunt eu justo quis, ullamcorper bibendum turpis. Praesent quis mi nisl. Curabitur fermentum, nisi quis congue porta, leo orci pellentesque urna, sit amet luctus neque elit et odio. Vestibulum sed porttitor ante. Duis in metus quis odio condimentum porttitor. Nulla ut gravida eros, quis consectetur justo. Nulla maximus velit id tortor venenatis aliquam. Sed scelerisque placerat rutrum. Vestibulum sit amet tincidunt mauris, eget dictum lorem. Nam dolor mauris, sollicitudin hendrerit mollis id, consequat id leo. Donec non ex dui. Vivamus pellentesque sem id euismod sodales. In tempus nisl sit amet est finibus luctus. In malesuada orci non rhoncus rutrum. Vivamus luctus enim non augue elementum, eu pulvinar tortor tincidunt. Etiam aliquet, quam vitae congue auctor, tortor dolor ornare quam, vitae vulputate quam arcu in arcu. Maecenas dictum velit vitae tempor dictum. "

export function HoverableLiveListDescription({ title, description, linkTo, count = -1, showCount = true }) {
    return <HoverCard>
        <HoverCardTrigger className="flex flex-row w-fit">
            <Link to={linkTo} className={"flex flex-row text-nowrap"}>{title}</Link> {showCount && <>{count === -1 ? <LoadingSpinner /> : count}</>},{" "}
        </HoverCardTrigger>
        <HoverCardContent>
            {description}
        </HoverCardContent>
    </HoverCard>
}

export function DynamicUserBucketsList({
    userListCounts,
}) {

    return <ul className="scroll-m-20 list-disc list-inside">{
        UserJourneyBuckets.map((bucket) => {
            return <li key={bucket.id} className="flex flex-row">
                <span className="flex flex-row text-xl font-semibold">{bucket.title}:</span> - {bucket.sub_buckets.map((sub_bucket) => {
                    const count = userListCounts?.find((item) => item.name === sub_bucket.id)?.count ?? -1;
                    return <>{" "}<HoverableLiveListDescription title={sub_bucket.title} description={sub_bucket.description} linkTo={`/users/?list=${sub_bucket.id}`} count={count} /></>
                })}
            </li>
        })}
    </ul>
}

export function DynamicMatchBucketsList({
    matchJourneyListCounts,
}) {


    console.log("MJ", matchJourneyListCounts);

    return <ul className="scroll-m-20 list-disc list-inside">{
        MatchJourneyBuckets.map((bucket) => {
            return <li key={bucket.id} className="flex flex-row">
                <span className="flex flex-row text-xl font-semibold">{bucket.title}:</span> - {bucket.sub_buckets.map((sub_bucket) => {
                    const count = matchJourneyListCounts?.find((item) => item.name === sub_bucket.id)?.count ?? -1;
                    return <>{" "} <HoverableLiveListDescription title={sub_bucket.title} description={sub_bucket.description} linkTo={`/matches/?list=${sub_bucket.id}`} count={count} /></>
                })}
            </li>
        })}
    </ul>
}

export function DynamicUserInfluxOverview() {
    return <>user influx</>
}

export function DynamicInlineCount({ counts, name, title = " $count of ", urlBase = "/users/?list=" }) {
    const count = counts[name]?.count ?? -1;
    const description = counts[name]?.description ?? "";
    const titleL = title ?? name;

    const tsplit = title.split("$count");
    const embededCount = <>
        {tsplit[0]}{count === -1 ? <LoadingSpinner /> : count}{tsplit[1]}
    </>

    console.log("DIL", counts, name, count, description, title);
    return <HoverableLiveListDescription title={embededCount} description={description} count={count} linkTo={`${urlBase}${name}`} showCount={false} />
}

export function MatchUserJourneyOverview() {

    const allBuckets = UserJourneyBuckets.flatMap((bucket) => bucket.sub_buckets);
    const allBucketIds = allBuckets.map((bucket) => bucket.id);
    const extraBucketIds = ["needs_matching", "needs_matching_volunteers"]

    const {
        data: userListCounts,
    } = useSWR("/api/matching/users/statistics/user_journey_buckets/", cratePostFetcher({
        selected_filters: allBucketIds.concat(extraBucketIds),
    }), {});


    const allMatchBuckets = MatchJourneyBuckets.flatMap((bucket) => bucket.sub_buckets);
    const allMatchBucketIds = allMatchBuckets.map((bucket) => bucket.id);
    const extraMatchBucketIds = ["match_journey_v2__match_ongoing", "match_journey_v2__match_free_play"]

    const {
        data: matchJourneyListCounts,
    } = useSWR("/api/matching/users/statistics/match_journey_buckets/", cratePostFetcher({
        selected_filters: allMatchBucketIds.concat(extraMatchBucketIds),
    }), {});

    let extraCounts = {}
    if (userListCounts) {
        for (let i = 0; i < userListCounts.length; i++) {
            if (extraBucketIds.includes(userListCounts[i].name))
                extraCounts[userListCounts[i].name] = userListCounts[i]
        }
    }

    let extraMatchCounts = {}
    if (matchJourneyListCounts) {
        for (let i = 0; i < matchJourneyListCounts.length; i++) {
            if (extraMatchBucketIds.includes(matchJourneyListCounts[i].name))
                extraMatchCounts[matchJourneyListCounts[i].name] = matchJourneyListCounts[i]
        }
    }

    return (
        <div className="flex flex-col h-full w-full overflow-y-scroll max-h-[calc(100vh-6rem)]">
            <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
                Little World Statistics & User Journey Overview
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                All the numbers in these overviews <span className="font-semibold">are live statistics</span> and are <span className="font-semibold">filtered down to the current users access</span>.
            </p>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                User Influx
            </h2>
            <DynamicUserInfluxOverview />
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Matching
            </h2>
            <ul className="scroll-m-20 list-disc list-inside flex flex-col">
                <li className="flex flex-row">
                    Currently there are <b><DynamicInlineCount counts={extraCounts} name={"needs_matching"} title={"$count Users that Need A Match"} /></b> users that need matching.
                    Of which are <b>{extraCounts["needs_matching_volunteers"]?.count ?? -1}</b> volunteers (and {extraCounts["needs_matching"]?.count - extraCounts["needs_matching_volunteers"]?.count ?? -1} learners) that need matching.
                </li>
                <li className="flex flex-row">
                    We have {extraMatchCounts["match_journey_v2__match_ongoing"]?.count ?? -1} 'ongoing' matchings ( they are in their first 10 weeks and have interaced withing the last 3 weeks )
                </li>
                <li className="flex flex-row">
                    We have {extraMatchCounts["match_journey_v2__match_free_play"]?.count ?? -1} 'free-play' matchings ( they are still interacting but already over their first 10 weeks )
                </li>
            </ul>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                The User Journey
            </h2>
            <blockquote className="mt-6 border-l-2 pl-6 italic">
                ⚠️ The User Journey V2 is still in development, we are aware of some wrong list and will report when there are ready for user testing
            </blockquote>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We currently define our user journey in the following buckets:
            </p>
            <DynamicUserBucketsList userListCounts={userListCounts} />
            <h2 className="pt-2 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                The Match Journey
            </h2>
            <DynamicMatchBucketsList matchJourneyListCounts={matchJourneyListCounts} />
        </div >
    );
}