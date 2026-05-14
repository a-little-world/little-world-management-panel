import {
  Dropdown,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon } from 'lucide-react';
import React, { useState } from 'react';
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
import UserImage from '../atoms/UserImage';
import ObjectHistoryList, { ObjectHistory } from '../blocks/ObjectHistory';

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const PRIORITY_OPTIONS = Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const UNASSIGNED = 'UNASSIGNED';

// ─── Styled components ────────────────────────────────────────────────────────

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

const Breadcrumb = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  font-size: 13px;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const BreadcrumbLink = styled(Link)`
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  &:hover {
    text-decoration: underline;
  }
`;

const MonoId = styled.span`
  font-family: source-code-pro, Menlo, Monaco, monospace;
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 13px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const TaskTitle = styled.h2`
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

const PillsRow = styled.div`
  display: flex;
  gap: 10px;
  padding-top: 6px;
  align-items: center;
  flex-shrink: 0;
`;

const MetaStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 28px 36px;
  padding: 18px 0 26px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  margin-bottom: 28px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MetaLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 600;
`;

const MetaValue = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.primary};
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.large};
  box-shadow: 0 1px 25px 1px rgba(0, 0, 0, 0.04);

  & + & {
    margin-top: 20px;
  }
`;

const CardHead = styled.div`
  padding: 20px 26px 14px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  justify-content: space-between;
`;

const CardHeadTitle = styled.h3`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: ${({ theme }) => theme.color.text.heading};
  margin: 0;
  letter-spacing: 0.01em;
`;

const CardHeadSub = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const CardBody = styled.div`
  padding: 4px 26px 24px;
`;

const MsgQuote = styled.div`
  background: ${BLUE_10};
  border-left: 3px solid ${BLUE_40};
  padding: 16px 18px;
  border-radius: 0 ${({ theme }) => theme.radius.xsmall}
    ${({ theme }) => theme.radius.xsmall} 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.color.text.primary};
`;

const MsgWho = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
  font-weight: 500;
`;

const MsgText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.xxsmall};
  &:last-child {
    margin-bottom: 0;
  }
`;

const UserBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const UserTop = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const UserName = styled.div`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: ${ORANGE_40};
  line-height: 1.2;
`;

const UserEmail = styled.div`
  font-family: source-code-pro, Menlo, Monaco, monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const StatLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const StatValue = styled.div`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: ${ORANGE_40};
  line-height: 1.1;
`;

const LastActiveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
`;

const LastActiveLabel = styled.span`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const LastActiveValue = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
`;

const HistoryCardHead = styled(CardHead)`
  cursor: pointer;
  user-select: none;
  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
    border-radius: ${({ theme }) => theme.radius.large}
      ${({ theme }) => theme.radius.large} 0 0;
  }
`;

const HistoryCardBody = styled(CardBody)`
  max-height: 480px;
  overflow-y: auto;
`;

