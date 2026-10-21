import {
  Button,
  ButtonAppearance,
  ButtonSizes,
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
import { isValid } from 'date-fns';
import React, { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  ADMIN_SURVEY_RESPONSES_ENDPOINT,
  AdminSurveyResponse,
  fetchSurveyResponses,
  fetchSurveyResponsesCsv,
  LocalizedText,
  SurveyAnswerValue,
  SurveyQuestion,
  SurveyResponseStatus,
} from '../../../../api/surveys';
import { formatBerlinDateTime } from '../../../../helpers/berlinDates';
import { downloadCsv } from '../../../../helpers/csv';
import {
  DateRangePicker,
  formatLocalDateYmd,
  parseYmdToLocalDate,
} from '../../../atoms/DateRangePicker';
import {
  ListPanel,
  ListScroll,
  NoResultsContainer,
  PageContainer,
} from '../../../atoms/PageLayout';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetScrollableContent,
  SheetTitle,
} from '../../../atoms/Sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../atoms/Table';
import Stat, { StatCards } from '../../../atoms/stats/Stat';
import { FiltersToolbar } from '../../../blocks/FiltersToolbar';
import {
  AnswerBlock,
  AnswerList,
  ClickableRow,
  SummarySection,
} from './SurveyResponses.styles';

const STATUS_APPEARANCE: Record<SurveyResponseStatus, TagAppearance> = {
  submitted: TagAppearance.success,
  shown: TagAppearance.outline,
  dismissed: TagAppearance.outline,
  expired: TagAppearance.outline,
};

