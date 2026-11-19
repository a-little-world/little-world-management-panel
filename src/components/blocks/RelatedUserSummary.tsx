import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import { format, parseISO } from 'date-fns';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { RelatedUserProfile } from '../../api/supportTasks';
import { ORANGE_40 } from '../../constants';
import { usePanelCapability } from '../../helpers/panelCapabilities';
import PersonalValue from '../atoms/PersonalValue';
import UserImage from '../atoms/UserImage';

export const MetaLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 600;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-width: 0;
`;

const UserInfoRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xsmall};
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
`;

const StatBox = styled.div<{ $full_width?: boolean }>`
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  grid-column: ${({ $full_width }) => ($full_width ? '1 / -1' : 'inherit')};
`;

const LinkRow = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.small};
  margin-top: ${({ theme }) => theme.spacing.xsmall};

  a {
    color: ${({ theme }) => theme.color.text.link};
  }

  a:hover {
    text-decoration: underline;
  }
`;

export interface RelatedUserDetail {
  bucket?: string;
  bucket_label?: string;
  profile?: { country_of_residence?: string };
}

function formatLastActive(iso: string | null): string {
  if (!iso) return 'Never';
  const date = parseISO(iso);
  const diffDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  const timeStr = format(date, 'h:mmaaa');
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return format(date, 'MMM d, yyyy');
}

function RelatedUserSummary({
  user,
  detail,
  children,
}: {
  user: RelatedUserProfile;
  detail?: RelatedUserDetail;
  children?: ReactNode;
}) {
  const canViewUsers = usePanelCapability('users');
  const bucket = detail?.bucket_label ?? detail?.bucket;

  return (
    <div>
      <UserInfoRow>
        <UserImage
          alt={`${user.first_name} ${user.second_name}`}
          user={user}
          dimensions={{ width: 56, height: 56 }}
        />
        <Field>
          <Text bold color={ORANGE_40} tag="div">
            {user.first_name} {user.second_name}
          </Text>
          <Text type={TextTypes.Body5} tag="div">
            {user.user_type}
          </Text>
          <Text type={TextTypes.Body5} tag="div">
            <PersonalValue value={user.email} />
          </Text>
        </Field>
      </UserInfoRow>
      <StatGrid>
        {bucket && (
          <StatBox $full_width>
            <MetaLabel>Bucket</MetaLabel>
            <Text bold tag="div">
              {bucket}
            </Text>
          </StatBox>
        )}
        <StatBox>
          <MetaLabel>Member since</MetaLabel>
          <Text bold tag="div">
            {format(parseISO(user.date_joined), 'MMM yyyy')}
          </Text>
        </StatBox>
        <StatBox>
          <MetaLabel>Past tickets</MetaLabel>
          <Text bold tag="div">
            {user.past_tickets}
          </Text>
        </StatBox>
      </StatGrid>
      <StatGrid>
        <Field>
          <MetaLabel>Last active</MetaLabel>
          <Text type={TextTypes.Body6} tag="div">
            {formatLastActive(user.last_active)}
          </Text>
        </Field>
        <Field>
          <MetaLabel>Residence</MetaLabel>
          <Text type={TextTypes.Body6} tag="div">
            {detail?.profile?.country_of_residence || '-'}
          </Text>
        </Field>
      </StatGrid>
      <LinkRow>
        {canViewUsers && (
          <Link to={`/user/${user.id}`}>Open full profile →</Link>
        )}
        {children}
      </LinkRow>
    </div>
  );
}

export default RelatedUserSummary;