const ProfileLink = styled(Link)`
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  display: block;
  text-align: center;
  padding-top: 10px;
  &:hover {
    text-decoration: underline;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupportTaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const id = Number(taskId);
  const [historyOpen, setHistoryOpen] = useState(true);

  const {
    data: task,
    isLoading,
    error,
    mutate,
  } = useSWR(taskId ? ['support_task_detail', id] : null, () =>
    fetchSupportTask(id),
  );

  const { data: staffUsers = [] } = useSWR('staff_users', fetchStaffUsers);

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

  function formatMemberSince(iso: string): string {
    return format(parseISO(iso), 'MMM yyyy');
  }
  const messagePreview =
    (task.action?.static_parameters?.message_preview as string | undefined) ??
    task.description;

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

  return (
    <PageWrapper>
      <PageContent>
        <Breadcrumb>
          <BreadcrumbLink to={SUPPORT_TASKS_ROUTE}>
            <ChevronLeftIcon size={14} />
            Support tasks
          </BreadcrumbLink>
          <span>›</span>
          <MonoId>#{task.id}</MonoId>
        </Breadcrumb>

        <TitleRow>
          <TaskTitle>{task.title}</TaskTitle>
          <PillsRow>
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
          </PillsRow>
        </TitleRow>

        <MetaStrip>
          <MetaItem>
            <MetaLabel>Task ID</MetaLabel>
            <MetaValue>
              <MonoId>#{task.id}</MonoId>
            </MetaValue>
          </MetaItem>

          <MetaItem>
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
          </MetaItem>

          <MetaItem>
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
          </MetaItem>

          <MetaItem>
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
          </MetaItem>

          {createdBy && (
            <MetaItem>
              <MetaLabel>Created by</MetaLabel>
              <MetaValue>
                <UserImage
                  alt={`${createdBy.first_name} ${createdBy.second_name}`}
                  user={createdBy}
                  dimensions={{ width: 28, height: 28 }}
                />
                {createdBy.first_name} {createdBy.second_name}
              </MetaValue>
            </MetaItem>
          )}

          <MetaItem>
            <MetaLabel>Created</MetaLabel>
            <MetaValue>{formatTimeDistance(task.created_at, now)}</MetaValue>
          </MetaItem>

          <MetaItem>
            <MetaLabel>Updated</MetaLabel>
            <MetaValue>{formatTimeDistance(task.updated_at, now)}</MetaValue>
          </MetaItem>
        </MetaStrip>

        <ContentGrid>
          <div>
            {messagePreview && (
              <Card>
                <CardHead>
                  <CardHeadTitle>Original message</CardHeadTitle>
                  <CardHeadSub>Submitted via in-app help form</CardHeadSub>
                </CardHead>
                <CardBody>
                  <MsgQuote>
                    {relatedUser && (
                      <MsgWho>
                        {relatedUser.first_name} {relatedUser.second_name} ·{' '}
                        {formatTimeDistance(task.created_at, now)}
                      </MsgWho>
                    )}
                    <MsgText>{messagePreview}</MsgText>
                  </MsgQuote>
                </CardBody>
              </Card>
            )}
          </div>

          <aside>
            {relatedUser && (
              <Card>
                <CardHead>
                  <CardHeadTitle>Related user</CardHeadTitle>
                </CardHead>
                <CardBody>
                  <UserBlock>
                    <UserTop>
                      <UserImage
                        alt={`${relatedUser.first_name} ${relatedUser.second_name}`}
                        user={relatedUser}
                        dimensions={{ width: 56, height: 56 }}
                      />
                      <div>
                        <UserName>
                          {relatedUser.first_name} {relatedUser.second_name}
                        </UserName>
                        <UserEmail>{relatedUser.email}</UserEmail>
                      </div>
                    </UserTop>
                    <StatsGrid>
                      <StatBox>
                        <StatLabel>Member since</StatLabel>
                        <StatValue>
                          {formatMemberSince(relatedUser.date_joined)}
                        </StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>Past tickets</StatLabel>
                        <StatValue>{relatedUser.past_tickets}</StatValue>
                      </StatBox>
                    </StatsGrid>
                    <LastActiveRow>
                      <LastActiveLabel>Last active</LastActiveLabel>
                      <LastActiveValue>
                        {formatLastActive(relatedUser.last_active)}
                      </LastActiveValue>
                    </LastActiveRow>
                    <ProfileLink to={`/user/${relatedUser.id}`}>
                      Open full profile →
                    </ProfileLink>
                  </UserBlock>
                </CardBody>
              </Card>
            )}
            {(() => {
              const combined: ObjectHistory[] = [
                ...(task.history ?? []),
                ...(task.action?.history ?? []),
              ].sort(
                (a, b) =>
                  new Date(b.changed_at).getTime() -
                  new Date(a.changed_at).getTime(),
              );
              if (combined.length === 0) return null;
              return (
                <Card>
                  <HistoryCardHead onClick={() => setHistoryOpen(o => !o)}>
                    <CardHeadTitle>History</CardHeadTitle>
                    {historyOpen ? (
                      <ChevronUpIcon size={16} />
                    ) : (
                      <ChevronDownIcon size={16} />
                    )}
                  </HistoryCardHead>
                  {historyOpen && (
                    <HistoryCardBody>
                      <ObjectHistoryList
                        history={combined}
                        title=""
                        labelByModelType={{
                          supporttask: `Task`,
                          supporttaskaction: `Action`,
                        }}
                      />
                    </HistoryCardBody>
                  )}
                </Card>
              );
            })()}
          </aside>
        </ContentGrid>
      </PageContent>
    </PageWrapper>
  );
}
