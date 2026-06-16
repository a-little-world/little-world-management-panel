import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import * as React from 'react';
import styled, { css } from 'styled-components';

const StyledSection = styled.div<{ $fullHeight?: boolean }>`
  background-color: var(--bg-card);
  color: var(--text-card-foreground);
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  ${({ $fullHeight }) => $fullHeight && 'height: 100%;'}
`;

const StyledSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  gap: 1rem;
`;

const StyledSectionTitle = styled(Text)<{ $inactive?: boolean }>`
  line-height: 1;
  ${({ $inactive, theme }) =>
    $inactive &&
    css`
      color: ${theme.color.text.error};
    `}
`;

const StyledSectionDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-muted-foreground);
`;

const StyledSectionContent = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  width: 100%;
`;

const StyledSectionFooter = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  padding-top: 0;
`;

const Section = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { fullHeight?: boolean }
>(({ className, fullHeight, ...props }, ref) => (
  <StyledSection
    ref={ref}
    className={className}
    $fullHeight={fullHeight}
    {...props}
  />
));
Section.displayName = 'Section';

const SectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <StyledSectionHeader ref={ref} className={className} {...props} />
));
SectionHeader.displayName = 'SectionHeader';

const SectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, inactive, ...props }, ref) => (
  <StyledSectionTitle
    ref={ref}
    className={className}
    type={TextTypes.Heading5}
    $inactive={inactive}
    {...props}
  />
));
SectionTitle.displayName = 'SectionTitle';

const SectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <StyledSectionDescription ref={ref} className={className} {...props} />
));
SectionDescription.displayName = 'SectionDescription';

const SectionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <StyledSectionContent ref={ref} className={className} {...props} />
));
SectionContent.displayName = 'SectionContent';

const SectionFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <StyledSectionFooter ref={ref} className={className} {...props} />
));
SectionFooter.displayName = 'SectionFooter';

export {
  Section,
  SectionContent,
  SectionDescription,
  SectionFooter,
  SectionHeader,
  SectionTitle,
};
