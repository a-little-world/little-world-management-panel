import {
  Button,
  ButtonVariations,
  Modal,
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React, { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Link, useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import { dataFetcher } from '../../../store';
import EmailDeliveryStatusTag, {
  EmailDeliveryStatus,
} from '../../atoms/EmailDeliveryStatusTag';
import {
  DateRangePicker,
  formatLocalDateYmd,
  parseYmdToLocalDate,
} from '../../atoms/DateRangePicker';
import FiltersToolbar from '../../blocks/FiltersToolbar';
import { DataTable } from '../../blocks/DataTable';
import { formatDateTime } from '../../../helpers/date';

interface EmailLogReceiver {
  // null when the address has no user account (e.g. Patenmatch emails)
  id: number | null;
  email: string;
}

interface EmailLogRow {
  id: number;
  time: string;
  template: string;
  receiver: EmailLogReceiver | null;
  delivery_status: EmailDeliveryStatus;
  retrieve: string | null;
}

interface EmailLogResponse {
  results: EmailLogRow[];
  page_size: number;
  pages_total: number;
  results_total: number;
  page: number;
  first_page: number;
  last_page: number;
  items_total: number;
  count: number;
  next_page: number | null;
  previous_page: number | null;
}

const ALL_TEMPLATES = 'ALL';

export const EMAIL_LOG_PARAMS = [
  'page',
  'page_size',
  'date_from',
  'date_to',
  'template',
];

const PreviewFrame = styled.iframe`
  width: min(90vw, 900px);
  height: 85vh;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.color.surface.primary};
`;

const columnHelper = createColumnHelper<EmailLogRow>();

function buildColumns(
  onViewEmail: (emailUrl: string) => void,
): ColumnDef<EmailLogRow, any>[] {
  return [
    columnHelper.accessor('time', {
      header: 'Sent at',
      cell: ({ getValue }) => (
        <Text type={TextTypes.Body6} tag="span">
          {formatDateTime(getValue())}
        </Text>
      ),
    }),
    columnHelper.accessor('template', {
      header: 'Template',
      cell: ({ getValue }) => (
        <Text type={TextTypes.Body6} tag="span">
          {getValue() || '—'}
        </Text>
      ),
    }),
    columnHelper.accessor('receiver', {
      header: 'Recipient',
      cell: ({ getValue }) => {
        const receiver = getValue();
        if (receiver?.id) {
          return <Link to={`/user/${receiver.id}`}>{receiver.email}</Link>;
        }
        return (
          <Text type={TextTypes.Body6} tag="span">
            {receiver?.email ?? '—'}
          </Text>
        );
      },
    }),
    columnHelper.accessor('delivery_status', {
      header: 'Status',
      cell: ({ getValue }) => <EmailDeliveryStatusTag status={getValue()} />,
    }),
    columnHelper.display({
      id: 'view',
      header: '',
      cell: ({ row }) =>
        row.original.retrieve ? (
          <Button
            variation={ButtonVariations.Inline}
            onClick={() => onViewEmail(row.original.retrieve as string)}
          >
            View Email
          </Button>
        ) : (
          <Text type={TextTypes.Body6} tag="span">
            Unavailable
          </Text>
        ),
    }),
  ];
}

const EmailLogTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewEmail, setViewEmail] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const theme = useTheme();

  const requestParams = new URLSearchParams();
  for (const key of EMAIL_LOG_PARAMS) {
    const value = searchParams.get(key);
    if (value) requestParams.set(key, value);
  }

  const {
    data: emailLogs,
    error,
    isLoading,
  } = useSWR<EmailLogResponse>(
    `/api/matching/emails/logs/?${requestParams.toString()}`,
    dataFetcher,
  );
  const { data: templates } = useSWR<string[]>(
    '/api/matching/emails/logs/templates/',
    dataFetcher,
  );

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const from = searchParams.get('date_from');
  const to = searchParams.get('date_to');
  const dateRange: DateRange | undefined =
    from || to
      ? {
          from: from ? parseYmdToLocalDate(from) : undefined,
          to: to ? parseYmdToLocalDate(to) : undefined,
        }
      : undefined;

  const onDateRangeChange = (range: DateRange | undefined) => {
    updateFilters({
      date_from: range?.from ? formatLocalDateYmd(range.from) : null,
      date_to: range?.to ? formatLocalDateYmd(range.to) : null,
    });
  };

  const onViewEmail = async (emailUrl: string) => {
    setPreviewError(null);
    try {
      const response = await fetch(emailUrl);
      if (!response.ok) throw new Error('Failed to load the email preview.');
      setViewEmail(await response.text());
    } catch (previewFetchError) {
      setPreviewError(
        previewFetchError instanceof Error
          ? previewFetchError.message
          : 'Failed to load the email preview.',
      );
    }
  };

  const columns = buildColumns(onViewEmail);
  const selectedTemplate = searchParams.get('template');
  // Keep a template that is no longer configured selectable when linked to directly
  const templateNames =
    selectedTemplate && !templates?.includes(selectedTemplate)
      ? [selectedTemplate, ...(templates ?? [])]
      : (templates ?? []);
  const templateOptions = [
    { value: ALL_TEMPLATES, label: 'All templates' },
    ...templateNames.map(template => ({
      value: template,
      label: template,
    })),
  ];

  return (
    <>
      <FiltersToolbar
        paginationList={emailLogs}
        isLoading={isLoading}
        showPageSizeDropdown={false}
        withoutPadding
      >
        <Select
          label="Template"
          value={selectedTemplate ?? ALL_TEMPLATES}
          options={templateOptions}
          onValueChange={value =>
            updateFilters({
              template: value === ALL_TEMPLATES ? null : value,
            })
          }
          placeholder="Template"
          maxWidth="320px"
          cannotError
        />
        <DateRangePicker
          label="Sent date"
          range={dateRange}
          setRange={onDateRangeChange}
          clearLabel="Clear"
        />
      </FiltersToolbar>

      {error && (
        <Text color={theme.color.status.error}>Error loading email logs.</Text>
      )}
      {previewError && (
        <Text color={theme.color.status.error}>{previewError}</Text>
      )}
      {!error && (
        <DataTable columns={columns} data={emailLogs?.results ?? []} />
      )}

      <Modal open={viewEmail !== null} onClose={() => setViewEmail(null)}>
        {viewEmail && (
          <PreviewFrame title="Email preview" srcDoc={viewEmail} sandbox="" />
        )}
      </Modal>
    </>
  );
};

export default EmailLogTab;
