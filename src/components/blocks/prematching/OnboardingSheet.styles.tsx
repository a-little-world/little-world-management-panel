import { Text } from '@a-little-world/little-world-design-system';
import styled from 'styled-components';

import { ScrollArea } from '../../atoms/ScrollArea';

export const AppointmentDateText = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
`;

export const UserListContainer = styled(ScrollArea)<{ $setHeight: boolean }>`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  max-height: 200px;
  overflow: hidden;
  ${({ $setHeight }) => $setHeight && 'height: 200px;'}
`;

export const UserListSectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const UserListItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.minimal};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.color.surface.secondary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const Checkbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.small};
  cursor: pointer;
`;

export const UserName = styled(Text)`
  flex: 1;
`;

export const SectionTitle = styled(Text)`
  line-height: 1;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
  color: ${({ theme }) => theme.color.text.primary};
`;

export const SectionDescription = styled(Text)`
  color: ${({ theme }) => theme.color.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
`;

export const StatsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

export const StatNumber = styled(Text)`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.highlight};
`;

export const StatLabel = styled(Text)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.text.error};
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.error};
  border-radius: ${({ theme }) => theme.radius.small};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

export const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.color.text.success};
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.success};
  border-radius: ${({ theme }) => theme.radius.small};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;
