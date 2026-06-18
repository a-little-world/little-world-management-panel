'use client';

import {
  Button,
  CloseIcon,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import styled, { css, keyframes } from 'styled-components';

import { ScrollArea } from './ScrollArea';

const Sheet = SheetPrimitive.Root;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideInFromRight = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const slideInFromLeft = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const slideInFromTop = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`;

const slideInFromBottom = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const StyledSheetOverlay = styled(SheetPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;

  &[data-state='open'] {
    animation: ${fadeIn} 0.4s ease-out;
  }

  &[data-state='closed'] {
    animation: ${fadeOut} 0.4s ease-in;
  }
`;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ ...props }, ref) => <StyledSheetOverlay {...props} ref={ref} />);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

interface StyledSheetContentProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const StyledSheetContent = styled(
  SheetPrimitive.Content,
)<StyledSheetContentProps>`
  position: fixed;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.large};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

  ${({ side, theme }) => {
    switch (side) {
      case 'top':
        return css`
          inset-x: 0;
          top: 0;
          border-bottom: 1px solid ${theme.color.border.subtle};
          &[data-state='open'] {
            animation: ${slideInFromTop} 0.35s ease-out;
          }
        `;
      case 'bottom':
        return css`
          inset-x: 0;
          bottom: 0;
          border-top: 1px solid ${theme.color.border.subtle};
          &[data-state='open'] {
            animation: ${slideInFromBottom} 0.35s ease-out;
          }
        `;
      case 'left':
        return css`
          top: 0;
          left: 0;
          height: 100%;
          width: 60%;
          border-right: 1px solid ${theme.color.border.subtle};
          &[data-state='open'] {
            animation: ${slideInFromLeft} 0.35s ease-out;
          }
          @media (min-width: 640px) {
            max-width: 35rem;
          }
        `;
      case 'right':
      default:
        return css`
          top: 0;
          right: 0;
          height: 100%;
          width: 90%;
          border-left: 1px solid ${theme.color.border.subtle};
          &[data-state='open'] {
            animation: ${slideInFromRight} 0.35s ease-out;
          }
          @media (min-width: ${theme.breakpoints.medium}) {
            width: 60%;
            max-width: 35rem;
          }
        `;
    }
  }}
`;

export const StyledSheetButton = styled(Button)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xlarge};
  right: 50%;
  transform: translateX(50%);
  z-index: 1;
`;

const SheetTrigger = ({
  children,
  ...props
}: { children: string } & React.ComponentPropsWithoutRef<typeof Button>) => (
  <SheetPrimitive.Trigger asChild>
    <StyledSheetButton {...props}>{children}</StyledSheetButton>
  </SheetPrimitive.Trigger>
);

const StyledCloseButton = styled(SheetPrimitive.Close)`
  position: absolute;
  right: ${({ theme }) => theme.spacing.medium};
  top: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.radius.small};
  opacity: 0.7;
  transition: opacity 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.small};

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.color.border.selected};
  }

  &:disabled {
    pointer-events: none;
  }

  &[data-state='open'] {
    background-color: ${({ theme }) => theme.color.surface.secondary};
  }
`;

interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Content
> {
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <StyledSheetContent ref={ref} side={side} {...props}>
      {children}
      <StyledCloseButton>
        <CloseIcon width="16" height="16" label="close sheet" />
      </StyledCloseButton>
    </StyledSheetContent>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const StyledSheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  text-align: center;

  @media (min-width: 640px) {
    text-align: left;
  }
`;

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <StyledSheetHeader ref={ref} {...props}>
    {children}
  </StyledSheetHeader>
));
SheetHeader.displayName = 'SheetHeader';

const StyledSheetFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
  flex-direction: column-reverse;
  width: 100%;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.medium};
  }
`;

const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <StyledSheetFooter ref={ref} {...props}>
    {children}
  </StyledSheetFooter>
));
SheetFooter.displayName = 'SheetFooter';

const StyledSheetScrollableContent = styled(ScrollArea)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const SheetScrollableContent = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>(({ children, ...props }, ref) => (
  <StyledSheetScrollableContent ref={ref} {...props}>
    {children}
  </StyledSheetScrollableContent>
));
SheetScrollableContent.displayName = 'SheetScrollableContent';

const StyledSheetTitle = styled(Text)`
  line-height: 1;
`;

const StyledSheetDescription = styled(Text)`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & {
    type?: keyof typeof TextTypes;
  }
>(({ type = TextTypes.Heading4, children, ...props }, ref) => (
  <SheetPrimitive.Title asChild ref={ref} {...props}>
    <StyledSheetTitle tag="h2" type={type}>
      {children}
    </StyledSheetTitle>
  </SheetPrimitive.Title>
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> & {
    type?: keyof typeof TextTypes;
  }
>(({ type = TextTypes.Body5, children, ...props }, ref) => (
  <SheetPrimitive.Description asChild ref={ref} {...props}>
    <StyledSheetDescription type={type}>{children}</StyledSheetDescription>
  </SheetPrimitive.Description>
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetScrollableContent,
  SheetTitle,
  SheetTrigger,
};
