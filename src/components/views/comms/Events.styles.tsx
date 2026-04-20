import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  max-height: calc(100dvh - 5rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`;

export const Description = styled.p`
  color: ${({ theme }) => theme.color.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xsmall};
  margin-bottom: 0;
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const ListPanel = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.color.surface.primary};
  overflow: hidden;
`;

export const ListScroll = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

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

export const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

/** Event modal: date + times wrap on narrow widths. */
export const EventModalScheduleRow = styled(DatePickerContainer)`
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

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  flex: 1;
`;

export const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
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
