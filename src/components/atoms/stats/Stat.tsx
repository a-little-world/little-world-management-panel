import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import LoadingSpinner from '../LoadingSpinner';

export type StatBreakdownItem = {
  label: string;
  value: React.ReactNode;
};

export type StatProps = {
  /** Main figure. Omit to show a spinner. Pass a node for custom visuals (e.g. a ring). */
  stat?: React.ReactNode;
  label: React.ReactNode;
  /** Optional control beside the label, such as a docs link. */
  labelAccessory?: React.ReactNode;
  breakdown?: StatBreakdownItem[];
  className?: string;
};

export const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.medium};
`;

export const StatCards = StatRow;

const StatCard = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  flex: 1;
  min-width: 0;
  text-align: center;
`;

const StatValue = styled(Text).attrs({
  bold: true,
  center: true,
})`
  font-size: 1.75rem;
  line-height: 1.2;
  color: ${({ theme }) => theme.color.text.heading};
`;

const StatLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const StatLabel = styled(Text).attrs({
  center: true,
  type: TextTypes.Body7,
})`
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const BreakdownList = styled.div`
  align-self: stretch;
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
  padding-top: ${({ theme }) => theme.spacing.xxsmall};
`;

const BreakdownRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  justify-content: space-between;
`;

const BreakdownLabel = styled(Text).attrs({
  tag: 'span' as const,
  type: TextTypes.Body7,
})`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const BreakdownValue = styled(Text).attrs({
  bold: true,
  tag: 'span' as const,
  type: TextTypes.Body7,
})`
  color: ${({ theme }) => theme.color.text.primary};
`;

const isPlainStat = (stat: React.ReactNode) =>
  stat == null || typeof stat === 'string' || typeof stat === 'number';

const Stat = ({
  stat,
  label,
  labelAccessory,
  breakdown,
  className,
}: StatProps) => (
  <StatCard className={className}>
    {isPlainStat(stat) ? (
      <StatValue>{stat ?? <LoadingSpinner />}</StatValue>
    ) : (
      stat
    )}
    <StatLabelRow>
      <StatLabel>{label}</StatLabel>
      {labelAccessory}
    </StatLabelRow>
    {breakdown && breakdown.length > 0 && (
      <BreakdownList>
        {breakdown.map(item => (
          <BreakdownRow key={item.label}>
            <BreakdownLabel>{item.label}</BreakdownLabel>
            <BreakdownValue>{item.value}</BreakdownValue>
          </BreakdownRow>
        ))}
      </BreakdownList>
    )}
  </StatCard>
);

export default Stat;
