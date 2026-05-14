import {
  Dropdown,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { ChevronLeftIcon } from 'lucide-react';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  TaskPriority,
  TaskStatus,
  fetchStaffUsers,
  fetchSupportTask,
  patchSupportTask,
} from '../../api/supportTasks';
import ObjectHistoryList, { ObjectHistory } from '../blocks/ObjectHistory';
import { formatTimeDistance } from '../../helpers/date';
import { SUPPORT_TASKS_ROUTE } from '../../routes';
import UserImage from '../atoms/UserImage';

// ─── Design token constants ───────────────────────────────────────────────────

const BLUE_10 = '#f3fbff';
const BLUE_40 = '#0063af';
const ORANGE_40 = '#db590b';
const GREEN_40 = '#045e45';

// ─── Config maps (mirrors SupportTasksOverview) ───────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  NEW: { label: 'New', color: BLUE_40 },
  IN_PROGRESS: { label: 'In progress', color: ORANGE_40 },
  COMPLETED: { label: 'Completed', color: GREEN_40 },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> =
  {
    LOW: { label: 'Low', color: '#6d6d6d' },
    MEDIUM: { label: 'Medium', color: BLUE_40 },
    HIGH: { label: 'High', color: ORANGE_40 },
    URGENT: { label: 'Urgent', color: '#c93333' },
  };

const ACTION_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  support_reply: { label: 'Support reply', color: BLUE_40 },
  message_action_remove_match: { label: 'Remove match', color: '#8a2a2a' },
  profile_change_action_country_of_residence: {
    label: 'Country change',
    color: '#7a4a00',
  },
  message_action_change_user_type: {
    label: 'Change user type',
    color: ORANGE_40,
  },
  profile_action_suspicious_profile: {
    label: 'Suspicious profile',
    color: '#4a1f1f',
  },
  profile_action_too_empty_profile: {
    label: 'Incomplete profile',
    color: '#5b2c87',
  },
};

function getActionTypeConfig(actionType: string) {
  return (
    ACTION_TYPE_CONFIG[actionType] ?? {
      label: actionType.replace(/_/g, ' '),
      color: '#6d6d6d',
    }
  );
}

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const PRIORITY_OPTIONS = Object.entries(PRIORITY_CONFIG).map(
  ([value, cfg]) => ({ value, label: cfg.label }),
);

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
  gap: 4px;
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
  gap: 8px;
`;

const MetaUserName = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  display: block;
  line-height: 1.15;
`;

const MetaUserRole = styled.span`
  font-size: 10.5px;
  color: ${({ theme }) => theme.color.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
  display: block;
  line-height: 1.15;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
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
  gap: 12px;
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
  margin-bottom: 8px;
  font-weight: 500;
`;

const MsgText = styled.p`
  margin: 0 0 8px;
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
  color: ${({ theme }) => theme.color.text.title};
  line-height: 1.2;
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
                        : (staffUsers.find(u => String(u.id) === v)
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
                            : null),
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
                <div>
                  <MetaUserName>
                    {createdBy.first_name} {createdBy.second_name}
                  </MetaUserName>
                  <MetaUserRole>User</MetaUserRole>
                </div>
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
                      <UserName>
                        {relatedUser.first_name} {relatedUser.second_name}
                      </UserName>
                    </UserTop>
                    <ProfileLink to={`/user/${relatedUser.id}`}>
                      Open full profile →
                    </ProfileLink>
                  </UserBlock>
                </CardBody>
              </Card>
            )}
          </aside>
        </ContentGrid>
      </PageContent>
    </PageWrapper>
  );
}
