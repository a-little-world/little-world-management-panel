import {
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
  fetchSupportTask,
} from '../../api/supportTasks';
import { formatTimeDistance } from '../../helpers/date';
import { SUPPORT_TASKS_ROUTE } from '../../routes';
import UserImage from '../atoms/UserImage';

// ─── Design token constants ───────────────────────────────────────────────────

const BLUE_10 = '#f3fbff';
const BLUE_40 = '#0063af';
const ORANGE_40 = '#db590b';
const GREEN_40 = '#045e45';

// ─── Config maps ─────────────────────────────────────────────────────────────

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
  color: ${({ theme }) => theme.color.text.tertiary};
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

const BreadcrumbSep = styled.span`
  color: ${({ theme }) => theme.color.text.quaternary};
`;

const MonoId = styled.span`
  font-family: source-code-pro, Menlo, Monaco, monospace;
  color: ${({ theme }) => theme.color.text.secondary};
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
  min-width: 0;
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

const CreatedByInner = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const CreatedByCol = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.15;
`;

const CreatedByName = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

const CreatedByRole = styled.span`
  font-size: 10.5px;
  color: ${({ theme }) => theme.color.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
`;

const PriorityDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const PriorityLabel = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-weight: 700;
`;

const UnassignedText = styled.span`
  color: ${({ theme }) => theme.color.text.quaternary};
  font-style: italic;
  font-weight: 400;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
`;

const MainColumn = styled.div``;

const Sidebar = styled.aside``;

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

const UserLinkRow = styled.div`
  text-align: center;
  padding-top: 10px;
`;

const ProfileLink = styled(Link)`
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;

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
  } = useSWR(taskId ? ['support_task_detail', id] : null, () =>
    fetchSupportTask(id),
  );

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

  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const actionTypeCfg = getActionTypeConfig(task.action?.action_type ?? '');
  const relatedUser = task.related_user_profile;
  const createdBy = task.created_by_profile;
  const assignedTo = task.assigned_to_profile;
  const now = new Date();
  const messagePreview =
    (task.action?.static_parameters?.message_preview as string | undefined) ??
    task.description;

  return (
    <PageWrapper>
      <PageContent>
        <Breadcrumb>
          <BreadcrumbLink to={SUPPORT_TASKS_ROUTE}>
            <ChevronLeftIcon size={14} />
            Support tasks
          </BreadcrumbLink>
          <BreadcrumbSep>›</BreadcrumbSep>
          <MonoId>#{task.id}</MonoId>
        </Breadcrumb>

        <TitleRow>
          <TaskTitle>{task.title}</TaskTitle>
          <PillsRow>
            <Tag
              bold
              size={TagSizes.large}
              appearance={TagAppearance.outline}
              color={statusCfg.color}
            >
              {statusCfg.label}
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
            <MetaLabel>Assigned to</MetaLabel>
            <MetaValue>
              {assignedTo ? (
                <>
                  <UserImage
                    alt={`${assignedTo.first_name} ${assignedTo.second_name}`}
                    user={assignedTo}
                    dimensions={{ width: 26, height: 26 }}
                  />
                  {assignedTo.first_name} {assignedTo.second_name}
                </>
              ) : (
                <UnassignedText>— Unassigned</UnassignedText>
              )}
            </MetaValue>
          </MetaItem>

          {createdBy && (
            <MetaItem>
              <MetaLabel>Created by</MetaLabel>
              <MetaValue>
                <CreatedByInner>
                  <UserImage
                    alt={`${createdBy.first_name} ${createdBy.second_name}`}
                    user={createdBy}
                    dimensions={{ width: 28, height: 28 }}
                  />
                  <CreatedByCol>
                    <CreatedByName>
                      {createdBy.first_name} {createdBy.second_name}
                    </CreatedByName>
                    <CreatedByRole>User</CreatedByRole>
                  </CreatedByCol>
                </CreatedByInner>
              </MetaValue>
            </MetaItem>
          )}

          <MetaItem>
            <MetaLabel>Priority</MetaLabel>
            <MetaValue>
              <PriorityDot $color={priorityCfg.color} />
              <PriorityLabel $color={priorityCfg.color}>
                {priorityCfg.label}
              </PriorityLabel>
            </MetaValue>
          </MetaItem>

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
          <MainColumn>
            {messagePreview && (
              <Card>
                <CardHead>
                  <CardHeadTitle>Original message</CardHeadTitle>
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
          </MainColumn>

          <Sidebar>
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
                      </div>
                    </UserTop>
                    <UserLinkRow>
                      <ProfileLink to={`/user/${relatedUser.id}`}>
                        Open full profile →
                      </ProfileLink>
                    </UserLinkRow>
                  </UserBlock>
                </CardBody>
              </Card>
            )}
          </Sidebar>
        </ContentGrid>
      </PageContent>
    </PageWrapper>
  );
}
