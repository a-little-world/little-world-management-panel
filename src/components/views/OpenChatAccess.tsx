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
  Text,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR, { mutate } from 'swr';

import {
  DEFAULT_OPEN_CHAT_HOST,
  OPEN_CHAT_CONFIGURATION_ENDPOINT,
  createOpenChatConfiguration,
  fetchOpenChatConfiguration,
  updateOpenChatConfiguration,
} from '../../api/openChatConfiguration';
import type { MatchingPanelUser } from '../../api/index';
import {
  MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
} from '../../constants/managementPermissions';
import { hasManagementPermission } from '../../helpers/managementPermissions';
import { censorSecret } from '../../helpers/secrets';
import { useGlobalState } from '../../store';
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

function OpenChatConfigurationPanel({ canEdit }: { canEdit: boolean }) {
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

      <div className="w-full">
        <Accordion
          defaultValue={
            showCreateForm ? 'Open chat configuration' : undefined
          }
          items={[
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
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setOpenChatUser(event.target.value)}
                        autoComplete="off"
                      />
                      <TextInput
                        id="open_chat_host"
                        label="Open chat host"
                        placeholder={DEFAULT_OPEN_CHAT_HOST}
                        width={InputWidth.Large}
                        value={openChatHost}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setOpenChatHost(event.target.value)}
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
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setApiKeyInput(event.target.value)}
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
                          {showCreateForm
                            ? 'Create configuration'
                            : 'Save changes'}
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
                      No configuration yet. You need the edit open chat
                      configuration permission to create one.
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
          ]}
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

  if (!canAccess) {
    return (
      <div className="p-4 text-center">
        <Text type={TextTypes.Body4} tag="p" center>
          You need the open chat access permission to view this page.
        </Text>
      </div>
    );
  }

  return <OpenChatConfigurationPanel canEdit={canEdit} />;
};

export default OpenChatAccess;
