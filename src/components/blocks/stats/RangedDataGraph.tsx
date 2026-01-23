import { Dropdown } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { cratePostFetcher } from '../../../store';
import { DatePicker } from '../../atoms/DatePicker';
import DataGraph from '../DataGraph';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
  width: 100%;
`;

export const graphEndpoints = [
  {
    endpoint: '/api/matching/users/statistics/video_calls/',
    title: 'User Video Calls',
    description: 'The amount of video calls made in a given time period.',
  },
  {
    endpoint: '/api/matching/users/statistics/signups/',
    title: 'User Signups',
    description: 'The amount of users that signed up in a given time period.',
  },
  {
    endpoint: '/api/matching/users/statistics/sessions/',
    title: 'User Sessions',
    description: 'The amount of user sessions created in a given time period.',
  },
  {
    endpoint: '/api/matching/users/statistics/signups/?cumulative=true',
    title: 'cummulative user signups',
    description:
      'the total amount of users that where registered up to a given time period.',
  },
  {
    endpoint: '/api/matching/users/statistics/messages_send/',
    title: 'User Messages',
    description: 'The amount of messages sent in a given time period.',
  },
  {
    endpoint:
      '/api/matching/users/statistics/video_calls/?aggregation=total_time',
    title: 'Summed Minutes Spent in Video Calls',
    description:
      'The total amount of minutes spent in video calls in a given time period.',
  },
  {
    endpoint:
      '/api/matching/users/statistics/video_calls/?aggregation=average_time',
    title: 'Average Time Per Video Call in Minutes',
    description:
      'The average time spent in video calls in a given time period.',
  },
];

export function RangedDataGraph() {
  const random = React.useRef(Date.now() + Math.random());

  const [endpoint, setEndpoint] = React.useState(graphEndpoints[0]);

  const [startDate, setStartDate] = React.useState('2024-01-01');
  const today = new Date();
  const [endDate, setEndDate] = React.useState(
    today.toISOString().split('T')[0],
  );
  const [dayRange, setDayRange] = React.useState(1); // supports only 1 or 7 atm

  const appendEndpoint =
    (endpoint.endpoint.endsWith('/') ? '?random=' : '&random=') +
    random.current;

  const { mutate, error, data, isLoading } = useSWR(
    endpoint.endpoint + appendEndpoint,
    cratePostFetcher({
      start_date: startDate,
      end_date: endDate,
      bucket_size: dayRange,
    }),
    {},
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col justify-center items-center">
      <h2>{endpoint.endpoint}</h2>
      <StyledDropdown
        value={endpoint.endpoint}
        options={graphEndpoints.map(({ endpoint, title, description }) => ({
          value: endpoint,
          label: description,
        }))}
        onValueChange={val => {
          setEndpoint(
            graphEndpoints.find(({ endpoint }) => endpoint === val) ||
            graphEndpoints[0],
          );
        }}
        placeholder="Select a user list..."
        cannotError
      />
      <span>
        NOTE: Any statistics are filtered down to the users the current matching
        user has access too
      </span>
      <div className="w-full flex flex-row items-center content-center justify-center">
        <div className="flex flex-col items-center content-center justify-center">
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
        </div>
        <div className="flex flex-col items-center content-center justify-center">
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
        <div className="flex flex-col items-center content-center justify-center">
          <div className="flex w-full items-start">Day Range:</div>
          <StyledDropdown
            value={dayRange.toString()}
            options={[1, 7, 30].map(val => ({
              value: val.toString(),
              label: val === 1 ? 'Daily' : val === 7 ? 'Weekly' : 'Monthly',
            }))}
            onValueChange={val => {
              setDayRange(parseInt(val));
              setTimeout(() => {
                mutate();
              }, 500);
            }}
            placeholder="Select a user list..."
            cannotError
          />
        </div>
      </div>
      <DataGraph data={data} dataLabel={`${endpoint.title}: `} />
    </div>
  );
}
