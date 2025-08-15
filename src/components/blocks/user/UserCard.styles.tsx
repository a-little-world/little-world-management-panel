import { Tag, Text } from '@a-little-world/little-world-design-system';
import styled, { css } from 'styled-components';

export const StyledCard = styled.div<{ $horizontal?: boolean }>`
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

  ${({ theme, $horizontal }) =>
    $horizontal
      ? css`
          gap: ${theme.spacing.xlarge};
        `
      : css`
          flex-direction: column;
          gap: ${theme.spacing.small};
        `}
`;

export const UnresponsiveWarning = styled.div`
  width: 90%;
  padding: 0.5rem;
  z-index: 10;
  position: absolute;
  top: 0.75rem;
  right: 50%;
  transform: translateX(50%);
  max-width: 100%;
  background-color: ${({ theme }) => theme.color.error};
  font-size: 1.5rem;
  text-align: center;
  border-radius: 0.375rem;
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
  font-size: ${({ $tiny }) => ($tiny ? '0.75rem' : '1.5rem')};
`;

export const UserInfoContainer = styled.div<{ $partial?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  ${({ $partial }) => $partial && 'align-items: flex-start;'}
`;

export const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
`;

export const MatchesContainer = styled.div<{ $partial?: boolean }>`
  width: 100%;
  font-size: 0.75rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  border-color: blue;

  ${({ $partial }) => $partial && 'align-items: flex-start;'}
`;

export const StatusContainer = styled.div`
  width: 100%;
  @media (min-width: 768px) {
    width: 50%;
  }
  background: white;
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

export const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: start;
  margin-top: 0.5rem;
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

export const DetailsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: start;
  justify-content: start;
`;

export const ActionContainer = styled.div<{ $horizontal?: boolean }>`
  display: flex;
  gap: 1rem;
  z-index: 50;
  ${({ $horizontal }) =>
    $horizontal
      ? css`
          flex-direction: column;
        `
      : css`
          align-items: center;
          margin-top: 0.5rem;
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
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
  width: 100%;
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
`;
