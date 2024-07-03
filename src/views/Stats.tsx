import React from 'react';
import { cratePostFetcher } from '../store';
import useSWR from 'swr';
import DataGraph from '../blocks/DataGraph';
import { DatePickerDemo } from '../atoms/DatePicker';


function RangedDataGraph({
    endpoint
}) {

    const [startDate, setStartDate] = React.useState('2022-01-01');
    const [endDate, setEndDate] = React.useState('2024-01-01');
    const [dayRange, setDayRange] = React.useState(1); // supports only 1 or 7 atm

    const {
        mutate,
        error,
        data,
        isLoading,
    } = useSWR(endpoint, cratePostFetcher({
        start_date: startDate,
        end_date: endDate,
        bucket_size: dayRange,
    }), {});

    if (isLoading) return <div>Loading...</div>;


    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div>
                settings
            </div>
            <h2>{endpoint}</h2>
            <DataGraph data={data} />
        </div>
    )
}

function Stats() {

    return (
        <div className="flex justify-center items-center h-screen">
            <DatePickerDemo />
            <RangedDataGraph endpoint="/api/matching/users/statistics/signups/" />
        </div>
    )
}

export default Stats;
