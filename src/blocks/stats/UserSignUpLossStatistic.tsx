import {
    BarChartCounts
} from "../BarChartCounts"

import { DatePicker } from '../../atoms/DatePicker';

import React from 'react';
import useSWR from 'swr';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import { cratePostFetcher } from '../../store';

export function DynamicUserSignUpLossStatistic() { }

export function UserSignUpLossStatisticMonthly({
    showDatePickers = false,
    useSubtitles = true,
    startingMonth = '2024-01-01',
    title = "User Sign-Up Loss Statistics"
}) {

    const [startDate, setStartDate] = React.useState(startingMonth);
    const oneMonthAfterStartingMonth = new Date(new Date(startingMonth).setMonth(new Date(startingMonth).getMonth() + 1))
    const [endDate, setEndDate] = React.useState(oneMonthAfterStartingMonth.toISOString().split('T')[0]);

    return <UserSignUpLossStatisticBase
        title={title}
        showDatePickers={showDatePickers}
        startDate={startDate}
        endDate={endDate}
        useSubtitles={useSubtitles}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
    />
}

export function UserSignUpLossStatistic({
    showDatePickers = true,
    useSubtitles = true,
    title = "User Sign-Up Loss Statistics"
}) {

    const [startDate, setStartDate] = React.useState('2021-01-01');
    const today = new Date();
    const [endDate, setEndDate] = React.useState(
        today.toISOString().split('T')[0],
    );

    return <UserSignUpLossStatisticBase
        title={title}
        showDatePickers={showDatePickers}
        startDate={startDate}
        endDate={endDate}
        useSubtitles={useSubtitles}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
    />
}

export function UserSignUpLossStatisticBase({
    showDatePickers,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    title = "User Sign-Up Loss Statistics",
    useSubtitles = true
}) {

    const requiredCounts = [
        'journey_v2__user_created',
        'journey_v2__email_verified',
        'journey_v2__user_form_completed',
        'journey_v2__booked_onboarding_call',
        'journey_v2__first_search',
        'journey_v2__user_deleted',
        'journey_v2__no_show',
        'all'
    ]

    const signupLossCounts = [
        'journey_v2__user_created',
        'journey_v2__email_verified',
        'journey_v2__user_form_completed',
        'journey_v2__booked_onboarding_call',
        'journey_v2__first_search',
        'journey_v2__user_deleted',
        'journey_v2__no_show'
    ]

    const random = React.useRef(Date.now() + Math.random());
    const { data: userListCounts, mutate } = useSWR(
        '/api/matching/users/statistics/user_journey_buckets/?random=' + random.current,
        cratePostFetcher({
            selected_filters: requiredCounts,
            start_date: startDate,
            end_date: endDate,
        }),
        {},
    );

    if (!userListCounts) return <LoadingSpinner />;

    const totalUserCount = userListCounts?.buckets.find(item => item.name === 'all')?.count;

    const allUserCount = userListCounts?.buckets.reduce((acc, curr) => {
        acc[curr.name] = curr.count;
        return acc;
    }, {});



    if (!allUserCount || !userListCounts || typeof allUserCount !== 'object')
        return <LoadingSpinner />;

    console.log("ALLUSERCOUNT", allUserCount, userListCounts['all'])


    const colors = [
        '#3498db',
        '#f1c40f',
        '#e74c3c',
        '#3498db',
        '#f1c40f',
        '#e74c3c',
        '#3498db',
        '#f1c40f',
    ]

    const chartData = signupLossCounts.map((bucket, index) => {
        const count = allUserCount[bucket]
        return { tag: bucket, count, fill: colors[index] };
    })

    const totalCounts = chartData.reduce((acc, curr) => acc + curr.count, 0);

    const becameActiveUsers = totalUserCount - totalCounts;

    // chat that becameActiveUsers is a number
    if (!becameActiveUsers) return <LoadingSpinner />

    chartData.push({ tag: 'became_active', count: becameActiveUsers, fill: '#2ecc71' });

    let chartConfig = {
        count: {
            label: 'Count'
        },
    }

    chartData.forEach((dp, i) => {
        chartConfig[dp.tag] = {
            label: dp.tag,
            color: dp.fill
        }
    })

    console.log("CHARTDATA", chartConfig, totalCounts, becameActiveUsers, totalUserCount)

    const percentageUsersBecomeActive = (becameActiveUsers / totalUserCount) * 100;
    const percentageUsersCompleFormButDontBookOnboarding = ((allUserCount['journey_v2__user_form_completed'] - allUserCount['journey_v2__booked_onboarding_call']) / totalUserCount) * 100;


    const text1 = `Out of ${totalUserCount} users, ${becameActiveUsers} users became active users after signing up. This is ${percentageUsersBecomeActive.toFixed(2)}% of all users.`
    const text2 = `Out of ${totalUserCount} users, ${allUserCount['journey_v2__user_form_completed'] - allUserCount['journey_v2__booked_onboarding_call']} users completed the form but did not book an onboarding call. This is ${percentageUsersCompleFormButDontBookOnboarding.toFixed(2)}% of all users.`

    return <div>
        <BarChartCounts
            useSubtitles={useSubtitles}
            extraHeader={<>{showDatePickers &&
                <div className="flex flex-row items-center content-center justify-center">
                    <div className="flex w-full items-start">Start Date:</div>
                    <DatePicker
                        date={startDate}
                        setDate={date => {
                            setStartDate(date);
                            setTimeout(() => {
                                mutate();
                            }, 500);
                        }}
                    />
                    <div className="flex w-full items-start">End Date</div>
                    <DatePicker
                        date={endDate}
                        setDate={date => {
                            setEndDate(date);
                            setTimeout(() => {
                                mutate();
                            }, 500);
                        }}
                    />
                </div>
            }</>}
            title={title}
            description="This is a bar chart showing the loss of users in the sign-up process"
            chartData={chartData}
            chartConfig={chartConfig}
            subtitle1={text1}
            subtitle2={text2}
        /></div>;
}
