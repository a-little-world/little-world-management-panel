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

export const NoResultsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  justify-content: center;
  align-items: center;
`;