const statusLabel = (status: SurveyResponseStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const parseDateParam = (value: string | null) => {
  if (!value) return undefined;
  const date = parseYmdToLocalDate(value);
  return isValid(date) ? date : undefined;
};

const copyText = (value?: LocalizedText) =>
  value?.de?.trim() || value?.en?.trim() || '';

const describeDelivery = (row: AdminSurveyResponse) =>
  row.delivery_channel === 'link' ? 'Link' : `Popup · ${row.shown_count}`;

const optionLabel = (question: SurveyQuestion, value: string) => {
  const match = (question.options ?? []).find(option => option.value === value);
  return copyText(match?.label) || value;
};

const formatAnswer = (
  question: SurveyQuestion,
  value: SurveyAnswerValue | undefined,
): string | null => {
  if (value === undefined || value === null) return null;
  if (question.type === 'rating' && typeof value === 'number') {
    return `${value} / ${question.scale ?? 5}`;
  }
  if (question.type === 'choice' && typeof value === 'string') {
    return optionLabel(question, value);
  }
  if (question.type === 'multiselect' && Array.isArray(value)) {
    if (!value.length) return null;
    return value.map(item => optionLabel(question, item)).join(', ');
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  return String(value);
};

function SurveyResponses() {
  const [searchParams, setSearchParams] = useSearchParams({ page_size: '50' });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const campaign = searchParams.get('campaign') || 'all';
  const status = searchParams.get('status') || 'all';
  const rangeFrom = parseDateParam(searchParams.get('start_date'));
  const rangeTo = parseDateParam(searchParams.get('end_date'));
  const dateRange: DateRange | undefined =
    rangeFrom || rangeTo ? { from: rangeFrom, to: rangeTo } : undefined;

  const { data, error, isLoading } = useSWR(
    [ADMIN_SURVEY_RESPONSES_ENDPOINT, searchParams.toString()] as const,
    ([, queryString]) => {
      const query = new URLSearchParams(queryString);
      query.delete('tab');
      return fetchSurveyResponses(query.toString());
    },
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const selected = data?.results.find(row => row.id === selectedId) ?? null;

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

  const updateDateRange = (range: DateRange | undefined) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    if (range?.from) {
      nextParams.set('start_date', formatLocalDateYmd(range.from));
    } else {
      nextParams.delete('start_date');
    }
    if (range?.to) {
      nextParams.set('end_date', formatLocalDateYmd(range.to));
    } else {
      nextParams.delete('end_date');
    }
    setSearchParams(nextParams);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    const exportParams = new URLSearchParams(searchParams);
    exportParams.delete('tab');
    exportParams.delete('page');
    exportParams.delete('page_size');
    try {
      const csv = await fetchSurveyResponsesCsv(exportParams.toString());
      downloadCsv(
        csv,
        `survey-responses-${formatLocalDateYmd(new Date())}.csv`,
      );
    } catch (exportError) {
      setDownloadError(
        exportError instanceof Error && exportError.message
          ? exportError.message
          : 'Failed to export survey responses.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

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

  const summary = data?.summary;
  const campaignName =
    campaignOptions.find(option => option.value === campaign)?.label ??
    data?.results[0]?.campaign_name ??
    'this campaign';

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
        showDownloadButton
        downloadDisabled={
          isDownloading || isLoading || !data || data.results_total === 0
        }
        onDownloadClick={handleDownload}
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
        <DateRangePicker
          label="Created date"
          tooltipText="Includes responses created on these Berlin calendar dates."
          range={dateRange}
          setRange={updateDateRange}
          clearLabel="Clear"
        />
      </FiltersToolbar>

      {downloadError && (
        <StatusMessage type={StatusTypes.Error} visible>
          {downloadError}
        </StatusMessage>
      )}

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          {error instanceof Error && error.message
            ? error.message
            : 'Failed to load survey responses.'}
        </StatusMessage>
      )}

      {summary && (
        <SummarySection>
          <Text type={TextTypes.Heading5}>Summary of {campaignName}</Text>
          <StatCards>
            <Stat
              label="Answered"
              stat={`${summary.answered}/${summary.offered}`}
            />
            {summary.rating_means.map(rating => (
              <Stat
                key={rating.id}
                label={rating.label}
                stat={
                  rating.mean === null
                    ? '—'
                    : `${rating.mean.toFixed(2)} / ${rating.scale}`
                }
              />
            ))}
          </StatCards>
        </SummarySection>
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
                  <TableHead>Delivery</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-40 text-center">Responses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((row: AdminSurveyResponse) => (
                  <ClickableRow
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <TableCell>{row.campaign_name}</TableCell>
                    <TableCell>
                      <Link
                        to={`/user/${row.user_id}`}
                        onClick={event => event.stopPropagation()}
                      >
                        {row.user_email || `User #${row.user_id}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Tag appearance={STATUS_APPEARANCE[row.status]}>
                        {statusLabel(row.status)}
                      </Tag>
                    </TableCell>
                    <TableCell>{describeDelivery(row)}</TableCell>
                    <TableCell>
                      {formatBerlinDateTime(row.created_at)}
                    </TableCell>
                    <TableCell>
                      {formatBerlinDateTime(row.submitted_at)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        appearance={ButtonAppearance.Secondary}
                        size={ButtonSizes.Small}
                        onClick={event => {
                          event.stopPropagation();
                          setSelectedId(row.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </ClickableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ListScroll>
      </ListPanel>

      <Sheet
        open={!!selected}
        onOpenChange={open => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {selected.user_email || `User #${selected.user_id}`}
                </SheetTitle>
                <SheetDescription>
                  {selected.campaign_name}
                  {' · '}
                  {statusLabel(selected.status)}
                  {' · '}
                  {describeDelivery(selected)}
                </SheetDescription>
              </SheetHeader>
              <SheetScrollableContent>
                <AnswerList>
                  {(selected.questions ?? []).map(question => {
                    const rendered = formatAnswer(
                      question,
                      selected.answers?.[question.id ?? ''],
                    );
                    return (
                      <AnswerBlock key={question.id}>
                        <Text type={TextTypes.Body7} bold>
                          {copyText(question.label) || question.id}
                        </Text>
                        <Text type={TextTypes.Body5}>
                          {rendered ?? 'Not answered'}
                        </Text>
                      </AnswerBlock>
                    );
                  })}
                </AnswerList>
              </SheetScrollableContent>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

export default SurveyResponses;
