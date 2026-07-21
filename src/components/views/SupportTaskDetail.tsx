import {
  Select,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { format, parseISO } from 'date-fns';
import {
  STATUS_CONFIG,
  TaskPriority,
  TaskStatus,
  fetchStaffUsers,
  fetchSupportTask,
  getActionTypeConfig,
  patchSupportTask,
} from '../../api/supportTasks';
import { ORANGE_40, BLUE_40 } from '../../constants';
import { resolveAttachmentWidgetText } from '../../helpers/chat';
import { formatTimeDistance } from '../../helpers/date';
import { useTaskPriorityList } from '../../hooks/useTaskPriorities';
import { SUPPORT_TASKS_ROUTE, getOpenChatChatRoute } from '../../router/routes';
import { dataFetcher } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { PageContainer } from '../atoms/PageLayout';
import UserImage from '../atoms/UserImage';
import { usePageHeader } from '../blocks/LayoutHeaderContext';
import ObjectHistoryList, { ObjectHistory } from '../blocks/ObjectHistory';
import SupportTaskAssigneePicker, {
  SUPPORT_TASK_UNASSIGNED_ASSIGNEE,
} from '../blocks/SupportTaskAssigneePicker';
import SupportTaskActionCard from '../blocks/SupportTaskActionCard';
import UserChat from '../blocks/user/UserChat';

// ─── Select options ─────────────────────────────────────────────────────────

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const UNASSIGNED = SUPPORT_TASK_UNASSIGNED_ASSIGNEE;

const OverviewTopRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
`;

const OverviewAside = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  margin-left: auto;
  flex-shrink: 0;
`;

const DescriptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  margin-top: ${({ theme }) => theme.spacing.small};
  padding-top: ${({ theme }) => theme.spacing.small};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const DescriptionText = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'p' as const,
})`
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.55;
`;

const OpenChatLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: none;
  min-height: 2.5rem;

  &:hover {
    background: ${({ theme }) => theme.color.surface.primary};
    text-decoration: underline;
  }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const DetailBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const HeaderTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  justify-content: flex-end;
`;

const MetaGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.medium} ${({ theme }) => theme.spacing.large};
`;

const MetaField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-width: 0;
`;

const MetaLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 600;
`;

const OverviewLabelSpacer = styled(MetaLabel)`
  visibility: hidden;
  user-select: none;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  min-height: 2.5rem;
`;

const MetaValue = styled.div`
  min-height: 2.5rem;
  display: flex;
  align-items: center;
`;

const OverviewCard = styled(Card)`
  position: sticky;
  top: 0;
  z-index: 2;
  background: ${({ theme }) => theme.color.surface.primary};
`;

const OverviewCardContent = styled(CardContent)`
  && {
    padding-top: ${({ theme }) => theme.spacing.small};
    padding-bottom: ${({ theme }) => theme.spacing.small};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const SideColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const SentMessageQuote = styled.blockquote`
  background: ${({ theme }) => theme.color.status.success + '22'};
  border-left: 3px solid ${({ theme }) => theme.color.status.success};
  padding: ${({ theme }) => theme.spacing.small};
  border-radius: 0 ${({ theme }) => theme.radius.xsmall}
    ${({ theme }) => theme.radius.xsmall} 0;
  line-height: 1.55;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.small};
  font-weight: 600;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 16rem;
  overflow-y: auto;
