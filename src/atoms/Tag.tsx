import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React, { FC, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

export enum TagAppearance {
  primary = 'primary',
  secondary = 'secondary',
  error = 'error',
  success = 'success',
}

export enum TagSizes {
  small = 'small',
  large = 'large',
}

export const StyledTag = styled(Text)<{ $size: string; $appearance: string }>`
  font-family: revert;
  padding: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: ${({ theme }) => theme.color.surface.primary};
  border-radius: ${({ theme }) => theme.radius.large};
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  color: ${({ $appearance }) =>
    $appearance === TagAppearance.primary ? '#9631c5' : '#ec2525'};
  border: 2px solid
    ${({ $appearance }) =>
      $appearance === TagAppearance.primary ? '#9631c5' : '#ec2525'};
  filter: drop-shadow(0px 1px 3px rgb(0 0 0 / 22%));
  line-height: 1.1;
  text-transform: capitalize;

  ${({ theme, $size }) => {
    if ($size === TagSizes.small)
      return css`
        height: 30px;
        padding: ${theme.spacing.xsmall};
        width: 96px;
      `;

    if ($size === TagSizes.large)
      return css`
        width: 104px;
        height: 34px;
      `;
  }}}

  ${({ theme, $appearance }) => {
    if ($appearance === TagAppearance.error)
      return css`
        color: ${theme.color.text.error};
        background: ${theme.color.surface.error};
        border: 0px;
        filter: none;
      `;

    if ($appearance === TagAppearance.success)
      return css`
        color: ${theme.color.text.success};
        background: ${theme.color.surface.success};
        border: 0px;
        filter: none;
      `;
  }}}
`;

interface TagProps {
  className?: string;
  appearance?: keyof typeof TagAppearance;
  size?: keyof typeof TagSizes;
}

const Tag: FC<PropsWithChildren<TagProps>> = ({
  children,
  className,
  size = TagSizes.large,
  appearance = TagAppearance.primary,
}) => {
  return (
    <StyledTag
      className={className}
      type={size === TagSizes.small ? TextTypes.Body6 : TextTypes.Body5}
      $appearance={appearance}
      $size={size}
    >
      {children}
    </StyledTag>
  );
};

export default Tag;
