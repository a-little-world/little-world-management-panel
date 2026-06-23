import {
  ProgressBar,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';

import { ExportDownloadFormat } from './DownloadSettingsModal';
import { Button } from '../atoms/Button';

type ExportStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PaginatedExportMeta {
  totalPages: number;
  pageSize: number;
  totalItems?: number;
}

export interface PaginatedCsvDownloaderHandle {
  startPreparation: () => Promise<void>;
}

interface PaginatedCsvDownloaderProps<RowType extends Record<string, any>> {
  downloadFormat: ExportDownloadFormat;
  selectedHeaders: string[];
  fileName: string;
  resetToken?: string;
  fetchMeta: () => Promise<PaginatedExportMeta>;
  fetchPage: (params: { page: number; pageSize: number }) => Promise<RowType[]>;
  onError?: (error: unknown) => void;
}

const StatusWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.small};
  padding: 0 ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.small};
`;

const StatusCard = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.subtle};
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  flex-wrap: wrap;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text.tertiary};
  padding: 0 ${({ theme }) => theme.spacing.xxxsmall};
  line-height: 1;
  font-size: 18px;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const LabelText = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const ValueText = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'span' as const,
})`
  font-weight: 600;
`;

const ProgressRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ErrorText = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'p' as const,
})`
  color: ${({ theme }) => theme.color.text.error};
`;

const resolveValueByHeader = (row: Record<string, any>, header: string) =>
  header.split('.').reduce((value, key) => value?.[key], row);

const toCsvValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }

  const normalizedValue =
    typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (
    normalizedValue.includes(',') ||
    normalizedValue.includes('"') ||
    normalizedValue.includes('\n')
  ) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
};

const triggerBrowserDownload = (url: string, fileName: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
};

const resolveFileNameByFormat = (
  fileName: string,
  format: ExportDownloadFormat,
) => {
  if (fileName.endsWith('.csv') || fileName.endsWith('.json')) {
    return fileName.replace(/\.(csv|json)$/i, `.${format}`);
  }
  return `${fileName}.${format}`;
};

const statusTitles: Record<ExportStatus, string> = {
  idle: 'Idle',
  loading: 'Preparing export',
  ready: 'Export ready',
  error: 'Export failed',
};

export const PaginatedCsvDownloader = forwardRef(
  <RowType extends Record<string, any>>(
    {
      downloadFormat,
      selectedHeaders,
      fileName,
      resetToken,
      fetchMeta,
      fetchPage,
      onError,
    }: PaginatedCsvDownloaderProps<RowType>,
    ref: React.ForwardedRef<PaginatedCsvDownloaderHandle>,
  ) => {
    const [status, setStatus] = useState<ExportStatus>('idle');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const clearDownloadUrl = useCallback(() => {
      setDownloadUrl(previousUrl => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }
        return null;
      });
    }, []);

    const resetState = useCallback(() => {
      clearDownloadUrl();
      setStatus('idle');
      setCurrentPage(0);
      setTotalPages(0);
      setTotalItems(undefined);
      setErrorMessage(null);
    }, [clearDownloadUrl]);

    useEffect(() => {
      resetState();
    }, [resetToken, resetState]);

    useEffect(() => clearDownloadUrl, [clearDownloadUrl]);

    const prepareCsv = useCallback(async () => {
      if (selectedHeaders.length === 0) {
        setStatus('error');
        setErrorMessage('Select at least one column before preparing the export.');
        return;
      }

      resetState();
      setStatus('loading');

      try {
        const meta = await fetchMeta();
        const normalizedTotalPages = Math.max(meta.totalPages, 1);

        setTotalPages(normalizedTotalPages);
        setTotalItems(meta.totalItems);

        const allRows: RowType[] = [];
        for (let page = 1; page <= normalizedTotalPages; page += 1) {
          const pageRows = await fetchPage({ page, pageSize: meta.pageSize });
          allRows.push(...pageRows);
          setCurrentPage(page);
        }

        const blob =
          downloadFormat === 'json'
            ? new Blob(
                [
                  JSON.stringify(
                    allRows.map(row =>
                      selectedHeaders.reduce<Record<string, unknown>>(
                        (acc, header) => {
                          acc[header] = resolveValueByHeader(row, header);
                          return acc;
                        },
                        {},
                      ),
                    ),
                    null,
                    2,
                  ),
                ],
                {
                  type: 'application/json;charset=utf-8;',
                },
              )
            : new Blob(
                [
                  [
                    selectedHeaders.join(','),
                    ...allRows.map(row =>
                      selectedHeaders
                        .map(header => toCsvValue(resolveValueByHeader(row, header)))
                        .join(','),
                    ),
                  ].join('\n'),
                ],
                {
                  type: 'text/csv;charset=utf-8;',
                },
              );
        const preparedDownloadUrl = URL.createObjectURL(blob);
        setDownloadUrl(preparedDownloadUrl);
        setStatus('ready');
      } catch (error: unknown) {
        setStatus('error');
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to prepare export. Please try again.';
        setErrorMessage(message);
        onError?.(error);
      }
    }, [downloadFormat, fetchMeta, fetchPage, onError, resetState, selectedHeaders]);

    useImperativeHandle(
      ref,
      () => ({
        startPreparation: prepareCsv,
      }),
      [prepareCsv],
    );

    const progressValue = useMemo(() => {
      if (!totalPages) {
        return 0;
      }
      return Math.round((currentPage / totalPages) * 100);
    }, [currentPage, totalPages]);

    if (status === 'idle') {
      return null;
    }

    return (
      <StatusWrapper>
        <StatusCard>
          <StatusHeader>
            <Text type={TextTypes.Body6}>{statusTitles[status]}</Text>
            <HeaderRight>
              <LabelText>
                {currentPage > 0 && totalPages > 0
                  ? `Page ${currentPage}/${totalPages}`
                  : 'Page 0/0'}
              </LabelText>
              <CloseButton
                type="button"
                aria-label="Close export status"
                onClick={resetState}
              >
                ×
              </CloseButton>
            </HeaderRight>
          </StatusHeader>

          {status === 'loading' && (
            <ProgressRow>
              <ValueText>
                {progressValue}% complete
                {typeof totalItems === 'number' ? ` - ${totalItems} users` : ''}
              </ValueText>
              <ProgressBar max={100} value={progressValue} />
            </ProgressRow>
          )}

          {status === 'ready' && downloadUrl && (
            <>
              <Text type={TextTypes.Body6}>
                CSV is prepared and ready to download.
              </Text>
              <ActionsRow>
                <Button
                  onClick={() =>
                    triggerBrowserDownload(
                      downloadUrl,
                      resolveFileNameByFormat(fileName, downloadFormat),
                    )
                  }
                >
                  Download {downloadFormat.toUpperCase()}
                </Button>
              </ActionsRow>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorText>{errorMessage || 'Failed to prepare export.'}</ErrorText>
              <ActionsRow>
                <Button
                  variant="secondary"
                  onClick={prepareCsv}
                >
                  Retry
                </Button>
              </ActionsRow>
            </>
          )}
        </StatusCard>
      </StatusWrapper>
    );
  },
);

PaginatedCsvDownloader.displayName = 'PaginatedCsvDownloader';
