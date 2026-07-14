import { Tag, Text, TextTypes } from '@a-little-world/little-world-design-system';
import styled, { css } from 'styled-components';

export const StyledCard = styled.div<{ $horizontal?: boolean; $full?: boolean }>`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.color.surface.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.large};
  height: fit-content;

  ${({ theme, $full }) =>
    $full &&
    css`
      flex-direction: column;
      align-items: stretch;
      gap: ${theme.spacing.medium};
      padding: ${theme.spacing.large} ${theme.spacing.xxlarge};
      background: ${theme.color.surface.primary};
      border-radius: ${theme.radius.small};
    `}

  ${({ theme, $horizontal, $full }) =>
    !$full &&
    ($horizontal
      ? css`
          gap: ${theme.spacing.xlarge};
        `
      : css`
          flex-direction: column;
          gap: ${theme.spacing.small};
        `)}
`;

export const UnresponsiveWarning = styled.div`
  width: 90%;
  padding: ${({ theme }) => theme.spacing.xsmall};
  z-index: 10;
  position: absolute;
  top: ${({ theme }) => theme.spacing.xsmall};
  right: 50%;
  transform: translateX(50%);
  max-width: 100%;
  background-color: ${({ theme }) => theme.color.error};
  font-size: 1.5rem;
  text-align: center;
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
`;

export const HeaderContainer = styled.div`
  width: 100%;
  height: fit-content;
  padding: ${({ theme }) => theme.spacing.xsmall};
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
`;

export const ProfileHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
`;

export const ProfileIdentity = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const ImageContainer = styled.div`
  height: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const UserNameContainer = styled.div<{ $tiny?: boolean }>`
  width: 100%;
  height: fit-content;
  text-align: center;
  margin: 0 auto;
  font-size: ${({ $tiny }) => ($tiny ? '0.75rem' : '1.5rem')};
`;

export const FullName = styled(Text).attrs({
  type: TextTypes.Body3,
  tag: 'span' as const,
  bold: true,
})``;

export const UserInfoContainer = styled.div<{ $partial?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xsmall};

  ${({ $partial }) => $partial && 'align-items: flex-start;'}
`;

export const FullContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: ${({ theme }) => theme.spacing.large};

  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  }
`;

export const DetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  min-width: 0;
`;

export const SidebarColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  min-width: 0;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: ${({ theme }) => theme.spacing.medium};
  row-gap: ${({ theme }) => theme.spacing.xxsmall};

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  padding-top: ${({ theme }) => theme.spacing.xsmall};
  border-top: ${({ theme }) => theme.color.border.subtle} solid 1px;
`;

export const SectionLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const InfoRowWrap = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

export const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

export const InfoGridRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

export const MetaFieldGroup = styled.span`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

export const MatchesContainer = styled.div<{ $partial?: boolean }>`
  width: 100%;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  align-items: flex-start;

  ${({ $partial }) => $partial && 'align-items: flex-start;'}
`;

export const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
`;

export const StatusContainer = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const ActionContainer = styled.div<{ $horizontal?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
  z-index: 50;

  ${({ $horizontal }) =>
    $horizontal
      ? css`
          flex-direction: column;
        `
      : css`
          align-items: center;
          margin-top: ${({ theme }) => theme.spacing.xsmall};
        `}
`;

export const BucketTag = styled(Tag)<{ $horizontal?: boolean }>`
  ${({ $horizontal }) =>
    $horizontal &&
    css`
      position: absolute;
      top: 64px;
    `}
`;

export const AboutField = styled(Text)`
  width: 100%;
  background: ${({ theme }) => theme.color.surface.secondary};
  padding: ${({ theme }) => theme.spacing.xsmall};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
`;

export const ViewProfileLink = styled.div`
  width: 100%;
`;

export const AvailabilityGrid = styled.div`
  width: 100%;
  overflow-x: auto;
`;
