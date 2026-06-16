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
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  testOpenChatConnection,
  updateOpenChatConfiguration,
  updateOpenChatUserConfiguration,
  buildOpenChatLoginUrl,
  type OpenChatAccessUser,
  type OpenChatConfiguration,
} from '../../api/openChat';
import type { MatchingPanelUser } from '../../api/index';
import {
  MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
} from '../../constants/managementPermissions';
import { hasManagementPermission } from '../../helpers/managementPermissions';
import { censorSecret } from '../../helpers/secrets';
import { useGlobalState } from '../../store';
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
}: {
  configuration: OpenChatConfiguration | null;
}) {
  const hasConfiguration = configuration !== null;
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

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
      const message =
        error instanceof Error ? error.message : 'Connection test failed.';
      setTestError(message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleLoginToOpenChat = () => {
    if (!configuration) {
      return;
    }

    window.open(
      buildOpenChatLoginUrl(configuration),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <Accordion
      items={[
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

function OpenChatConfigurationPanel({
  canEdit,
  canManage,
}: {
  canEdit: boolean;
  canManage: boolean;
}) {
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

  const accordionItems = [
    {
      header: 'Open chat configuration',
      content: (
        <div className="pt-2">
          {showCreateForm || showEditForm ? (
            <Form onSubmit={handleSubmit}>
              <TextInput
                id="open_chat_user"
                label="Open chat user"
                placeholder="your-open-chat-username"
                width={InputWidth.Large}
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
                width={InputWidth.Large}
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
                width={InputWidth.Large}
                value={apiKeyInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setApiKeyInput(event.target.value)
                }
                autoComplete="new-password"
              />
              {!showCreateForm && storedApiKey && (
                <Text type={TextTypes.Body5} tag="p">
                  Current key: {censorSecret(storedApiKey)}
                </Text>
              )}
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
      ),
    },
    {
      header: 'Open-chat Actions',
      content: (
        <div className="pt-2">
          <OpenChatActionsPanel configuration={data ?? null} />
        </div>
      ),
    },
  ];

  if (canManage) {
    accordionItems.push({
      header: 'Manage Open Chat Access',
      content: <OpenChatAccessUsersPanel />,
    });
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Loading size={LoadingSizes.Medium} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load open chat configuration.
        </StatusMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title>Open Chat Access</Title>
        <Description>
          Connect your Open Chat account. Your API key is stored securely and
          only shown in censored form after saving.
        </Description>
      </PageHeader>

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

      <div className="w-full flex flex-col gap-4">
        <Accordion
          defaultValue={
            showCreateForm ? 'Open chat configuration' : undefined
          }
          items={accordionItems}
        />
      </div>
    </PageContainer>
  );
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
