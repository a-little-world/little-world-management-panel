import {
  Card,
  ChevronRightIcon,
  Link,
  Text,
} from '@a-little-world/little-world-design-system';
import { isNumber } from 'lodash';
import React from 'react';
import { styled } from 'styled-components';
import LoadingSpinner from '../../atoms/LoadingSpinner';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../atoms/HoverCard';

export const SectionTitle = styled(Text)`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
`;

export const Sections = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
`;

export const Section = styled.div<{ $fullWidth?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  flex: 1;

  ${({ $fullWidth }) =>
    $fullWidth &&
    `
    flex: 1 0 100%;
    width: 100%`}
`;

export const SectionR = styled.div<{ $fullWidth?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: row;
  flex: 1;

  ${({ $fullWidth }) =>
    $fullWidth &&
    `
    flex: 1 0 100%;
    width: 100%`}
`;

export const SectionCard = styled(Card)`
  flex: 1;
`;

export const Description = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

export const BucketsContainer = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.large};
  margin-top: ${({ theme }) => theme.spacing.small};
`;

export const Bucket = styled.li`
  gap: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  flex-direction: column;
`;

export const SubBucket = styled.li`
  gap: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  align-items: center;
`;

export const StyledChevron = styled(ChevronRightIcon)`
  color: ${({ theme }) => theme.color.text.accent};
`;

export const Count = ({ count, label }: { count: number; label?: string }) => {
  if (isNumber(count))
    return (
      <Text tag="span" bold={!!label}>
        {label ? `${label}: ${count}` : `(${count})`}
      </Text>
    );

  return <LoadingSpinner inline />;
};

export function HoverableLiveListDescription({
  title,
  description,
  linkTo,
  count,
  showCount = true,
}: {
  title: string;
  description: string;
  linkTo: string;
  count: number;
  showCount?: boolean;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={linkTo} className="flex ">
          <>
            <span>{title}</span>
            {showCount && (
              <>
                {' '}
                <Count count={count} />
              </>
            )}
          </>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <Text>{description}</Text>
        <Count count={count} label={'Current users'} />
      </HoverCardContent>
    </HoverCard>
  );
}

export function DetailsOpenLink({
  title,
  description,
  onClick = () => {},
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link onClick={onClick} className="flex ">
          <>
            <span>{title}</span>
          </>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <Text>{description}</Text>
      </HoverCardContent>
    </HoverCard>
  );
}
