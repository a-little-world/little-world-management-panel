import {
  Dropdown,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { format, parseISO } from 'date-fns';
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  TaskPriority,
  TaskStatus,
  fetchStaffUsers,
  fetchSupportTask,
  getActionTypeConfig,
  patchSupportTask,
} from '../../api/supportTasks';
import { BLUE_10, BLUE_40, ORANGE_40 } from '../../constants';
import { formatTimeDistance } from '../../helpers/date';
import { SUPPORT_TASKS_ROUTE } from '../../routes';
import { dataFetcher } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import UserImage from '../atoms/UserImage';
import ObjectHistoryList, { ObjectHistory } from '../blocks/ObjectHistory';
import UserChat from '../blocks/user/UserChat';

// ─── Dropdown options ─────────────────────────────────────────────────────────

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const PRIORITY_OPTIONS = Object.entries(PRIORITY_CONFIG).map(
  ([value, cfg]) => ({
    value,
    label: cfg.label,
  }),
);

const UNASSIGNED = 'UNASSIGNED';

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.color.surface.primary};
`;

const PageContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.medium}
    ${({ theme }) => theme.spacing.xlarge}
    ${({ theme }) => theme.spacing.xxlarge};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: none;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  &:hover {
    text-decoration: underline;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.small};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const PageTitle = styled.h2`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 36px;
  line-height: 1.15;
  color: ${({ theme }) => theme.color.text.title};
  letter-spacing: -0.01em;
  margin: 0;
  flex: 1;
  min-width: 0;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 28px 36px;
  padding: 18px 0 26px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const MetaField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
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

const MessageQuote = styled.blockquote`
  background: ${BLUE_10};
  border-left: 3px solid ${BLUE_40};
  padding: ${({ theme }) => theme.spacing.small};
  border-radius: 0 ${({ theme }) => theme.radius.xsmall}
    ${({ theme }) => theme.radius.xsmall} 0;
  line-height: 1.55;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
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
  max-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const ProfileLink = styled(Link)`
  display: block;
  text-align: center;
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  padding-top: ${({ theme }) => theme.spacing.xsmall};
  &:hover {
    text-decoration: underline;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupportTaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const id = Number(taskId);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [relatedUserOpen, setRelatedUserOpen] = useState(true);

  const {
    data: task,
    isLoading,
    error,
    mutate,
  } = useSWR(taskId ? ['support_task_detail', id] : null, () =>
    fetchSupportTask(id),
  );

  const { data: staffUsers = [] } = useSWR('staff_users', fetchStaffUsers);

  const { data: relatedUserDetail } = useSWR(
    task?.related_user_profile
      ? `/api/matching/users/${task.related_user_profile.id}/?messages=include`
      : null,
    dataFetcher,
  );

  useEffect(() => {
    console.log(`relatedUserDetail`, relatedUserDetail);
  }, [relatedUserDetail]);

  if (isLoading) {
    return (
      <PageWrapper>
        <PageContent>
          <Text center>Loading task…</Text>
        </PageContent>
      </PageWrapper>
    );
  }

  if (error || !task) {
    return (
      <PageWrapper>
        <PageContent>
          <Text center>Task not found.</Text>
        </PageContent>
      </PageWrapper>
    );
  }

  const actionTypeCfg = getActionTypeConfig(task.action?.action_type ?? '');
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

  const assigneeOptions = [
    { value: UNASSIGNED, label: '— Unassigned' },
    ...staffUsers.map(u => ({
      value: String(u.id),
      label: `${u.first_name} ${u.last_name}`,
    })),
  ];

  const currentAssignee = task.assigned_to_profile
    ? String(task.assigned_to_profile.id)
    : UNASSIGNED;

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
    <PageWrapper>
      <PageContent>
        <BackLink to={SUPPORT_TASKS_ROUTE}>
          <ChevronLeftIcon size={14} />
          Support tasks
        </BackLink>

        <TitleRow>
          <PageTitle>{task.title}</PageTitle>
          <Tag
            bold
            size={TagSizes.large}
            appearance={TagAppearance.outline}
            color={STATUS_CONFIG[task.status].color}
          >
            {STATUS_CONFIG[task.status].label}
          </Tag>
          <Tag
            bold
            size={TagSizes.large}
            appearance={TagAppearance.outline}
            color={actionTypeCfg.color}
          >
            {actionTypeCfg.label}
          </Tag>
        </TitleRow>

        <MetaRow>
          <MetaField>
            <MetaLabel>Task ID</MetaLabel>
            <Text type={TextTypes.Body6}>#{task.id}</Text>
          </MetaField>

          <MetaField>
            <MetaLabel>Status</MetaLabel>
            <Dropdown
              value={task.status}
              options={STATUS_OPTIONS}
              onValueChange={v =>
                patch({ status: v as TaskStatus }, { status: v as TaskStatus })
              }
              placeholder="Status"
              cannotError
              maxWidth="160px"
            />
          </MetaField>

          <MetaField>
            <MetaLabel>Priority</MetaLabel>
            <Dropdown
              value={task.priority}
              options={PRIORITY_OPTIONS}
              onValueChange={v =>
                patch(
                  { priority: v as TaskPriority },
                  { priority: v as TaskPriority },
                )
              }
              placeholder="Priority"
              cannotError
              maxWidth="140px"
            />
          </MetaField>

          <MetaField>
            <MetaLabel>Assigned to</MetaLabel>
            <Dropdown
              value={currentAssignee}
              options={assigneeOptions}
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
                          : null,
                  },
                )
              }
              placeholder="Unassigned"
              cannotError
              maxWidth="200px"
            />
          </MetaField>

          {createdBy && (
            <MetaField>
              <MetaLabel>Created by</MetaLabel>
              <Text type={TextTypes.Body6}>
                {createdBy.first_name} {createdBy.second_name}
              </Text>
            </MetaField>
          )}

          <MetaField>
            <MetaLabel>Created</MetaLabel>
            <Text type={TextTypes.Body6}>
              {formatTimeDistance(task.created_at, now)}
            </Text>
          </MetaField>

          <MetaField>
            <MetaLabel>Updated</MetaLabel>
            <Text type={TextTypes.Body6}>
              {formatTimeDistance(task.updated_at, now)}
            </Text>
          </MetaField>
        </MetaRow>

        <ContentGrid>
          <MainColumn>
            {description && (
              <Card center={false}>
                <CollapsibleHeader onClick={() => setDescriptionOpen(o => !o)}>
                  <CardTitle>Description</CardTitle>
                  {descriptionOpen ? (
                    <ChevronUpIcon size={16} />
                  ) : (
                    <ChevronDownIcon size={16} />
                  )}
                </CollapsibleHeader>
                {descriptionOpen && (
                  <CardContent>
                    <Text tag="p">{description}</Text>
                  </CardContent>
                )}
              </Card>
            )}
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
      </PageContent>
    </PageWrapper>
  );
}
