
import {
    BarChartCounts
} from "../BarChartCounts"

import { DatePicker } from '../../atoms/DatePicker';

import React from 'react';
import useSWR from 'swr';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import { cratePostFetcher } from '../../store';

export function MatchQualityStatistic() {

    const [startDate, setStartDate] = React.useState('2021-01-01');
    const today = new Date();
    const [endDate, setEndDate] = React.useState(
        today.toISOString().split('T')[0],
    );

    const matchJourneyRequiredCouunts = [
        'journey_v2__user_created',
        'journey_v2__email_verified',
        'journey_v2__user_form_completed',
        'journey_v2__booked_onboarding_call',
        'journey_v2__first_search',
        'journey_v2__user_deleted',
        'all'
    ]

    const { data: matchJourneyListCounts } = useSWR(
        '/api/matching/users/statistics/match_journey_buckets/',
        cratePostFetcher({
            selected_filters: matchJourneyRequiredCouunts,
        }),
        {},
    );

    return null

}
