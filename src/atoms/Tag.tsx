import { Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

export enum TagTypes {
  primary = 'primary',
  secondary = 'secondary',
}

export const StyledTag = styled(Text)<{ $type: string }>`
  width: 104px;
  height: 34px;
  font-family: revert;
  padding: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: ${({ theme }) => theme.color.surface.primary};
  border-radius: ${({ theme }) => theme.radius.large};
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  color: ${({ theme, $type }) =>
    $type === TagTypes.primary ? theme.color.text.heading : '#de5050'};
  border: 2px solid
    ${({ theme, $type }) =>
      $type === TagTypes.primary ? theme.color.border.bold : '#de5050'};
  filter: drop-shadow(0px 1px 3px rgb(0 0 0 / 22%));
  line-height: 1.1;
`;

interface TagProps {
  className: string;
  type: keyof typeof TagTypes;
}

const Tag = ({ children, className, type = TagTypes.primary }: TagProps) => {
  return (
    <StyledTag className={className} $type={type}>
      {children}
    </StyledTag>
  );
};

export default Tag;
