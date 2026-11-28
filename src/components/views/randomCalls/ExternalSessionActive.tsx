import {
  Loading,
  LoadingSizes,
  Select,
  Text,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  ADMIN_EXTERNAL_SESSIONS_ENDPOINT,
  ExternalSession,
  fetchExternalSessions,
} from '../../../api/partnerEventRegistrations';
import { formatDate, formatEventTime } from '../../../helpers/date';
import { PageContainer } from '../../atoms/PageLayout';
import RandomCallManagement from './RandomCallManagement';
import {
  Description,
  ScheduleDate,
  ScheduleItem,
  ScheduleItemInfo,
  ScheduleTime,
  Section,
  SectionTitle,
} from './RandomCalls.styles';

const Selector = styled.div`
  max-width: 28rem;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

function isOpenNow(session: ExternalSession, now: number): boolean {
  const start = new Date(session.start_time).getTime();
  const end = new Date(session.end_time).getTime();
  return start <= now && now <= end;
}

function sessionLabel(session: ExternalSession): string {
  const company = session.company?.name;
  const start = new Date(session.start_time);
  const when = `${formatDate(start, 'EEE d MMM', 'de')} ${formatEventTime(start, new Date(session.end_time))}`;
  return company ? `${company} · ${when}` : when;
}

/** How often "open now" is re-checked, so a session appears at its start and leaves at its end. */
const CLOCK_TICK_MS = 15000;

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function ExternalSessionActive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = useNow(CLOCK_TICK_MS);
  const { data, error, isLoading } = useSWR(
    ADMIN_EXTERNAL_SESSIONS_ENDPOINT,
    () => fetchExternalSessions(),
    { refreshInterval: 15000, revalidateOnFocus: true },
  );

  const sessions = data?.results ?? [];
  const active = sessions
    .filter(session => isOpenNow(session, now))
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );
  const upcoming = sessions
    .filter(session => new Date(session.start_time).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )[0];

  const requested = searchParams.get('session');
  const selected =
    active.find(session => session.uuid === requested) ?? active[0];

  const onSelect = (uuid: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'external');
    nextParams.set('section', 'active');
    nextParams.set('session', uuid);
    setSearchParams(nextParams);
  };

  if (isLoading && !data) {
    return <Loading size={LoadingSizes.Medium} />;
  }

  if (error) {
    return <Text>Could not load external sessions.</Text>;
  }

  if (!selected) {
    return (
      <PageContainer>
        <Section>
          <SectionTitle>No external session is active</SectionTitle>
          <Description>
            A session appears here between its start and end time.
          </Description>
          {upcoming && (
            <>
              <SectionTitle>Next upcoming session</SectionTitle>
              <ScheduleItem>
                <ScheduleItemInfo>
                  <ScheduleDate>
                    {upcoming.company?.name ?? upcoming.name}
                  </ScheduleDate>
                  <ScheduleTime>
                    {formatDate(
                      new Date(upcoming.start_time),
                      'EEEE, d MMMM yyyy',
                      'de',
                    )}{' '}
                    ·{' '}
                    {formatEventTime(
                      new Date(upcoming.start_time),
                      new Date(upcoming.end_time),
                    )}
                  </ScheduleTime>
                </ScheduleItemInfo>
              </ScheduleItem>
            </>
          )}
        </Section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {active.length > 1 && (
        <Selector>
          <Select
            id="active-external-session"
            label="Active session"
            value={selected.uuid}
            onValueChange={onSelect}
            options={active.map(session => ({
              value: session.uuid,
              label: sessionLabel(session),
            }))}
            cannotError
          />
        </Selector>
      )}
      <RandomCallManagement
        lobbyName={selected.name}
        lobbyUuid={selected.uuid}
        segment="external"
        allowReset={false}
      />
    </PageContainer>
  );
}

export default ExternalSessionActive;
