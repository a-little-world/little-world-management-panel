import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  DatePickerContainer as BaseDatePickerContainer,
  FormField as BaseFormField,
  FormLabel as BaseFormLabel,
} from '../../atoms/FormLayout';
import { StatCards } from '../../atoms/stats/StatCard';

export { StatCard, StatLabel, StatValue } from '../../atoms/stats/StatCard';

// Shared layout
export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  max-height: calc(100vh - ${({ theme }) => theme.spacing.large});
  overflow-y: auto;
  box-sizing: border-box;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const TitleWithFlex = styled(Title)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const Description = styled.p`
  color: ${({ theme }) => theme.color.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

// Sections
export const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  flex-wrap: wrap;
`;

export const SectionTitleFlush = styled(SectionTitle)`
  margin-bottom: 0;
`;

export const SectionTitleClickable = styled(SectionTitle)`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
`;

// Stats — layout variants specific to RandomCalls
export const StatsGrid = StatCards;

export const StatsGridTight = styled(StatCards)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const StatCardSecondary = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

export const StatValueSmall = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

// Schedule (Schedule tab)
export const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const ScheduleItem = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 8px;
  background: ${({ theme }) => theme.color.surface.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const ScheduleItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const ScheduleDate = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 0.875rem;
`;

export const ScheduleTime = styled.div`
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.875rem;
`;

export const ScheduleStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const ScheduleLink = styled(Link)`
  margin-top: ${({ theme }) => theme.spacing.small};
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: underline;
  font-size: 0.875rem;

  &:hover {
    opacity: 0.8;
  }
`;

// Form (Create Lobby modal)
export const DatePickerContainer = styled(BaseDatePickerContainer)``;

export const FormField = styled(BaseFormField)`
  gap: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const FormLabel = styled(BaseFormLabel)``;

export const TimeInput = styled.input.attrs({
  type: 'time',
})`
  padding: ${({ theme }) => theme.spacing.xsmall};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100%;
`;

// History (dropdown)
export const DropdownContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

// Management (tasks / collapsible)
export const CollapsibleContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? '10000px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease-out;
`;

export const TaskDetailRow = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background: ${({ theme }) => theme.color.surface.secondary};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

export const TaskDetailSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const TaskDetailLabel = styled.div`
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
  color: ${({ theme }) => theme.color.text.primary};
  font-family: sans-serif;
`;
