import React from 'react';
import { cratePostFetcher } from '../store';
import useSWR from 'swr';
import DataGraph from '../blocks/DataGraph';
import { DatePicker } from '../atoms/DatePicker';


function RangedDataGraph({
    endpoint
}) {

    const [startDate, setStartDate] = React.useState('2024-01-01');
    const [endDate, setEndDate] = React.useState('2024-05-05');
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
    if (!data) return <div>Error: {error}</div>;


    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <h2>{endpoint}</h2>
            <div className='w-full flex flex-row'>
                <div className='flex flex-col items-center content-center justify-center'>
                    Start Date:
                    <DatePicker date={startDate} setDate={(date) => {
                        setStartDate(date);
                        setTimeout(() => {
                            mutate();
                        }, 500);
                    }} />
                </div>
                <div className='flex flex-col items-center content-center justify-center'>
                    End Date:
                    <DatePicker date={endDate} setDate={(date) => {
                        setEndDate(date);
                        setTimeout(() => {
                            mutate();
                        }, 500);
                    }} />
                </div>
            </div>
            <DataGraph data={data} />
        </div>
    )
}

function Stats() {

    return (
        <div className="flex justify-center items-center h-screen">
            <RangedDataGraph endpoint="/api/matching/users/statistics/signups/" />
        </div>
    )
}

export default Stats;
