import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import { capitalize } from 'lodash';
import { isValid } from 'date-fns';
import React from 'react';
import styled from 'styled-components';

import { LANGUAGES } from '../../../constants';
import { formatDate } from '../../../helpers/date';
import { Card, CardHeader, CardTitle } from '../../atoms/Card';

export interface MatchLogActor {
  name: string;
  role: string;
}

/** One event from the backend's ``build_match_log``. The API sends oldest first. */
export interface MatchLogEvent {
  time: string | null;
  kind: string;
  title: string;
  actor: MatchLogActor | null;
  reason: string | null;
  details: string[];
}

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0 ${({ theme }) => theme.spacing.medium}
    ${({ theme }) => theme.spacing.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const Entry = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  padding-left: ${({ theme }) => theme.spacing.small};
  border-left: 2px solid ${({ theme }) => theme.color.border.subtle};
`;

const formatEventTime = (time: string | null) => {
  const parsed = time ? new Date(time) : null;
  return parsed && isValid(parsed)
    ? formatDate(parsed, 'dd.LL.yyyy HH:mm', LANGUAGES.en)
    : 'Unknown date';
};

const describeActor = (actor: MatchLogActor | null) =>
  actor ? `${actor.name} (${capitalize(actor.role)})` : 'System';

const latestFirst = (events: MatchLogEvent[]) => [...events].reverse();

const MatchLog = ({ events }: { events?: MatchLogEvent[] }) => (
  <Card center={false}>
    <CardHeader>
      <CardTitle>Log</CardTitle>
    </CardHeader>
    {events?.length ? (
      <Timeline>
        {latestFirst(events).map((event, index) => (
          <Entry key={`${event.kind}-${event.time ?? 'unknown'}-${index}`}>
            <Text type={TextTypes.Body7} tag="span">
              {formatEventTime(event.time)} · {describeActor(event.actor)}
            </Text>
            <Text type={TextTypes.Body6} bold tag="span">
              {event.title}
            </Text>
            {event.reason && (
              <Text type={TextTypes.Body6} tag="span">
                Reason: {event.reason}
              </Text>
            )}
            {event.details.map(detail => (
              <Text key={detail} type={TextTypes.Body7} tag="span">
                {detail}
              </Text>
            ))}
          </Entry>
        ))}
      </Timeline>
    ) : (
      <Timeline as="div">
        <Text type={TextTypes.Body6}>Nothing logged for this match yet.</Text>
      </Timeline>
    )}
  </Card>
);

export default MatchLog;
