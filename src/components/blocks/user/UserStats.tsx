import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  ButtonAppearance,
  ButtonSizes,
  Link,
} from '@a-little-world/little-world-design-system';
import { formatRoundedDuration } from '../../../helpers/date';
import { VIDEO_CALLS_ROUTE } from '../../../router/routes';
import { dataFetcher } from '../../../store';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
`;

const StatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
`;

const StatCard = styled.div`
  border-radius: ${({ theme }) => theme.radius.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.secondary};
  padding: ${({ theme }) => theme.spacing.small};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxxsmall};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.title};
`;

const Message = styled.div<{ $error?: boolean }>`
  padding: ${({ theme }) => theme.spacing.small};
  color: ${({ theme, $error }) =>
    $error ? theme.color.text.error : theme.color.text.primary};
`;

const UserStats = ({ user }: { user: { id: number } }) => {
  const { data, error, isLoading } = useSWR<{
    total_video_calls: number;
    total_video_time_hours: number;
  }>(
    `/api/matching/users/statistics/video_call_summary/${user.id}/`,
    dataFetcher,
  );

  if (isLoading) return <Message>Loading stats…</Message>;
  if (error) return <Message $error>Failed to load video call stats.</Message>;
  if (!data) return null;

  const { total_video_calls, total_video_time_hours } = data;

  return (
    <Wrapper>
      <StatsContainer>
        <StatCard>
          <StatLabel>Total video calls</StatLabel>
          <StatValue>{total_video_calls}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total time in video calls</StatLabel>
          <StatValue>
            {formatRoundedDuration(total_video_time_hours * 3600)}
          </StatValue>
        </StatCard>
      </StatsContainer>
      <Link
        buttonAppearance={ButtonAppearance.Primary}
        buttonSize={ButtonSizes.Medium}
        to={VIDEO_CALLS_ROUTE + '?user_id=' + user.id}
      >
        View list of video calls
      </Link>
    </Wrapper>
  );
};

export default UserStats;
