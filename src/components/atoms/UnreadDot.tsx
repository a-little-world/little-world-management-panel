import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

export const Unread = styled(Text)<{
  $onIcon?: boolean;
  $height?: string;
  $top?: string;
  $right?: string;
}>`
  position: absolute;
  top: ${({ $onIcon, $top }) => ($onIcon ? '-9px' : $top || '-6px')};
  right: ${({ $onIcon, $right }) => ($onIcon ? '-9px' : $right || '-6px')};
  background: ${({ theme }) => theme.color.surface.highlight};
  color: ${({ theme }) => theme.color.text.button};
  height: ${({ $onIcon, $height }) => ($onIcon ? '18px' : $height || '22px')};
  aspect-ratio: 1;
  border-radius: 100%;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 100%;
`;

function UnreadDot({
  count,
  onIcon,
  height,
  top,
  right,
}: {
  count: number;
  onIcon?: boolean;
  height?: string;
  top?: string;
  right?: string;
}) {
  return (
    <Unread
      type={TextTypes.Body6}
      bold
      $onIcon={onIcon}
      $height={height}
      $top={top}
      $right={right}
    >
      {count}
    </Unread>
  );
}

export default UnreadDot;