`;
const UserInfoRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xsmall};
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const CollapsibleHeader = styled(CardHeader)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

const ChatWrapper = styled.div`
  min-height: 560px;
  max-height: min(72vh, 720px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const ProfileLink = styled(Link)`
  display: block;
  text-align: center;
  color: ${({ theme }) => theme.color.text.link};
  padding-top: ${({ theme }) => theme.spacing.xsmall};
  &:hover {
    text-decoration: underline;
  }
`;

const ContextGroup = styled(Card)`
  border: 1px solid ${({ theme }) => theme.color.border.selected};
`;

const ContextGroupHeader = styled(CardHeader)`
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const ContextGroupBody = styled(CardContent)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const ContextLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 600;
`;

function getStaticString(staticParameters: Record<string, unknown>, key: string): string | null {
  const value = staticParameters[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupportTaskDetail() {
  const priorityList = useTaskPriorityList();
  const priorityOptions = priorityList.map(({ priority, label }) => ({
    value: priority,
    label,
  }));

  const { taskId } = useParams<{ taskId: string }>();
  const id = Number(taskId);
  const [chatOpen, setChatOpen] = useState(true);
  const [relatedUserOpen, setRelatedUserOpen] = useState(true);

  const {
    data: task,
    isLoading,
    error,
    mutate,
  } = useSWR(taskId ? ['support_task_detail', id] : null, () =>
    fetchSupportTask(id), {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const { data: staffUsers = [] } = useSWR('staff_users', fetchStaffUsers);

  const { data: relatedUserDetail } = useSWR(
    task?.related_user_profile
      ? `/api/matching/users/${task.related_user_profile.id}/?messages=include`
      : null,
    dataFetcher,
  );

  const actionTypeCfg = getActionTypeConfig(task?.action?.action_type ?? '');

  usePageHeader({
    breadcrumbs: {
      items: [{ label: 'Support tasks', to: SUPPORT_TASKS_ROUTE }],
      current: task?.title ?? (isLoading ? 'Loading…' : 'Task not found'),
    },
    actions: task ? (
      <HeaderTags>
        <Tag
          bold
          size={TagSizes.small}
          appearance={TagAppearance.outline}
          color={STATUS_CONFIG[task.status].color}
        >
          {STATUS_CONFIG[task.status].label}
        </Tag>
        <Tag
          bold
          size={TagSizes.small}
          appearance={TagAppearance.outline}
          color={actionTypeCfg.color}
        >
          {actionTypeCfg.label}
        </Tag>
      </HeaderTags>
    ) : undefined,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <Text center>Loading task…</Text>
      </PageContainer>
    );
  }

  if (error || !task) {
    return (
      <PageContainer>
        <Text center>Task not found.</Text>
      </PageContainer>
    );
  }
  const relatedUser = task.related_user_profile;
  const createdBy = task.created_by_profile;
  const now = new Date();

  function formatLastActive(iso: string | null): string {
    if (!iso) return 'Never';
    const date = parseISO(iso);
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    const timeStr = format(date, 'h:mmaaa');
    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    return format(date, 'MMM d, yyyy');
  }

  const description = task.description;

  const currentAssignee = task.assigned_to_profile
    ? String(task.assigned_to_profile.id)
    : UNASSIGNED;

  const action = task.action;
  const actionStaticParameters = action?.static_parameters ?? {};
  const actionParameters = action?.parameters ?? {};
  const isSupportReplyAction = action?.action_type === 'support_reply';
  const isSupportReplyExecuted = action?.status === 'EXECUTED';
  const supportReplyDraftMessage =
    typeof actionParameters.message === 'string' ? actionParameters.message : '';
  const interactionId = getStaticString(actionStaticParameters, 'interaction_id');
  const interactionInternalRoute = interactionId
    ? `${getOpenChatChatRoute(interactionId)}?tab=interactions`
    : null;

  const patch = async (
    data: Parameters<typeof patchSupportTask>[1],
    optimistic: Partial<typeof task>,
  ) => {
    await mutate(
      async () => {
        const updated = await patchSupportTask(id, data);
        return updated;
      },
      { optimisticData: { ...task, ...optimistic }, rollbackOnError: true },
    );
  };

  const combined: ObjectHistory[] = [
    ...(task.history ?? []),
    ...(task.action?.history ?? []),
  ].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
  );

  return (
    <PageContainer>
      <DetailBody>
        <OverviewCard center={false}>
          <OverviewCardContent>
            <OverviewTopRow>
              <MetaGrid>
                <MetaField>
                  <OverviewLabelSpacer>Overview</OverviewLabelSpacer>
                  <Text type={TextTypes.Body5} bold tag="span">
                    Overview
                  </Text>
                </MetaField>

                <MetaField>
                  <MetaLabel>Task ID</MetaLabel>
                  <MetaValue>
                    <Text type={TextTypes.Body6}>#{task.id}</Text>
                  </MetaValue>
                </MetaField>

                <MetaField>
                  <Select
                    key={`task-status-${task.status}`}
                    label="Status"
                    value={task.status}
                    options={STATUS_OPTIONS}
                    onValueChange={v =>
                      patch({ status: v as TaskStatus }, { status: v as TaskStatus })
                    }
                    placeholder="Status"
                    cannotError
                  />
                </MetaField>

                <MetaField>
                  <Select
                    label="Priority"
                    value={task.priority}
                    options={priorityOptions}
                    onValueChange={v =>
                      patch(
                        { priority: v as TaskPriority },
                        { priority: v as TaskPriority },
                      )
                    }
                    placeholder="Priority"
                    cannotError
                  />
                </MetaField>

                <SupportTaskAssigneePicker
                  value={currentAssignee}
                  staffUsers={staffUsers}
                  assignedProfile={task.assigned_to_profile}
                  onValueChange={v =>
                    patch(
                      { assigned_to_id: v === UNASSIGNED ? null : Number(v) },
                      {
                        assigned_to_profile:
                          v === UNASSIGNED
                            ? null
                            : staffUsers.find(u => String(u.id) === v)
                              ? {
                                  id: Number(v),
                                  first_name:
                                    staffUsers.find(u => String(u.id) === v)
                                      ?.first_name ?? '',
                                  second_name:
                                    staffUsers.find(u => String(u.id) === v)
                                      ?.last_name ?? '',
                                  image: null,
                                  avatar_config: {},
                                  image_type: 'avatar' as const,
                                }
                              : task.assigned_to_profile &&
                                  String(task.assigned_to_profile.id) === v
                                ? task.assigned_to_profile
                                : null,
                      },
                    )
                  }
                />

                {createdBy && (
                  <MetaField>
                    <MetaLabel>Created by</MetaLabel>
                    <UserCell>
                      <UserImage
                        alt={`${createdBy.first_name} ${createdBy.second_name}`}
                        user={createdBy}
                        dimensions={{ width: 28, height: 28 }}
                      />
                      <Text type={TextTypes.Body6} tag="span">
                        {createdBy.first_name} {createdBy.second_name}
                      </Text>
                    </UserCell>
                  </MetaField>
                )}

                <MetaField>
                  <MetaLabel>Created</MetaLabel>
                  <MetaValue>
                    <Text type={TextTypes.Body6}>
                      {formatTimeDistance(task.created_at, now)}
                    </Text>
                  </MetaValue>
                </MetaField>

                <MetaField>
                  <MetaLabel>Updated</MetaLabel>
                  <MetaValue>
                    <Text type={TextTypes.Body6}>
                      {formatTimeDistance(task.updated_at, now)}
                    </Text>
                  </MetaValue>
                </MetaField>
              </MetaGrid>

              {interactionInternalRoute && (
                <OverviewAside>
                  <MetaLabel>Open Chat</MetaLabel>
                  <OpenChatLink to={interactionInternalRoute}>
                    <Tag
                      bold
                      size={TagSizes.small}
                      appearance={TagAppearance.outline}
                      color={BLUE_40}
                    >
                      Interaction
                    </Tag>
                    <Text type={TextTypes.Body6} tag="span">
                      Open in Open Chat
                    </Text>
                  </OpenChatLink>
                </OverviewAside>
              )}
            </OverviewTopRow>

            {description && (
              <DescriptionSection>
                <MetaLabel>Description</MetaLabel>
                <DescriptionText>{resolveAttachmentWidgetText(description)}</DescriptionText>
              </DescriptionSection>
            )}
          </OverviewCardContent>
        </OverviewCard>

        <ContentGrid>
          <MainColumn>
            {isSupportReplyAction ? (
              <ContextGroup center={false}>
                <ContextGroupHeader>
                  <CardTitle>Support Reply Context</CardTitle>
                </ContextGroupHeader>
                <ContextGroupBody>
                  {action && (
                    <>
                      <ContextLabel>Action</ContextLabel>
                      <SupportTaskActionCard action={action} taskId={id} onResolved={mutate} />
                    </>
                  )}
                  {relatedUserDetail && (
                    <>
                      <ContextLabel>Support Chat Preview</ContextLabel>
                      <Card center={false}>
                        <CollapsibleHeader onClick={() => setChatOpen(o => !o)}>
                          <CardTitle>Support Chat</CardTitle>
                          {chatOpen ? (
                            <ChevronUpIcon size={16} />
                          ) : (
                            <ChevronDownIcon size={16} />
                          )}
                        </CollapsibleHeader>
                        {chatOpen && (
                          <ChatWrapper>
                            {isSupportReplyExecuted && supportReplyDraftMessage && (
                              <>
                                <ContextLabel>Sent message</ContextLabel>
                                <SentMessageQuote>{supportReplyDraftMessage}</SentMessageQuote>
                              </>
                            )}
                            <UserChat
                              user={relatedUserDetail}
                              initialDraftMessage={
                                isSupportReplyExecuted ? '' : supportReplyDraftMessage
                              }
                              sendViaSupportReplyApi
                              hideComposer={isSupportReplyExecuted}
                              onSupportReplySent={(message: string) => {
                                void mutate(
                                  current =>
                                    current
                                      ? {
                                          ...current,
                                          status: 'COMPLETED',
                                          action: {
                                            ...current.action,
                                            status: 'EXECUTED',
                                            parameters: {
                                              ...(current.action?.parameters ?? {}),
                                              message,
                                            },
                                          },
                                        }
                                      : current,
                                  { revalidate: true },
                                );
                              }}
                            />
                          </ChatWrapper>
                        )}
                      </Card>
                    </>
                  )}
                </ContextGroupBody>
              </ContextGroup>
            ) : (
              <>
                {relatedUserDetail && (
                  <Card center={false}>
                    <CollapsibleHeader onClick={() => setChatOpen(o => !o)}>
                      <CardTitle>Support Chat</CardTitle>
                      {chatOpen ? (
                        <ChevronUpIcon size={16} />
                      ) : (
                        <ChevronDownIcon size={16} />
                      )}
                    </CollapsibleHeader>
                    {chatOpen && (
                      <ChatWrapper>
                        <UserChat user={relatedUserDetail} />
                      </ChatWrapper>
                    )}
                  </Card>
                )}
                {action && (
                  <SupportTaskActionCard
                    action={action}
                    taskId={id}
                    onResolved={mutate}
                  />
                )}
              </>
            )}
          </MainColumn>

          <SideColumn>
            {relatedUser && (
              <Card center={false}>
                <CollapsibleHeader onClick={() => setRelatedUserOpen(o => !o)}>
                  <CardTitle>Related user</CardTitle>
                  {relatedUserOpen ? (
                    <ChevronUpIcon size={16} />
                  ) : (
                    <ChevronDownIcon size={16} />
                  )}
                </CollapsibleHeader>
                {relatedUserOpen && (
                  <CardContent>
                    <UserInfoRow>
                      <UserImage
                        alt={`${relatedUser.first_name} ${relatedUser.second_name}`}
                        user={relatedUser}
                        dimensions={{ width: 56, height: 56 }}
                      />
                      <div>
                        <Text bold color={ORANGE_40} tag="div">
                          {relatedUser.first_name} {relatedUser.second_name}
                        </Text>
                        <Text type={TextTypes.Body5} tag="div">
                          {relatedUser.user_type}
                        </Text>
                        <Text type={TextTypes.Body5} tag="div">
                          {relatedUser.email}
                        </Text>
                      </div>
                    </UserInfoRow>
                    <StatGrid>
                      <StatBox>
                        <MetaLabel>Member since</MetaLabel>
                        <Text bold tag="div">
                          {format(
                            parseISO(relatedUser.date_joined),
                            'MMM yyyy',
                          )}
                        </Text>
                      </StatBox>
                      <StatBox>
                        <MetaLabel>Past tickets</MetaLabel>
                        <Text bold tag="div">
                          {relatedUser.past_tickets}
                        </Text>
                      </StatBox>
                    </StatGrid>
                    <MetaField>
                      <MetaLabel>Last active</MetaLabel>
                      <Text type={TextTypes.Body6} tag="div">
                        {formatLastActive(relatedUser.last_active)}
                      </Text>
                    </MetaField>
                    <ProfileLink to={`/user/${relatedUser.id}`}>
                      Open full profile →
                    </ProfileLink>
                  </CardContent>
                )}
              </Card>
            )}

            {combined.length > 0 && (
              <ObjectHistoryList
                history={combined}
                labelByModelType={{
                  supporttask: 'Task',
                  supporttaskaction: 'Action',
                }}
              />
            )}
          </SideColumn>
        </ContentGrid>
      </DetailBody>
    </PageContainer>
  );
}
