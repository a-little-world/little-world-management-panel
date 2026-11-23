import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Checkbox,
  Loading,
  LoadingSizes,
  Select,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
  Text,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  ADMIN_FEEDBACK_ENDPOINT,
  AdminFeedback,
  AdminFeedbackDetail,
  FEEDBACK_KIND_LABELS,
  FEEDBACK_PLATFORM_LABELS,
  FeedbackKind,
  fetchFeedback,
  fetchFeedbackDetail,
  updateFeedback,
} from '../../../api/feedback';
import {
  DEFAULT_STATUS_FILTERS,
  STATUS_CONFIG,
  TaskStatus,
} from '../../../api/supportTasks';
import { ORANGE_30 } from '../../../constants';
import { formatBerlinDateTime } from '../../../helpers/berlinDates';
import { usePanelCapabilities } from '../../../helpers/panelCapabilities';
import { dataFetcher } from '../../../store';
import { Button as GhostButton } from '../../atoms/Button';
import MessageQuote from '../../atoms/MessageQuote';
import { PageContainer } from '../../atoms/PageLayout';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetScrollableContent,
  SheetTitle,
} from '../../atoms/Sheet';
import { SortIcon } from '../../atoms/SortIcon';
import UserImage from '../../atoms/UserImage';
import { DataTable } from '../../blocks/DataTable';
import { FiltersToolbar } from '../../blocks/FiltersToolbar';
import RelatedUserSummary, {
  MetaLabel,
  RelatedUserDetail,
} from '../../blocks/RelatedUserSummary';

const ALL = 'ALL';
const SELECTED_PARAM = 'feedback';

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

const KIND_OPTIONS = [
  { label: 'All types', value: ALL },
  ...Object.entries(FEEDBACK_KIND_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const PLATFORM_OPTIONS = [
  { label: 'All platforms', value: ALL },
  ...Object.entries(FEEDBACK_PLATFORM_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const DEVICE_FIELDS = [
  ['appVersion', 'App'],
  ['deviceModel', 'Device'],
  ['os', 'OS'],
  ['pushPermission', 'Push'],
  ['notificationPermission', 'Notifications'],
  ['cameraPermission', 'Camera'],
  ['microphonePermission', 'Microphone'],
  ['language', 'Language'],
  ['timezone', 'Timezone'],
  ['viewport', 'Viewport'],
] as const;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: ${({ theme }) => theme.spacing.small} 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};

  &:last-child {
    border-bottom: none;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const Screenshots = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 72px);
  gap: ${({ theme }) => theme.spacing.xxsmall};

  img {
    width: 100%;
    aspect-ratio: 9 / 14;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius.xsmall};
    border: 1px solid ${({ theme }) => theme.color.border.subtle};
  }
`;

const DetailList = styled.dl`
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.small};
  margin: 0;

  dt {
    color: ${({ theme }) => theme.color.text.tertiary};
  }

  dd {
    margin: 0;
  }
`;

const UserAgent = styled.dd`
  grid-column: 1 / -1;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  color: ${({ theme }) => theme.color.text.tertiary};
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.xsmall};
`;

const TriageFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  padding-top: ${({ theme }) => theme.spacing.small};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const TriageFields = styled.div`
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.xsmall};
  align-items: end;
`;

const TriageActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const Stars = styled(Text).attrs({ tag: 'span' as const })`
  color: ${ORANGE_30};
  letter-spacing: 1px;
`;

const ContextCell = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.tertiary};
  white-space: nowrap;
`;

const FEEDBACK_CONTEXT: Record<
  FeedbackKind,
  {
    label: string;
    render: (details: AdminFeedback['details']) => React.ReactNode;
  }
> = {
  general: {
    label: 'Rating',
    render: ({ rating = 0 }) => (
      <Stars>{'★'.repeat(rating) + '☆'.repeat(5 - rating)}</Stars>
    ),
  },
  bug: { label: 'Location', render: ({ area }) => area },
};

const feedbackContext = ({ kind, details }: AdminFeedback) =>
  FEEDBACK_CONTEXT[kind].render(details);

const userName = (feedback: AdminFeedback) =>
  feedback.user_profile
    ? `${feedback.user_profile.first_name} ${feedback.user_profile.second_name}`
    : '—';

function StatusTag({ status }: { status: TaskStatus }) {
  return (
    <Tag appearance={TagAppearance.outline} color={STATUS_CONFIG[status].color}>
      {STATUS_CONFIG[status].label}
    </Tag>
  );
}

const columnHelper = createColumnHelper<AdminFeedback>();

