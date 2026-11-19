import styled from 'styled-components';

import { TableRow } from '../../../atoms/Table';

export const SummarySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  margin: ${({ theme }) => theme.spacing.small} 0;
`;

export const ClickableRow = styled(TableRow)`
  cursor: pointer;
`;

export const AnswerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  padding-right: ${({ theme }) => theme.spacing.small};
`;

export const AnswerBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;
