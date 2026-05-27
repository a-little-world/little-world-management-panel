import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { css } from 'styled-components';

import LoadingSpinner from '../LoadingSpinner';

export const StatWrapper = styled.li<{ $withBorder?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  flex: 1;

  ${({ $withBorder, theme }) =>
    $withBorder &&
    css`
      border: 2px solid ${theme.color.border.selected};
      border-radius: ${theme.radius.small};
      max-width: 150px;
      padding: ${theme.radius.small};
    `}
`;

export const StatDescription = styled(Text)``;

export const Number = styled(Text)`
  line-height: 1;
  color: ${({ theme }) => theme.color.text.title};
`;

const KeyStat = ({ stat }: { stat?: string | number }) => (
  <Number bold type={TextTypes.Heading3}>
    {stat ?? <LoadingSpinner />}
  </Number>
);

const Stat = ({
  stat,
  label,
  withBorder,
}: {
  stat?: string | number;
  label: string;
  withBorder?: boolean;
}) => (
  <StatWrapper $withBorder={withBorder}>
    <KeyStat stat={stat} />
    <StatDescription>{label}</StatDescription>
  </StatWrapper>
);

export default Stat;
