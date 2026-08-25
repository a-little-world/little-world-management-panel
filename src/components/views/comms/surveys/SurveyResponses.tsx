import {
  Loading,
  LoadingSizes,
  Select,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  ADMIN_SURVEY_RESPONSES_ENDPOINT,
  AdminSurveyResponse,
  fetchSurveyResponses,
  SurveyResponseStatus,
} from '../../../../api/surveys';
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

const STATUS_APPEARANCE: Record<SurveyResponseStatus, TagAppearance> = {
  submitted: TagAppearance.success,
  shown: TagAppearance.outline,
  dismissed: TagAppearance.outline,
  expired: TagAppearance.outline,
};

const statusLabel = (status: SurveyResponseStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

function SurveyResponses() {
  const [searchParams, setSearchParams] = useSearchParams({ page_size: '50' });

  const search = searchParams.get('search') || '';
  const campaign = searchParams.get('campaign') || 'all';
  const status = searchParams.get('status') || 'all';

  const { data, error, isLoading } = useSWR(
    [ADMIN_SURVEY_RESPONSES_ENDPOINT, searchParams.toString()] as const,
    ([, queryString]) => {
      const query = new URLSearchParams(queryString);
      query.delete('tab');
      return fetchSurveyResponses(query.toString());
    },
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

  const formatDateTime = (value: string | null) =>
    value ? new Date(value).toLocaleString('en-GB') : '—';

  const campaignOptions = [
    { label: 'All campaigns', value: 'all' },
    ...(data?.campaign_options ?? []),
  ];
  if (
    campaign !== 'all' &&
    !campaignOptions.some(option => option.value === campaign)
  ) {
    campaignOptions.push({ label: `Campaign #${campaign}`, value: campaign });
  }
  const statusOptions = [
    { label: 'All statuses', value: 'all' },
    ...(data?.status_options ?? []),
  ];

  return (
    <PageContainer>
      <FiltersToolbar
        showSearchBar
        searchPlaceholder="Search by email"
        searchDefaultValue={search}
        onSearchSubmit={(value: string) => updateSearchParam('search', value)}
        paginationList={data}
        isLoading={isLoading}
        loadingText="Loading survey responses..."
      >
        <Select
          id="survey-response-campaign"
          label="Campaign"
          value={campaign}
          options={campaignOptions}
          onValueChange={val => updateSearchParam('campaign', val)}
          placeholder="Campaign"
          cannotError
          maxWidth="220px"
        />
        <Select
          id="survey-response-status"
          label="Status"
          value={status}
          options={statusOptions}
          onValueChange={val => updateSearchParam('status', val)}
          placeholder="Status"
          cannotError
          maxWidth="180px"
        />
      </FiltersToolbar>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load survey responses.
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
                  No responses match the current filters.
                </Text>
              )}
            </NoResultsContainer>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="text-center">Shown</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((row: AdminSurveyResponse) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.campaign_name}</TableCell>
                    <TableCell>
                      <Link to={`/user/${row.user_id}`}>
                        {row.user_email || `User #${row.user_id}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Tag appearance={STATUS_APPEARANCE[row.status]}>
                        {statusLabel(row.status)}
                      </Tag>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.rating ?? '—'}
                    </TableCell>
                    <TableCell>{row.comment || '—'}</TableCell>
                    <TableCell className="text-center">
                      {row.shown_count}
                    </TableCell>
                    <TableCell>{formatDateTime(row.created_at)}</TableCell>
                    <TableCell>{formatDateTime(row.submitted_at)}</TableCell>
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

export default SurveyResponses;
