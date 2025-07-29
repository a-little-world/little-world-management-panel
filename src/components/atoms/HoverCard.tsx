import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import * as React from 'react';
import styled from 'styled-components';

import { cn } from '../../lib/utils';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = styled(HoverCardPrimitive.Trigger)`
  display: flex;
  flex-wrap: nowrap;
  gap: ${({ theme }) => theme.spacing.xsmall};
  align-items: center;
`;

const StyledHoverCardContent = styled(HoverCardPrimitive.Content)`
  z-index: 50;
  border-radius: ${({ theme }) => theme.radius.xsmall};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.small};
  max-width: 320px;
`;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <StyledHoverCardContent
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardContent, HoverCardTrigger };
