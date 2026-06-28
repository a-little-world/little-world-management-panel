import {
  Accordion,
  Button,
  ButtonAppearance,
  ButtonSizes,
  InputWidth,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Tag,
  TagSizes,
  Text,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { Cog6ToothIcon } from '@heroicons/react/20/solid';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useSWR, { mutate } from 'swr';

import {
  DEFAULT_OPEN_CHAT_HOST,
  OPEN_CHAT_ACCESS_USERS_ENDPOINT,
  OPEN_CHAT_CONFIGURATION_ENDPOINT,
  createOpenChatConfiguration,
  createOpenChatMatching,
  createOpenChatUserConfiguration,
  fetchOpenChatAccessUsers,
  fetchOpenChatConfiguration,
  fetchOpenChatIdempotentActions,
  clearOpenChatIdempotentAction,
  syncOpenChatRestTools,
  testOpenChatConnection,
  triggerOpenChatIdempotentAction,
  updateOpenChatConfiguration,
  updateOpenChatUserConfiguration,
  buildOpenChatLoginUrl,
  type OpenChatAccessUser,
  type OpenChatConfiguration,
  type OpenChatIdempotentAction,
} from '../../api/openChat';
import type { MatchingPanelUser } from '../../api/index';
import {
  MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
} from '../../constants/managementPermissions';
import { BLUE_40 } from '../../constants';
import { hasManagementPermission } from '../../helpers/managementPermissions';
import { censorSecret } from '../../helpers/secrets';
import { OPEN_CHAT_ROUTE, SUPPORT_TASKS_ROUTE } from '../../router/routes';
import { useGlobalState } from '../../store';
import {
  CompactConfigForm,
  CompactConfigFormGrid,
  ConfigConnectionCard,
  ConfigConnectionCardBody,
  ConfigConnectionCardHeader,
  ConfigConnectionCardTitle,
  ConfigFieldItem,
  ConfigFieldLabel,
  ConfigFieldsGrid,
  ConfigFieldValue,
  HomeSection,
  HomeSectionTitle,
} from '../blocks/openChat/OpenChatWorkspace.styles';
import { OpenChatBotsPanel } from '../blocks/openChat/OpenChatBotsPanel';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import {
  Description,
  PageContainer,
  PageHeader,
  Title,
} from '../atoms/PageLayout';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  max-width: 32rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const FieldLabel = styled.span`
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.875rem;
  font-weight: 600;
`;

const FieldValue = styled.span`
  color: ${({ theme }) => theme.color.text.primary};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.95rem;
  word-break: break-all;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
`;

const ViewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  max-width: 32rem;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ActionCard = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const ActionCardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const ActionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const GearLink = styled(Link)`
  color: ${({ theme }) => theme.color.text.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxxsmall};
  border-radius: ${({ theme }) => theme.radius.xxsmall};

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

const columnHelper = createColumnHelper<OpenChatAccessUser>();

function formatUserName(user: OpenChatAccessUser): string {
  const firstName = user.profile?.first_name?.trim() ?? '';
  const secondName = user.profile?.second_name?.trim() ?? '';
  return [firstName, secondName].filter(Boolean).join(' ') || user.email;
}

function ConfigurationStatusTag({ configured }: { configured: boolean }) {
  if (configured) {
    return (
      <Tag bold size={TagSizes.small} color="#2563eb">
        Configured
      </Tag>
    );
  }

  return (
    <Tag size={TagSizes.small} color="#9ca3af">
      Not configured
    </Tag>
  );
}

function MatchingStatusTag({ matchingExists }: { matchingExists: boolean }) {
  if (matchingExists) {
    return (
      <Tag bold size={TagSizes.small} color="#2563eb">
        Yes
      </Tag>
    );
  }

  return (
    <Tag size={TagSizes.small} color="#9ca3af">
      No
    </Tag>
  );
}

function OpenChatMatchingCell({
  user,
  onUpdated,
}: {
  user: OpenChatAccessUser;
  onUpdated: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (user.matching_exists === null) {
    return (
      <Text type={TextTypes.Body5} tag="span">
        —
      </Text>
    );
  }

  const handleCreateMatching = async () => {
    setActionError(null);
    setIsCreating(true);

    try {
      await createOpenChatMatching(user.id);
      onUpdated();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create matching.';
      setActionError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-[10rem]">
      <MatchingStatusTag matchingExists={user.matching_exists} />
      {user.matching_exists && (
        <Link to={OPEN_CHAT_ROUTE}>
          Open chat
        </Link>
      )}
      {!user.matching_exists && (
        <>
          {actionError && (
            <Text type={TextTypes.Body5} className="text-red-600">
              {actionError}
            </Text>
          )}
          <Button
            type="button"
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
            disabled={isCreating}
            onClick={handleCreateMatching}
          >
            {isCreating ? 'Creating…' : 'Create matching'}
          </Button>
        </>
      )}
    </div>
  );
}

function OpenChatUserConfigurationEditor({
  user,
  onUpdated,
}: {
  user: OpenChatAccessUser;
  onUpdated: () => void;
}) {
  const hasConfiguration = user.configuration !== null;
  const [isEditing, setIsEditing] = useState(false);
  const [openChatUser, setOpenChatUser] = useState('');
  const [openChatHost, setOpenChatHost] = useState(DEFAULT_OPEN_CHAT_HOST);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [storedApiKey, setStoredApiKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setOpenChatUser(user.configuration?.open_chat_user ?? '');
    setOpenChatHost(user.configuration?.open_chat_host ?? DEFAULT_OPEN_CHAT_HOST);
    setStoredApiKey(user.configuration?.open_chat_api_key ?? '');
    setApiKeyInput('');
    setIsEditing(false);
    setFormError(null);
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedUser = openChatUser.trim();
    const trimmedHost = openChatHost.trim();
    const resolvedApiKey = (apiKeyInput || storedApiKey).trim();

    if (!trimmedUser) {
      setFormError('Open chat user is required.');
      return;
    }

    if (!trimmedHost) {
      setFormError('Open chat host is required.');
      return;
    }

    if (!resolvedApiKey) {
      setFormError('API key is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        open_chat_user: trimmedUser,
        open_chat_host: trimmedHost,
        open_chat_api_key: resolvedApiKey,
      };

      if (hasConfiguration) {
        await updateOpenChatUserConfiguration(user.id, payload);
      } else {
        await createOpenChatUserConfiguration(user.id, payload);
      }

      setIsEditing(false);
      setApiKeyInput('');
      onUpdated();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Could not save open chat configuration.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <form className="flex flex-col gap-3 min-w-[18rem]" onSubmit={handleSubmit}>
        {formError && (
          <Text type={TextTypes.Body4} className="text-red-600">
            {formError}
          </Text>
        )}
        <TextInput
          id={`open_chat_user_${user.id}`}
          label="Open chat user"
          placeholder="open-chat-username"
          width={InputWidth.Large}
          value={openChatUser}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setOpenChatUser(event.target.value)
          }
          autoComplete="off"
        />
        <TextInput
          id={`open_chat_host_${user.id}`}
          label="Open chat host"
          placeholder={DEFAULT_OPEN_CHAT_HOST}
          width={InputWidth.Large}
          value={openChatHost}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setOpenChatHost(event.target.value)
          }
          autoComplete="off"
        />
        <TextInput
          id={`open_chat_api_key_${user.id}`}
          label="API key"
          placeholder={
            hasConfiguration
              ? 'Enter a new API key or leave blank to keep the current one'
              : 'Enter API key'
          }
          type="password"
          width={InputWidth.Large}
          value={apiKeyInput}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setApiKeyInput(event.target.value)
          }
          autoComplete="new-password"
        />
        {hasConfiguration && storedApiKey && (
          <Text type={TextTypes.Body5} tag="p">
            Current key: {censorSecret(storedApiKey)}
          </Text>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
            disabled={isSubmitting}
          >
            {hasConfiguration ? 'Save changes' : 'Create configuration'}
          </Button>
          <Button
            type="button"
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            disabled={isSubmitting}
            onClick={() => {
              setFormError(null);
              setOpenChatUser(user.configuration?.open_chat_user ?? '');
              setOpenChatHost(
                user.configuration?.open_chat_host ?? DEFAULT_OPEN_CHAT_HOST,
              );
              setApiKeyInput('');
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-w-[14rem]">
      {hasConfiguration ? (
        <>
          <Text type={TextTypes.Body5} tag="p">
            User: {user.configuration?.open_chat_user}
          </Text>
          <Text type={TextTypes.Body5} tag="p">
            Host: {user.configuration?.open_chat_host}
          </Text>
          <Text type={TextTypes.Body5} tag="p">
            Key: {censorSecret(user.configuration?.open_chat_api_key ?? '')}
          </Text>
        </>
      ) : (
        <Text type={TextTypes.Body5} tag="p">
          No configuration saved yet.
        </Text>
      )}
      <Button
        type="button"
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={() => setIsEditing(true)}
      >
        {hasConfiguration ? 'Edit configuration' : 'Create configuration'}
      </Button>
    </div>
  );
}

function OpenChatAccessUsersPanel() {
  const { data, error, isLoading, mutate: refreshUsers } = useSWR(
    OPEN_CHAT_ACCESS_USERS_ENDPOINT,
    fetchOpenChatAccessUsers,
    { revalidateOnFocus: true },
  );

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('profile.image', {
          header: 'Image',
          cell: ({ row }) => (
            <Link to={`/user/${row.original.id}`}>
              <UserImage
                alt="user profile image"
                user={row.original.profile}
                dimensions={{ height: 32, width: 32 }}
              />
            </Link>
          ),
        }),
        columnHelper.accessor('profile.first_name', {
          header: 'Name',
          cell: ({ row }) => (
            <Link className="hover:underline" to={`/user/${row.original.id}`}>
              {formatUserName(row.original)}
            </Link>
          ),
        }),
        columnHelper.accessor('email', {
          header: 'Email',
          cell: ({ row }) => row.original.email,
        }),
        columnHelper.accessor('configuration', {
          header: 'Status',
          cell: ({ row }) => (
            <ConfigurationStatusTag
              configured={row.original.configuration !== null}
            />
          ),
        }),
        columnHelper.accessor('matching_exists', {
          header: 'Open chat matching exists',
          cell: ({ row }) => (
            <OpenChatMatchingCell
              user={row.original}
              onUpdated={() => refreshUsers()}
            />
          ),
        }),
        columnHelper.display({
          id: 'open_chat_configuration',
          header: 'Open chat configuration',
          cell: ({ row }) => (
            <OpenChatUserConfigurationEditor
              user={row.original}
              onUpdated={() => refreshUsers()}
            />
          ),
        }),
      ] as unknown as ColumnDef<OpenChatAccessUser, unknown>[],
    [refreshUsers],
  );

  if (isLoading) {
    return <Loading size={LoadingSizes.Medium} />;
  }

  if (error) {
    return (
      <StatusMessage type={StatusTypes.Error} visible>
        Failed to load open chat access users.
      </StatusMessage>
    );
  }

  if (!data?.length) {
    return (
      <Text type={TextTypes.Body4} tag="p">
        No users with open chat access permission found.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Text type={TextTypes.Body4} tag="p">
        Users with open chat access permission and their saved credentials.
      </Text>
      <DataTable columns={columns} data={data} />
    </div>
  );
}

function OpenChatActionsPanel({
  configuration,
  configurationOwnerUserUuid,
  automationTargetUserUuid,
  canEdit,
}: {
  configuration: OpenChatConfiguration | null;
  configurationOwnerUserUuid: string;
  automationTargetUserUuid: string;
  canEdit: boolean;
}) {
  const navigate = useNavigate();
  const hasConfiguration = configuration !== null;
  const hasConfigurationOwner = configurationOwnerUserUuid.trim().length > 0;
  const hasAutomationTarget = automationTargetUserUuid.trim().length > 0;
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [triggeringActionId, setTriggeringActionId] = useState<string | null>(null);
  const [clearingActionId, setClearingActionId] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<Record<string, string>>({});
  const [isSyncingRestTools, setIsSyncingRestTools] = useState(false);
  const [isReloadingRestTools, setIsReloadingRestTools] = useState(false);
  const [restToolsError, setRestToolsError] = useState<string | null>(null);
  const [restToolsSuccess, setRestToolsSuccess] = useState<string | null>(null);
  const {
    data: idempotentActionsData,
    error: idempotentActionsError,
    isLoading: isIdempotentActionsLoading,
    mutate: refreshIdempotentActions,
  } = useSWR(
    hasAutomationTarget
      ? ['/open-chat/idempotent-actions', automationTargetUserUuid]
      : null,
    ([, userUuid]) => fetchOpenChatIdempotentActions(userUuid),
    {
      revalidateOnFocus: true,
      refreshInterval: 5000,
    },
  );
  const idempotentActions = idempotentActionsData?.results ?? [];

  const handleTestConnection = async () => {
    setTestError(null);
    setTestSuccess(null);
    setIsTesting(true);

    try {
      const result = await testOpenChatConnection();
      if (result.success) {
        setTestSuccess(result.detail ?? 'Connection successful.');
      } else {
        setTestError(result.detail ?? 'Connection test failed.');
      }
    } catch (error) {
      const apiError = error as { message?: string; data?: { detail?: string } };
      const message =
        apiError.data?.detail ||
        apiError.message ||
        'Connection test failed.';
      setTestError(message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleLoginToOpenChat = () => {
    if (!configuration) {
      return;
    }

    setLoginError(null);

    try {
      const loginUrl = buildOpenChatLoginUrl(configuration);
      const newWindow = window.open(
        loginUrl,
        '_blank',
        'noopener,noreferrer',
      );

      if (!newWindow) {
        setLoginError(
          'Popup blocked. Allow popups for this site and try again.',
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not open Open Chat login.';
      setLoginError(message);
    }
  };

  const handleOpenFilteredSupportTasks = (action: OpenChatIdempotentAction) => {
    const query = new URLSearchParams();
    const suggestedFilters = action.support_task_relation.suggested_filters;
    for (const status of suggestedFilters.status ?? []) {
      query.append('status', status);
    }
    for (const actionType of suggestedFilters.action_type ?? []) {
      query.append('action_type', actionType);
    }
    navigate(
      `${SUPPORT_TASKS_ROUTE}${query.toString() ? `?${query.toString()}` : ''}`,
    );
  };

  const handleTriggerIdempotentAction = async (action: OpenChatIdempotentAction) => {
    if (!hasAutomationTarget || triggeringActionId || clearingActionId) {
      return;
    }

    setActionErrors(prev => ({ ...prev, [action.idempotent_action]: '' }));
    setActionSuccess(prev => ({ ...prev, [action.idempotent_action]: '' }));
    setTriggeringActionId(action.idempotent_action);

    try {
      const result = await triggerOpenChatIdempotentAction(
        action.trigger_endpoint,
        automationTargetUserUuid,
      );
      setActionSuccess(prev => ({
        ...prev,
        [action.idempotent_action]: `Triggered: ${result.trigger} (task ${result.task_id}).`,
      }));
      await refreshIdempotentActions();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not trigger automation task.';
      setActionErrors(prev => ({ ...prev, [action.idempotent_action]: message }));
    } finally {
      setTriggeringActionId(null);
    }
  };

  const handleClearIdempotentActionTasks = async (action: OpenChatIdempotentAction) => {
    if (!hasAutomationTarget || triggeringActionId || clearingActionId) {
      return;
    }
    setActionErrors(prev => ({ ...prev, [action.idempotent_action]: '' }));
    setActionSuccess(prev => ({ ...prev, [action.idempotent_action]: '' }));
    setClearingActionId(action.idempotent_action);

    try {
      const result = await clearOpenChatIdempotentAction(
        action.clear_endpoint,
        automationTargetUserUuid,
      );
      setActionSuccess(prev => ({
        ...prev,
        [action.idempotent_action]: `Cleared ${result.deleted_support_tasks_count} support tasks.`,
      }));
      await refreshIdempotentActions();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not clear related support tasks.';
      setActionErrors(prev => ({ ...prev, [action.idempotent_action]: message }));
    } finally {
      setClearingActionId(null);
    }
  };

  const handleSyncRestTools = async (reload: boolean) => {
    if (!hasConfiguration || !hasConfigurationOwner) {
      return;
    }
    if (isSyncingRestTools || isReloadingRestTools) {
      return;
    }

    setRestToolsError(null);
    setRestToolsSuccess(null);
    if (reload) {
      setIsReloadingRestTools(true);
    } else {
      setIsSyncingRestTools(true);
    }

    try {
      const result = await syncOpenChatRestTools(
        configurationOwnerUserUuid,
        reload,
      );
      const created = result.created.length ? ` created ${result.created.join(', ')}` : '';
      const updated = result.updated.length ? ` updated ${result.updated.join(', ')}` : '';
      const deleted = result.deleted.length ? ` deleted ${result.deleted.join(', ')}` : '';
      setRestToolsSuccess(`${result.detail}${created}${updated}${deleted}`.trim());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not sync REST API tools.';
      setRestToolsError(message);
    } finally {
      setIsSyncingRestTools(false);
      setIsReloadingRestTools(false);
    }
  };

  return (
    <Accordion
      defaultValue="Bots"
      items={[
        {
          header: 'Bots',
          content: (
            <div className="pt-2">
              <OpenChatBotsPanel
                configurationOwnerUserUuid={configurationOwnerUserUuid}
                hasConfiguration={hasConfiguration}
                canEdit={canEdit}
              />
            </div>
          ),
        },
        {
          header: 'REST API Tools',
          content: (
            <div className="pt-2 flex flex-col gap-4 max-w-lg">
              <Text type={TextTypes.Body4} tag="p">
                Register Little World API operations as dynamic REST tools on
                Open Chat. Sync creates or updates missing tools; reload deletes
                and recreates them when the API schema changes.
              </Text>
              {!hasConfiguration && (
                <Text type={TextTypes.Body4} tag="p">
                  Save an open chat configuration before syncing REST API tools.
                </Text>
              )}
              {restToolsError && (
                <StatusMessage type={StatusTypes.Error} visible>
                  {restToolsError}
                </StatusMessage>
              )}
              {restToolsSuccess && (
                <StatusMessage type={StatusTypes.Success} visible>
                  {restToolsSuccess}
                </StatusMessage>
              )}
              <Actions>
                <Button
                  type="button"
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Medium}
                  disabled={
                    !canEdit ||
                    !hasConfiguration ||
                    !hasConfigurationOwner ||
                    isSyncingRestTools ||
                    isReloadingRestTools
                  }
                  onClick={() => {
                    void handleSyncRestTools(false);
                  }}
                >
                  {isSyncingRestTools ? 'Syncing…' : 'Sync REST API tools'}
                </Button>
                <Button
                  type="button"
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Medium}
                  disabled={
                    !canEdit ||
                    !hasConfiguration ||
                    !hasConfigurationOwner ||
                    isSyncingRestTools ||
                    isReloadingRestTools
                  }
                  onClick={() => {
                    void handleSyncRestTools(true);
                  }}
                >
                  {isReloadingRestTools
                    ? 'Reloading…'
                    : 'Delete and reload REST API tools'}
                </Button>
              </Actions>
            </div>
          ),
        },
        {
          header: 'Open-Chat Automation Triggers',
          content: (
            <div className="pt-2 flex flex-col gap-4 max-w-lg">
              <Text type={TextTypes.Body4} tag="p">
                Trigger Open Chat automation workflows manually.
              </Text>
              {!hasAutomationTarget && (
                <Text type={TextTypes.Body4} tag="p">
                  No target user UUID found for automation triggers.
                </Text>
              )}
              {isIdempotentActionsLoading ? (
                <Loading size={LoadingSizes.Small} />
              ) : idempotentActionsError ? (
                <StatusMessage type={StatusTypes.Error} visible>
                  Could not load idempotent actions.
                </StatusMessage>
              ) : !idempotentActions.length ? (
                <Text type={TextTypes.Body4} tag="p">
                  No idempotent actions available.
                </Text>
              ) : (
                idempotentActions.map(action => (
                  <ActionCard key={action.idempotent_action}>
                    <ActionCardTop>
                      <ActionMeta>
                        <Text type={TextTypes.Body5} tag="h4">
                          {action.title}
                        </Text>
                        <Text type={TextTypes.Body6} tag="p">
                          {action.description}
                        </Text>
                      </ActionMeta>
                      <Tag size={TagSizes.small} color={BLUE_40}>
                        Open tasks: {action.support_task_relation.open_count}
                      </Tag>
                    </ActionCardTop>
                    {actionErrors[action.idempotent_action] && (
                      <StatusMessage type={StatusTypes.Error} visible>
                        {actionErrors[action.idempotent_action]}
                      </StatusMessage>
                    )}
                    {actionSuccess[action.idempotent_action] && (
                      <StatusMessage type={StatusTypes.Success} visible>
                        {actionSuccess[action.idempotent_action]}
                      </StatusMessage>
                    )}
                    <Actions>
                      <Button
                        type="button"
                        appearance={ButtonAppearance.Primary}
                        size={ButtonSizes.Small}
                        disabled={
                          !hasAutomationTarget ||
                          Boolean(triggeringActionId || clearingActionId) ||
                          action.trigger_method !== 'POST'
                        }
                        onClick={() => {
                          void handleTriggerIdempotentAction(action);
                        }}
                      >
                        {triggeringActionId === action.idempotent_action
                          ? 'Triggering…'
                          : 'Trigger'}
                      </Button>
                      <Button
                        type="button"
                        appearance={ButtonAppearance.Secondary}
                        size={ButtonSizes.Small}
                        disabled={
                          !hasAutomationTarget ||
                          Boolean(triggeringActionId || clearingActionId) ||
                          action.clear_method !== 'DELETE'
                        }
                        onClick={() => {
                          void handleClearIdempotentActionTasks(action);
                        }}
                      >
                        {clearingActionId === action.idempotent_action
                          ? 'Clearing…'
                          : 'Clear tasks'}
                      </Button>
                      <Button
                        type="button"
                        appearance={ButtonAppearance.Secondary}
                        size={ButtonSizes.Small}
                        onClick={() => handleOpenFilteredSupportTasks(action)}
                      >
                        Open support tasks
                      </Button>
                    </Actions>
                  </ActionCard>
                ))
              )}
            </div>
          ),
        },
        {
          header: 'Test Connection',
          content: (
            <div className="pt-2 flex flex-col gap-4 max-w-lg">
              <Text type={TextTypes.Body4} tag="p">
                Attempts to log in to Open Chat using your saved host, user, and
                API key.
              </Text>
              {!hasConfiguration && (
                <Text type={TextTypes.Body4} tag="p">
                  Save an open chat configuration before running a connection
                  test.
                </Text>
              )}
              {testError && (
                <StatusMessage type={StatusTypes.Error} visible>
                  {testError}
                </StatusMessage>
              )}
              {testSuccess && (
                <StatusMessage type={StatusTypes.Success} visible>
                  {testSuccess}
                </StatusMessage>
              )}
              <Actions>
                <Button
                  type="button"
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Medium}
                  disabled={!hasConfiguration || isTesting}
                  onClick={handleTestConnection}
                >
                  {isTesting ? 'Testing…' : 'Test connection'}
                </Button>
              </Actions>
            </div>
          ),
        },
        {
          header: 'Login to Open Chat',
          content: (
            <div className="pt-2 flex flex-col gap-4 max-w-lg">
              <Text type={TextTypes.Body4} tag="p">
                Opens Open Chat in a new browser tab and logs in automatically
                using your saved credentials.
              </Text>
              {!hasConfiguration && (
                <Text type={TextTypes.Body4} tag="p">
                  Save an open chat configuration before logging in.
                </Text>
              )}
              {loginError && (
                <StatusMessage type={StatusTypes.Error} visible>
                  {loginError}
                </StatusMessage>
              )}
              <Actions>
                <Button
                  type="button"
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Medium}
                  disabled={!hasConfiguration}
                  onClick={handleLoginToOpenChat}
                >
                  Login to Open Chat (new tab)
                </Button>
              </Actions>
            </div>
          ),
        },
      ]}
    />
  );
}

export function OpenChatConfigurationPanel({
  canEdit,
  canManage,
  embedded = false,
  automationTargetUserUuid,
}: {
  canEdit: boolean;
  canManage: boolean;
  embedded?: boolean;
  automationTargetUserUuid?: string;
}) {
  const { panelUser } = useGlobalState();
  const configurationOwnerUserUuid = (panelUser as MatchingPanelUser | undefined)?.uuid?.trim() ?? '';
  const { data, error, isLoading } = useSWR(
    OPEN_CHAT_CONFIGURATION_ENDPOINT,
    fetchOpenChatConfiguration,
    { revalidateOnFocus: true },
  );

  const isCreate = data === null;
  const [isEditing, setIsEditing] = useState(false);
  const [openChatUser, setOpenChatUser] = useState('');
  const [openChatHost, setOpenChatHost] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [storedApiKey, setStoredApiKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!data) {
      setOpenChatUser('');
      setOpenChatHost(DEFAULT_OPEN_CHAT_HOST);
      setApiKeyInput('');
      setStoredApiKey('');
      setIsEditing(false);
      return;
    }

    setOpenChatUser(data.open_chat_user);
    setOpenChatHost(data.open_chat_host);
    setStoredApiKey(data.open_chat_api_key);
    setApiKeyInput('');
    setIsEditing(false);
  }, [data]);

  const resetMessages = () => {
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const trimmedUser = openChatUser.trim();
    const trimmedHost = openChatHost.trim();
    const resolvedApiKey = (apiKeyInput || storedApiKey).trim();

    if (!trimmedUser) {
      setFormError('Open chat user is required.');
      return;
    }

    if (!trimmedHost) {
      setFormError('Open chat host is required.');
      return;
    }

    if (!resolvedApiKey) {
      setFormError('API key is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        open_chat_user: trimmedUser,
        open_chat_host: trimmedHost,
        open_chat_api_key: resolvedApiKey,
      };

      const result = isCreate
        ? await createOpenChatConfiguration(payload)
        : await updateOpenChatConfiguration(payload);

      await mutate(OPEN_CHAT_CONFIGURATION_ENDPOINT, result, false);
      setSuccessMessage(
        isCreate
          ? 'Open chat configuration created.'
          : 'Open chat configuration updated.',
      );
      setIsEditing(false);
      setApiKeyInput('');
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Could not save open chat configuration.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showCreateForm = isCreate && canEdit;
  const showEditForm = !isCreate && isEditing && canEdit;
  const isEditingConfig = showCreateForm || showEditForm;

  const resolvedAutomationTargetUserUuid =
    automationTargetUserUuid?.trim() ?? data?.matching_user_uuid?.trim() ?? '';

  const renderConfigFormFields = (compact: boolean) => (
    <>
      <TextInput
        id="open_chat_user"
        label="Open chat user"
        placeholder="your-open-chat-username"
        width={compact ? InputWidth.Medium : InputWidth.Large}
        value={openChatUser}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setOpenChatUser(event.target.value)
        }
        autoComplete="off"
      />
      <TextInput
        id="open_chat_host"
        label="Open chat host"
        placeholder={DEFAULT_OPEN_CHAT_HOST}
        width={compact ? InputWidth.Medium : InputWidth.Large}
        value={openChatHost}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setOpenChatHost(event.target.value)
        }
        autoComplete="off"
      />
      <TextInput
        id="open_chat_api_key"
        label="API key"
        placeholder={
          showCreateForm
            ? 'Enter your API key'
            : 'Enter a new API key or leave blank to keep the current one'
        }
        type="password"
        width={compact ? InputWidth.Medium : InputWidth.Large}
        value={apiKeyInput}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setApiKeyInput(event.target.value)
        }
        autoComplete="new-password"
      />
      {!showCreateForm && storedApiKey && (
        <Text type={TextTypes.Body7} tag="p">
          Current key: {censorSecret(storedApiKey)}
        </Text>
      )}
    </>
  );

  const renderConfigHeaderActions = () => {
    if (!canEdit) {
      return null;
    }

    if (showCreateForm || showEditForm) {
      return (
        <Actions>
          <Button
            type="submit"
            form="open-chat-configuration-form"
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
            disabled={isSubmitting}
          >
            {showCreateForm ? 'Create' : isSubmitting ? 'Saving…' : 'Save'}
          </Button>
          {showEditForm && (
            <Button
              type="button"
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Small}
              disabled={isSubmitting}
              onClick={() => {
                resetMessages();
                setOpenChatUser(data?.open_chat_user ?? '');
                setOpenChatHost(data?.open_chat_host ?? '');
                setApiKeyInput('');
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          )}
        </Actions>
      );
    }

    if (isCreate) {
      return (
        <Button
          type="button"
          appearance={ButtonAppearance.Primary}
          size={ButtonSizes.Small}
          onClick={() => {
            resetMessages();
            setIsEditing(true);
          }}
        >
          Create
        </Button>
      );
    }

    return (
      <Button
        type="button"
        appearance={ButtonAppearance.Secondary}
        size={ButtonSizes.Small}
        onClick={() => {
          resetMessages();
          setIsEditing(true);
        }}
      >
        Edit
      </Button>
    );
  };

  const renderConfigurationSection = () => {
    if (embedded) {
      return (
        <HomeSection>
          <ConfigConnectionCard>
            <ConfigConnectionCardHeader>
              <ConfigConnectionCardTitle>Open Chat connection</ConfigConnectionCardTitle>
              {renderConfigHeaderActions()}
            </ConfigConnectionCardHeader>
            <ConfigConnectionCardBody>
              {isEditingConfig ? (
                <CompactConfigForm id="open-chat-configuration-form" onSubmit={handleSubmit}>
                  <CompactConfigFormGrid>{renderConfigFormFields(true)}</CompactConfigFormGrid>
                </CompactConfigForm>
              ) : isCreate ? (
                <Text type={TextTypes.Body6} tag="p">
                  No configuration saved yet. Create one to connect Open Chat.
                </Text>
              ) : (
                <ConfigFieldsGrid>
                  <ConfigFieldItem>
                    <ConfigFieldLabel>User</ConfigFieldLabel>
                    <ConfigFieldValue>{data?.open_chat_user}</ConfigFieldValue>
                  </ConfigFieldItem>
                  <ConfigFieldItem>
                    <ConfigFieldLabel>Host</ConfigFieldLabel>
                    <ConfigFieldValue>{data?.open_chat_host}</ConfigFieldValue>
                  </ConfigFieldItem>
                  <ConfigFieldItem>
                    <ConfigFieldLabel>API key</ConfigFieldLabel>
                    <ConfigFieldValue>
                      {censorSecret(data?.open_chat_api_key ?? '')}
                    </ConfigFieldValue>
                  </ConfigFieldItem>
                </ConfigFieldsGrid>
              )}
            </ConfigConnectionCardBody>
          </ConfigConnectionCard>
        </HomeSection>
      );
    }

    return (
      <div>
        {showCreateForm || showEditForm ? (
          <Form onSubmit={handleSubmit}>
            {renderConfigFormFields(false)}
            <Actions>
              <Button
                type="submit"
                appearance={ButtonAppearance.Primary}
                size={ButtonSizes.Medium}
                disabled={isSubmitting}
              >
                {showCreateForm ? 'Create configuration' : 'Save changes'}
              </Button>
              {showEditForm && (
                <Button
                  type="button"
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Medium}
                  disabled={isSubmitting}
                  onClick={() => {
                    resetMessages();
                    setOpenChatUser(data?.open_chat_user ?? '');
                    setOpenChatHost(data?.open_chat_host ?? '');
                    setApiKeyInput('');
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Actions>
          </Form>
        ) : isCreate ? (
          <Text type={TextTypes.Body4} tag="p">
            No configuration yet. You need the edit open chat configuration
            permission to create one.
          </Text>
        ) : (
          <ViewSection>
            <FieldGroup>
              <FieldLabel>Open chat user</FieldLabel>
              <FieldValue>{data?.open_chat_user}</FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Open chat host</FieldLabel>
              <FieldValue>{data?.open_chat_host}</FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>API key</FieldLabel>
              <FieldValue>
                {censorSecret(data?.open_chat_api_key ?? '')}
              </FieldValue>
            </FieldGroup>
            <Actions>
              <Button
                type="button"
                appearance={ButtonAppearance.Primary}
                size={ButtonSizes.Medium}
                disabled={!canEdit}
                onClick={() => {
                  if (!canEdit) {
                    return;
                  }
                  resetMessages();
                  setIsEditing(true);
                }}
              >
                Edit configuration
              </Button>
            </Actions>
          </ViewSection>
        )}
      </div>
    );
  };

  if (isLoading) {
    return embedded ? (
      <Loading size={LoadingSizes.Medium} />
    ) : (
      <PageContainer>
        <Loading size={LoadingSizes.Medium} />
      </PageContainer>
    );
  }

  if (error) {
    return embedded ? (
      <StatusMessage type={StatusTypes.Error} visible>
        Failed to load open chat configuration.
      </StatusMessage>
    ) : (
      <PageContainer>
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load open chat configuration.
        </StatusMessage>
      </PageContainer>
    );
  }

  const configurationContent = (
    <>
      {!embedded && (
        <PageHeader>
          {canEdit && (
            <HeaderActions>
              <GearLink to={OPEN_CHAT_ROUTE} aria-label="Go to Open Chat">
                <Cog6ToothIcon className="h-5 w-5" />
              </GearLink>
            </HeaderActions>
          )}
          <Title>Open Chat Home</Title>
          <Description>
            Connect your Open Chat account. Your API key is stored securely and
            only shown in censored form after saving.
          </Description>
        </PageHeader>
      )}

      {formError && (
        <StatusMessage type={StatusTypes.Error} visible>
          {formError}
        </StatusMessage>
      )}

      {successMessage && (
        <StatusMessage type={StatusTypes.Success} visible>
          {successMessage}
        </StatusMessage>
      )}

      <div className={embedded ? 'flex flex-col gap-4' : 'w-full flex flex-col gap-4'}>
        {renderConfigurationSection()}

        {embedded ? (
          <HomeSection>
            <HomeSectionTitle>Automation & tools</HomeSectionTitle>
            <OpenChatActionsPanel
              configuration={data ?? null}
              configurationOwnerUserUuid={configurationOwnerUserUuid}
              automationTargetUserUuid={resolvedAutomationTargetUserUuid}
              canEdit={canEdit}
            />
          </HomeSection>
        ) : (
          <div>
            <Text type={TextTypes.Body5} tag="h3">
              Open-Chat Actions
            </Text>
            <OpenChatActionsPanel
              configuration={data ?? null}
              configurationOwnerUserUuid={configurationOwnerUserUuid}
              automationTargetUserUuid={resolvedAutomationTargetUserUuid}
              canEdit={canEdit}
            />
          </div>
        )}

        {canManage && (
          <HomeSection>
            <Accordion
              items={[
                {
                  header: 'Manage Open Chat Access',
                  content: <OpenChatAccessUsersPanel />,
                },
              ]}
            />
          </HomeSection>
        )}
      </div>
    </>
  );

  if (embedded) {
    return configurationContent;
  }

  return <PageContainer>{configurationContent}</PageContainer>;
}

const OpenChatAccess = () => {
  const { panelUser } = useGlobalState();
  const user = panelUser as MatchingPanelUser;
  const canAccess = hasManagementPermission(
    user,
    MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
  );
  const canEdit = hasManagementPermission(
    user,
    MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  );
  const canManage = hasManagementPermission(
    user,
    MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  );

  if (!canAccess) {
    return (
      <div className="p-4 text-center">
        <Text type={TextTypes.Body4} tag="p" center>
          You need the open chat access permission to view this page.
        </Text>
      </div>
    );
  }

  return <OpenChatConfigurationPanel canEdit={canEdit} canManage={canManage} />;
};

export default OpenChatAccess;
