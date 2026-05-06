import styled from 'styled-components';

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ReportsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
`;

export const DownloadBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  align-items: flex-start;
  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing.small};
  padding-bottom: ${({ theme }) => theme.spacing.medium};
`;

export const DownloadContentRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.medium};
`;

export const DownloadControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  align-items: flex-start;
`;

export const OverviewPanel = styled.div`
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
