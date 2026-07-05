import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { dataFetcher } from '../../store';
import UserImage from './UserImage';

type InlineManagementUser = {
  id: number;
  email: string;
  profile?: {
    first_name?: string;
    second_name?: string;
  };
  image?: string;
  image_type?: string;
  avatar_config?: Record<string, unknown>;
};

const UserLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  text-decoration: none;
  vertical-align: middle;
  line-height: 1;

  &:hover {
    text-decoration: underline;
  }
`;

const UserAvatar = styled.span`
  display: inline-flex;
  align-items: center;
  line-height: 0;
  transform: translateY(1px);
`;

const UserName = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  line-height: 1;
`;

const FallbackLabel = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const getFullName = (user?: InlineManagementUser) => {
  const firstName = user?.profile?.first_name?.trim() || '';
  const lastName = user?.profile?.second_name?.trim() || '';
  return `${firstName} ${lastName}`.trim();
};

export const ManagementUserInlineLink = ({
  email,
  tab,
}: {
  email: string;
  tab?: string;
}) => {
  const encodedEmail = encodeURIComponent(email);
  const { data } = useSWR<InlineManagementUser>(
    `/api/matching/users/${encodedEmail}/`,
    dataFetcher,
  );

  if (!data?.id) {
    return <FallbackLabel>@{email}</FallbackLabel>;
  }

  const fullName = getFullName(data) || data.email;
  const to = tab ? `/user/${data.id}?tab=${tab}` : `/user/${data.id}`;

  return (
    <UserLink to={to}>
      <UserAvatar>
        <UserImage
          alt={fullName}
          user={data}
          dimensions={{ height: 16, width: 16 }}
          tooltipText={data.email}
        />
      </UserAvatar>
      <UserName>{fullName}</UserName>
    </UserLink>
  );
};

export default ManagementUserInlineLink;