function buildColumns(
  sortOrder: 'asc' | 'desc',
  onSort: () => void,
): ColumnDef<AdminFeedback, any>[] {
  return [
    columnHelper.accessor('created_at', {
      header: () => (
        <GhostButton variant="ghost" onClick={onSort}>
          Received{' '}
          <SortIcon
            field="created_at"
            sortBy="created_at"
            sortOrder={sortOrder}
          />
        </GhostButton>
      ),
      cell: ({ getValue }) => <Text>{formatBerlinDateTime(getValue())}</Text>,
    }),
    columnHelper.display({
      id: 'from',
      header: 'From',
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          {row.original.user_profile && (
            <UserImage
              alt={userName(row.original)}
              user={row.original.user_profile}
              dimensions={{ width: 28, height: 28 }}
            />
          )}
          <Text tag="span">{userName(row.original)}</Text>
        </span>
      ),
    }),
    columnHelper.display({
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Tag appearance={TagAppearance.outline}>
          {FEEDBACK_KIND_LABELS[row.original.kind]}
        </Tag>
      ),
    }),
    columnHelper.display({
      id: 'context',
      header: 'Context',
      cell: ({ row }) => (
        <ContextCell>{feedbackContext(row.original)}</ContextCell>
      ),
    }),
    columnHelper.accessor('message', {
      header: 'Feedback',
      cell: ({ getValue }) => (
        <Text tag="span" className="block max-w-xs truncate">
          {getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('platform', {
      header: 'Platform',
      cell: ({ getValue }) => <Text>{getValue()}</Text>,
    }),
    columnHelper.accessor('github_issue_url', {
      header: 'GitHub',
      cell: ({ getValue }) =>
        getValue() ? (
          <a href={getValue()} target="_blank" rel="noreferrer">
            Issue
          </a>
        ) : (
          '—'
        ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => <StatusTag status={getValue()} />,
    }),
  ];
}

function DeviceDetails({ device }: { device: AdminFeedback['device'] }) {
  return (
    <DetailList>
      {DEVICE_FIELDS.filter(([key]) => device[key] != null).map(
        ([key, label]) => (
          <React.Fragment key={key}>
            <dt>{label}</dt>
            <dd>{String(device[key])}</dd>
          </React.Fragment>
        ),
      )}
      {device.userAgent && <UserAgent>{String(device.userAgent)}</UserAgent>}
    </DetailList>
  );
}

function FeedbackSheet({
  feedback,
  onClose,
  onSaved,
}: {
  feedback: AdminFeedbackDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const can = usePanelCapabilities();
  const [status, setStatus] = useState<TaskStatus>(feedback.status);
  const [githubIssueUrl, setGithubIssueUrl] = useState(
    feedback.github_issue_url,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const profile = feedback.user_profile;
  const { data: userDetail } = useSWR<RelatedUserDetail>(
    profile ? `/api/matching/users/${profile.id}/` : null,
    dataFetcher,
  );

  const save = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateFeedback(feedback.id, {
        status,
        github_issue_url: githubIssueUrl.trim(),
      });
      onSaved();
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message
          ? error.message
          : 'Failed to save feedback.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SheetHeader>
        <TitleRow>
          <SheetTitle>
            {feedback.kind === 'bug' ? 'Bug report' : 'General feedback'}
          </SheetTitle>
          <SheetDescription type={TextTypes.Body6}>
            #{feedback.id} · {formatBerlinDateTime(feedback.created_at)}
          </SheetDescription>
        </TitleRow>
        <MetaRow>
          <Tag appearance={TagAppearance.outline}>
            {FEEDBACK_KIND_LABELS[feedback.kind]}
          </Tag>
          {feedback.platform && (
            <Tag appearance={TagAppearance.outline}>
              {FEEDBACK_PLATFORM_LABELS[feedback.platform] ?? feedback.platform}
            </Tag>
          )}
          <StatusTag status={feedback.status} />
        </MetaRow>
      </SheetHeader>
      <SheetScrollableContent>
        {!!feedback.message && (
          <Section>
            <MetaLabel>Message</MetaLabel>
            <MessageQuote>
              <Text type={TextTypes.Body5}>{feedback.message}</Text>
            </MessageQuote>
          </Section>
        )}
        {feedback.attachments.length > 0 && (
          <Section>
            <MetaLabel>Screenshots</MetaLabel>
            <Screenshots>
              {feedback.attachments.map((url, index) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`Screenshot ${index + 1}`} />
                </a>
              ))}
            </Screenshots>
          </Section>
        )}
        <Section>
          <MetaLabel>Context</MetaLabel>
          <DetailList>
            <dt>{FEEDBACK_CONTEXT[feedback.kind].label}</dt>
            <dd>{feedbackContext(feedback)}</dd>
          </DetailList>
        </Section>
        <Section>
          <MetaLabel>Device</MetaLabel>
          {Object.keys(feedback.device).length > 0 ? (
            <DeviceDetails device={feedback.device} />
          ) : (
            <Text type={TextTypes.Body6}>Not shared</Text>
          )}
        </Section>
        {profile && (
          <Section>
            <MetaLabel>Reported by</MetaLabel>
            <RelatedUserSummary user={profile} detail={userDetail}>
              {can('users') && (
                <Link to={`/user/${profile.id}?tab=chat`}>
                  Open support chat →
                </Link>
              )}
            </RelatedUserSummary>
          </Section>
        )}
      </SheetScrollableContent>
      <TriageFooter>
        <TriageFields>
          <Select
            id="feedback-status"
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onValueChange={value => setStatus(value as TaskStatus)}
            placeholder="Status"
            cannotError
            inModal
          />
          <TextInput
            id="feedback-github-issue"
            label="GitHub issue"
            placeholder="Paste issue link"
            value={githubIssueUrl}
            onChange={event => setGithubIssueUrl(event.target.value)}
            cannotError
          />
        </TriageFields>
        {saveError && (
          <StatusMessage type={StatusTypes.Error} visible>
            {saveError}
          </StatusMessage>
        )}
        <TriageActions>
          <Button
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button size={ButtonSizes.Small} disabled={isSaving} onClick={save}>
            Save
          </Button>
        </TriageActions>
      </TriageFooter>
    </>
  );
}

function Feedback() {
  const [searchParams, setSearchParams] = useSearchParams({ page_size: '50' });
  const statusFilters = searchParams.getAll('status');
  const effectiveStatusFilters: string[] = statusFilters.length
    ? statusFilters
    : DEFAULT_STATUS_FILTERS;
  const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';
  const selectedId = Number(searchParams.get(SELECTED_PARAM)) || null;

  const listParams = new URLSearchParams(searchParams);
  listParams.delete(SELECTED_PARAM);
  if (!statusFilters.length) {
    DEFAULT_STATUS_FILTERS.forEach(value => listParams.append('status', value));
  }

  const { data, error, isLoading, mutate } = useSWR(
    [ADMIN_FEEDBACK_ENDPOINT, listParams.toString()] as const,
    ([, queryString]) => fetchFeedback(queryString),
    { revalidateOnFocus: true },
  );
  const { data: selected, mutate: mutateSelected } = useSWR(
    selectedId ? [ADMIN_FEEDBACK_ENDPOINT, selectedId] : null,
    () => fetchFeedbackDetail(selectedId!),
  );

  const updateSearchParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    if (!value || value === ALL) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const toggleStatusFilter = (status: TaskStatus) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    nextParams.delete('status');
    const nextStatuses = effectiveStatusFilters.includes(status)
      ? effectiveStatusFilters.filter(value => value !== status)
      : [...effectiveStatusFilters, status];
    nextStatuses.forEach(value => nextParams.append('status', value));
    setSearchParams(nextParams);
  };

  const closeSheet = () => updateSearchParam(SELECTED_PARAM);

  const columns = buildColumns(sortOrder, () =>
    updateSearchParam('sort_order', sortOrder === 'asc' ? 'desc' : 'asc'),
  );

  return (
    <PageContainer>
      <FiltersToolbar
        showSearchBar
        searchPlaceholder="Search messages"
        searchDefaultValue={searchParams.get('search') || ''}
        onSearchSubmit={(value: string) => updateSearchParam('search', value)}
        paginationList={data}
        isLoading={isLoading}
        loadingText="Loading feedback..."
      >
        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
          <Checkbox
            key={value}
            id={`feedback-status-${value}`}
            name={`feedback-status-${value}`}
            label={config.label}
            checked={effectiveStatusFilters.includes(value)}
            onCheckedChange={() => toggleStatusFilter(value as TaskStatus)}
          />
        ))}
        <Select
          id="feedback-kind-filter"
          label="Type"
          value={searchParams.get('kind') || ALL}
          options={KIND_OPTIONS}
          onValueChange={value => updateSearchParam('kind', value)}
          placeholder="Type"
          cannotError
          maxWidth="160px"
        />
        <Select
          id="feedback-platform-filter"
          label="Platform"
          value={searchParams.get('platform') || ALL}
          options={PLATFORM_OPTIONS}
          onValueChange={value => updateSearchParam('platform', value)}
          placeholder="Platform"
          cannotError
          maxWidth="160px"
        />
      </FiltersToolbar>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          {error instanceof Error && error.message
            ? error.message
            : 'Failed to load feedback.'}
        </StatusMessage>
      )}

      {isLoading ? (
        <Loading size={LoadingSizes.Medium} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.results ?? []}
          getRowLink={row => {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set(SELECTED_PARAM, String(row.id));
            return `?${nextParams}`;
          }}
        />
      )}

      <Sheet
        open={!!selectedId}
        onOpenChange={open => {
          if (!open) closeSheet();
        }}
      >
        <SheetContent>
          {selected ? (
            <FeedbackSheet
              key={selected.id}
              feedback={selected}
              onClose={closeSheet}
              onSaved={() => {
                mutate();
                mutateSelected();
                closeSheet();
              }}
            />
          ) : (
            <>
              <SheetTitle>Feedback</SheetTitle>
              <Loading size={LoadingSizes.Medium} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

export default Feedback;
