import styled from 'styled-components';

import { DatePickerContainer as SharedDatePickerContainer } from '../../../atoms/FormLayout';

export const ColDateTime = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const ColDate = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

export const ColTime = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const ColTitle = styled.div`
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ColMuted = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const ColMutedStart = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Event modal: date + times wrap on narrow widths. */
export const EventModalScheduleRow = styled(SharedDatePickerContainer)`
  flex-wrap: wrap;
`;

export const EventModalCardHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
  flex-wrap: wrap;
`;

export const EventModalLayout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.medium};
  grid-template-columns: 1fr;
  width: 100%;
  align-items: start;

  @media (min-width: 56em) {
    grid-template-columns: minmax(0, 1fr) 15.75rem;
    column-gap: ${({ theme }) => theme.spacing.large};
  }
`;

export const EventModalPrimary = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  min-width: 0;
  width: 100%;
`;

export const EventModalAside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  min-width: 0;
  width: 100%;
`;

export const EventModalSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  min-width: 0;
`;

export const EventModalSectionLabel = styled.h2`
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const EventModalFieldPair = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.small};
  grid-template-columns: 1fr;
  width: 100%;

  @media (min-width: 32em) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const TimeInput = styled.input.attrs({
  type: 'time',
})`
  padding: ${({ theme }) => theme.spacing.xsmall};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  font-size: 0.875rem;
  width: 100%;
`;

