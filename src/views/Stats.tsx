import React from 'react';
import { cratePostFetcher } from '../store';
import useSWR from 'swr';
import DataGraph from '../blocks/DataGraph';


function Stats() {

    const {
        data: sinupStats,
        mutate,
        error,
        isLoading,
    } = useSWR(`/api/matching/users/statistics/signups/`, cratePostFetcher({
        start_date: '2024-01-01',
    }), {});

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="flex justify-center items-center h-screen">
            <h2>Stats</h2>
            sdfs
            <DataGraph data={sinupStats} />
        </div>
    )
}

export default Stats;