import {
  Select,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { format } from 'date-fns';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  ADMIN_SHORT_LINK_CLICKS_ENDPOINT,
  AdminShortLinkClick,
  fetchAdminShortLinkClicks,
} from '../../../../api/shortLinks';
import { DatePicker } from '../../../atoms/DatePicker';
import {
  ListPanel,
  ListScroll,
  NoResultsContainer,
  PageContainer,
} from '../../../atoms/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../atoms/Table';
import { FiltersToolbar } from '../../../blocks/FiltersToolbar';

function parseDateParam(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function LinkClicks() {
  const [searchParams, setSearchParams] = useSearchParams({ page_size: '50' });

  const search = searchParams.get('search') || '';
  const source = searchParams.get('source') || 'all';
  const startDate = parseDateParam(searchParams.get('start_date'));
  const endDate = parseDateParam(searchParams.get('end_date'));

  const { data, error, isLoading } = useSWR(
    [ADMIN_SHORT_LINK_CLICKS_ENDPOINT, searchParams.toString()] as const,
    ([, queryString]) => fetchAdminShortLinkClicks(queryString),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const updateSearchParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    if (!value || value === 'all') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const onDateChange = (key: 'start_date' | 'end_date', value: Date | null) => {
    updateSearchParam(key, value ? format(value, 'yyyy-MM-dd') : '');
  };

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-GB');

  const sourceOptions = [
    { label: 'All sources', value: 'all' },
    ...(data?.source_options ?? []),
  ];

  return (
    <PageContainer>
      <FiltersToolbar
        showSearchBar
        searchPlaceholder="Search by tag"
        searchDefaultValue={search}
        onSearchSubmit={(value: string) => updateSearchParam('search', value)}
        paginationList={data}
        isLoading={isLoading}
        loadingText="Loading short link clicks..."
      >
        <Select
          id="short-link-click-source"
          label="Source"
          value={source}
          options={sourceOptions}
          onValueChange={val => updateSearchParam('source', val)}
          placeholder="Source"
          cannotError
          maxWidth="180px"
        />

        <DatePicker
          label="Start"
          date={startDate}
          setDate={date => onDateChange('start_date', date)}
        />
        <DatePicker
          label="End"
          date={endDate}
          setDate={date => onDateChange('end_date', date)}
        />
      </FiltersToolbar>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load short link clicks.
        </StatusMessage>
      )}

      <ListPanel>
        <ListScroll>
          {isLoading || !data || data.results.length === 0 ? (
            <NoResultsContainer>
              {isLoading ? (
                <Loading size={LoadingSizes.Medium} />
              ) : (
                <Text type={TextTypes.Body4}>
                  No clicks match the current filters.
                </Text>
              )}
            </NoResultsContainer>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((click: AdminShortLinkClick) => (
                  <TableRow key={click.id}>
                    <TableCell>{click.tag}</TableCell>
                    <TableCell>{click.user}</TableCell>
                    <TableCell>{formatDateTime(click.created_at)}</TableCell>
                    <TableCell>{click.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ListScroll>
      </ListPanel>
    </PageContainer>
  );
}

export default LinkClicks;
