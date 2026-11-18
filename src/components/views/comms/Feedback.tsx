import {
  Button,
  ButtonSizes,
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
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  ADMIN_FEEDBACK_ENDPOINT,
  AdminFeedback,
  FEEDBACK_KIND_LABELS,
  feedbackAreaLabel,
  fetchFeedback,
  updateFeedback,
} from '../../../api/feedback';
import { STATUS_CONFIG, TaskStatus } from '../../../api/supportTasks';
import { formatBerlinDateTime } from '../../../helpers/berlinDates';
import { usePanelCapabilities } from '../../../helpers/panelCapabilities';
import {
  ListPanel,
  ListScroll,
  NoResultsContainer,
  PageContainer,
} from '../../atoms/PageLayout';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetScrollableContent,
  SheetTitle,
} from '../../atoms/Sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import UserImage from '../../atoms/UserImage';
import { FiltersToolbar } from '../../blocks/FiltersToolbar';
import {
  AnswerBlock,
  AnswerList,
  ClickableRow,
} from './surveys/SurveyResponses.styles';

const ALL = 'ALL';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: ALL },
  ...Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

const KIND_OPTIONS = [
  { label: 'All types', value: ALL },
  ...Object.entries(FEEDBACK_KIND_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const describeKind = (feedback: AdminFeedback) =>
  feedback.kind === 'bug'
    ? `Bug · ${feedbackAreaLabel(feedback)}`
    : `General · ${feedback.rating}★`;

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

function FeedbackSheet({
  feedback,
  onSaved,
}: {
  feedback: AdminFeedback;
  onSaved: () => void;
}) {
  const can = usePanelCapabilities();
  const [status, setStatus] = useState<TaskStatus>(feedback.status);
  const [githubIssueUrl, setGithubIssueUrl] = useState(
    feedback.github_issue_url,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const profile = feedback.user_profile;

  return (
    <>
      <SheetHeader>
        <SheetTitle>
          {feedback.kind === 'bug' ? 'Bug report' : 'General feedback'}
        </SheetTitle>
        <SheetDescription>
          {formatBerlinDateTime(feedback.created_at)}
        </SheetDescription>
      </SheetHeader>
      <SheetScrollableContent>
        <AnswerList>
          {profile && (
            <AnswerBlock>
              <Text type={TextTypes.Body7} bold>
                From
              </Text>
              <Text type={TextTypes.Body5}>{userName(feedback)}</Text>
              {can('users') && (
                <Link to={`/user/${profile.id}?tab=chat`}>
                  Open support chat
                </Link>
              )}
            </AnswerBlock>
          )}
          {feedback.kind === 'bug' ? (
            <AnswerBlock>
              <Text type={TextTypes.Body7} bold>
                Where
              </Text>
              <Text type={TextTypes.Body5}>{feedbackAreaLabel(feedback)}</Text>
            </AnswerBlock>
          ) : (
            <AnswerBlock>
              <Text type={TextTypes.Body7} bold>
                Rating
              </Text>
              <Text type={TextTypes.Body5}>{feedback.rating} / 5</Text>
            </AnswerBlock>
          )}
          <AnswerBlock>
            <Text type={TextTypes.Body7} bold>
              Message
            </Text>
            <Text type={TextTypes.Body5}>{feedback.message || '—'}</Text>
          </AnswerBlock>
          {feedback.attachments.length > 0 && (
            <AnswerBlock>
              <Text type={TextTypes.Body7} bold>
                Screenshots
              </Text>
              <span className="flex gap-2">
                {feedback.attachments.map((url, index) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    <img
                      className="h-28 rounded"
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                    />
                  </a>
                ))}
              </span>
            </AnswerBlock>
          )}
          <AnswerBlock>
            <Text type={TextTypes.Body7} bold>
              Device
            </Text>
            <Text type={TextTypes.Body6}>{feedback.platform}</Text>
            {Object.entries(feedback.device).map(([key, value]) => (
              <Text key={key} type={TextTypes.Body6}>
                {key}: {String(value)}
              </Text>
            ))}
          </AnswerBlock>
          <TextInput
            id="feedback-github-issue"
            label="GitHub issue"
            placeholder="https://github.com/a-little-world/…/issues/…"
            value={githubIssueUrl}
            onChange={event => setGithubIssueUrl(event.target.value)}
          />
          <Select
            id="feedback-status"
            label="Status"
            value={status}
            options={STATUS_OPTIONS.filter(option => option.value !== ALL)}
            onValueChange={value => setStatus(value as TaskStatus)}
            placeholder="Status"
            cannotError
            inModal
          />
          {saveError && (
            <StatusMessage type={StatusTypes.Error} visible>
              {saveError}
            </StatusMessage>
          )}
        </AnswerList>
      </SheetScrollableContent>
      <SheetFooter>
        <Button size={ButtonSizes.Small} disabled={isSaving} onClick={save}>
          Save
        </Button>
      </SheetFooter>
    </>
  );
}

function Feedback() {
  const [searchParams, setSearchParams] = useSearchParams({ page_size: '50' });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const can = usePanelCapabilities();
  const canViewUsers = can('users');

  const { data, error, isLoading, mutate } = useSWR(
    [ADMIN_FEEDBACK_ENDPOINT, searchParams.toString()] as const,
    ([, queryString]) => fetchFeedback(queryString),
    { revalidateOnFocus: true },
  );

  const selected = data?.results.find(row => row.id === selectedId) ?? null;

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
        <Select
          id="feedback-status-filter"
          label="Status"
          value={searchParams.get('status') || ALL}
          options={STATUS_OPTIONS}
          onValueChange={value => updateSearchParam('status', value)}
          placeholder="Status"
          cannotError
          maxWidth="180px"
        />
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
      </FiltersToolbar>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          {error instanceof Error && error.message
            ? error.message
            : 'Failed to load feedback.'}
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
                  No feedback matches the current filters.
                </Text>
              )}
            </NoResultsContainer>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Received</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>GitHub</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map(row => (
                  <ClickableRow
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <TableCell>
                      {formatBerlinDateTime(row.created_at)}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {row.user_profile && (
                          <UserImage
                            alt={userName(row)}
                            user={row.user_profile}
                            dimensions={{ width: 28, height: 28 }}
                          />
                        )}
                        {canViewUsers && row.user_profile ? (
                          <Link
                            to={`/user/${row.user_profile.id}`}
                            onClick={event => event.stopPropagation()}
                          >
                            {userName(row)}
                          </Link>
                        ) : (
                          userName(row)
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tag appearance={TagAppearance.outline}>
                        {describeKind(row)}
                      </Tag>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {row.message}
                    </TableCell>
                    <TableCell>{row.platform}</TableCell>
                    <TableCell>
                      {row.github_issue_url ? (
                        <a
                          href={row.github_issue_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={event => event.stopPropagation()}
                        >
                          Issue
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusTag status={row.status} />
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
            <FeedbackSheet
              key={selected.id}
              feedback={selected}
              onSaved={() => {
                mutate();
                setSelectedId(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

export default Feedback;
