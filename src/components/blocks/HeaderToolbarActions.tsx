import styled from 'styled-components';

export const HeaderToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  flex-shrink: 0;
`;
