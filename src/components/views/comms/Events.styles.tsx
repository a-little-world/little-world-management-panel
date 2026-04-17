import styled from 'styled-components';

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

export const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.spacing.medium};
  margin-top: ${({ theme }) => theme.spacing.medium};
`;

export const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  margin-top: ${({ theme }) => theme.spacing.small};
`;

export const EventMetaRow = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const EventImage = styled.img`
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.small};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

export const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
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
