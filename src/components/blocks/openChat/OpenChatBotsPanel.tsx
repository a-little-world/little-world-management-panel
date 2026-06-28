import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  InputWidth,
  Loading,
  LoadingSizes,
  Modal,
  StatusMessage,
  StatusTypes,
  Tag,
  TagSizes,
  Text,
  TextArea,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  fetchOpenChatBots,
  updateOpenChatBot,
  type OpenChatBot,
  type OpenChatBotUpdatePayload,
} from '../../../api/openChat';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const BotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const BotCard = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-height: 4.5rem;
  position: relative;
`;

const BotCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const BotCardTitle = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

const BotCardMeta = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const BotTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const EditIconButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.color.text.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xxxsmall};
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  flex-shrink: 0;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.color.text.primary};
    background: ${({ theme }) => theme.color.surface.secondary};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
`;

const ModalCard = styled(Card)`
  margin: 0;
`;

const ModalFooter = styled(CardFooter)`
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

const ModalFieldRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.small};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

type BotFormState = {
  description: string;
  backend: string;
  endpoint: string;
  model: string;
  context: string;
  max_tokens: string;
  temperature: string;
  system_prompt: string;
};

function botIdentifier(bot: OpenChatBot): string | null {
  return bot.uuid ?? bot.name;
}

function buildFormState(bot: OpenChatBot): BotFormState {
  const config = bot.default_shared_config ?? {};
  return {
    description: bot.description ?? '',
    backend: String(config.backend ?? 'litellm'),
    endpoint: String(config.endpoint ?? ''),
    model: String(config.model ?? bot.model ?? ''),
    context: String(config.context ?? '20'),
    max_tokens: String(config.max_tokens ?? '2048'),
    temperature: String(config.temperature ?? '0.2'),
    system_prompt: String(config.system_prompt ?? ''),
  };
}

function buildUpdatePayload(form: BotFormState): OpenChatBotUpdatePayload {
  const context = Number.parseInt(form.context, 10);
  const maxTokens = Number.parseInt(form.max_tokens, 10);
  const temperature = Number.parseFloat(form.temperature);

  return {
    description: form.description.trim(),
    default_shared_config: {
      backend: form.backend.trim(),
      endpoint: form.endpoint.trim(),
      model: form.model.trim(),
      context: Number.isNaN(context) ? 20 : context,
      max_tokens: Number.isNaN(maxTokens) ? 2048 : maxTokens,
      temperature: Number.isNaN(temperature) ? 0.2 : temperature,
      system_prompt: form.system_prompt,
    },
  };
}

function OpenChatBotEditModal({
  bot,
  configurationOwnerUserUuid,
  open,
  onClose,
  onSaved,
}: {
  bot: OpenChatBot | null;
  configurationOwnerUserUuid: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<BotFormState>(() =>
    bot ? buildFormState(bot) : {
      description: '',
      backend: 'litellm',
      endpoint: '',
      model: '',
      context: '20',
      max_tokens: '2048',
      temperature: '0.2',
      system_prompt: '',
    },
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bot) {
      setForm(buildFormState(bot));
      setError(null);
    }
  }, [bot]);

  const handleSave = async () => {
    if (!bot) {
      return;
    }
    const identifier = botIdentifier(bot);
    if (!identifier) {
      setError('Bot identifier is missing.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateOpenChatBot(
        identifier,
        configurationOwnerUserUuid,
        buildUpdatePayload(form),
      );
      await onSaved();
      onClose();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : 'Could not save bot configuration.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalCard width={CardSizes.Medium}>
        <CardHeader>
          Edit bot{bot?.name ? `: ${bot.name}` : ''}
        </CardHeader>
        <CardContent align="flex-start">
          <ModalForm>
            <TextInput
              label="Description"
              id="open-chat-bot-description"
              value={form.description}
              width={InputWidth.Full}
              onChange={event => {
                setForm(current => ({
                  ...current,
                  description: event.target.value,
                }));
              }}
            />
            <ModalFieldRow>
              <TextInput
                label="Backend"
                id="open-chat-bot-backend"
                value={form.backend}
                width={InputWidth.Full}
                onChange={event => {
                  setForm(current => ({
                    ...current,
                    backend: event.target.value,
                  }));
                }}
              />
              <TextInput
                label="Model"
                id="open-chat-bot-model"
                value={form.model}
                width={InputWidth.Full}
                onChange={event => {
                  setForm(current => ({
                    ...current,
                    model: event.target.value,
                  }));
                }}
              />
            </ModalFieldRow>
            <TextInput
              label="Endpoint"
              id="open-chat-bot-endpoint"
              value={form.endpoint}
              width={InputWidth.Full}
              onChange={event => {
                setForm(current => ({
                  ...current,
                  endpoint: event.target.value,
                }));
              }}
            />
            <ModalFieldRow>
              <TextInput
                label="Context (messages)"
                id="open-chat-bot-context"
                type="number"
                value={form.context}
                width={InputWidth.Full}
                onChange={event => {
                  setForm(current => ({
                    ...current,
                    context: event.target.value,
                  }));
                }}
              />
              <TextInput
                label="Max tokens"
                id="open-chat-bot-max-tokens"
                type="number"
                value={form.max_tokens}
                width={InputWidth.Full}
                onChange={event => {
                  setForm(current => ({
                    ...current,
                    max_tokens: event.target.value,
                  }));
                }}
              />
            </ModalFieldRow>
            <TextInput
              label="Temperature"
              id="open-chat-bot-temperature"
              type="number"
              step="0.1"
              value={form.temperature}
              width={InputWidth.Full}
              onChange={event => {
                setForm(current => ({
                  ...current,
                  temperature: event.target.value,
                }));
              }}
            />
            <TextArea
              label="System prompt"
              id="open-chat-bot-system-prompt"
              value={form.system_prompt}
              onChange={event => {
                setForm(current => ({
                  ...current,
                  system_prompt: event.target.value,
                }));
              }}
            />
            {error && (
              <StatusMessage type={StatusTypes.Error} visible>
                {error}
              </StatusMessage>
            )}
          </ModalForm>
        </CardContent>
        <ModalFooter>
          <Button
            type="button"
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Medium}
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Medium}
            disabled={isSaving}
            onClick={() => {
              void handleSave();
            }}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalCard>
    </Modal>
  );
}

export function OpenChatBotsPanel({
  configurationOwnerUserUuid,
  hasConfiguration,
  canEdit,
}: {
  configurationOwnerUserUuid: string;
  hasConfiguration: boolean;
  canEdit: boolean;
}) {
  const hasConfigurationOwner = configurationOwnerUserUuid.trim().length > 0;
  const [editingBot, setEditingBot] = useState<OpenChatBot | null>(null);

  const {
    data: botsData,
    error: botsError,
    isLoading: isBotsLoading,
    mutate: refreshBots,
  } = useSWR(
    hasConfiguration && hasConfigurationOwner
      ? ['/open-chat/bots', configurationOwnerUserUuid]
      : null,
    ([, userUuid]) => fetchOpenChatBots(userUuid),
    {
      revalidateOnFocus: true,
    },
  );
  const bots = botsData?.results ?? [];

  return (
    <Panel>
      <Text type={TextTypes.Body4} tag="p">
        Bots registered on your Open Chat account for this configuration.
      </Text>
      {!hasConfiguration && (
        <Text type={TextTypes.Body4} tag="p">
          Save an open chat configuration before loading bots.
        </Text>
      )}
      {isBotsLoading ? (
        <Loading size={LoadingSizes.Small} />
      ) : botsError ? (
        <StatusMessage type={StatusTypes.Error} visible>
          Could not load bots from Open Chat.
        </StatusMessage>
      ) : !bots.length ? (
        <Text type={TextTypes.Body4} tag="p">
          No bots found for this Open Chat user.
        </Text>
      ) : (
        <BotGrid>
          {bots.map(bot => {
            const statusLabel =
              bot.is_active === false
                ? 'Inactive'
                : bot.is_active === true
                  ? 'Active'
                  : null;

            return (
              <BotCard key={bot.uuid ?? bot.name ?? 'bot'}>
                <BotCardHeader>
                  <BotCardTitle type={TextTypes.Body4} tag="p">
                    {bot.name ?? 'Unnamed bot'}
                  </BotCardTitle>
                  <EditIconButton
                    type="button"
                    aria-label={`Edit ${bot.name ?? 'bot'}`}
                    disabled={
                      !canEdit ||
                      bot.is_legacy_contact_bot ||
                      !botIdentifier(bot)
                    }
                    title={
                      bot.is_legacy_contact_bot
                        ? 'Legacy contact bots cannot be edited here'
                        : !canEdit
                          ? 'You do not have permission to edit bots'
                          : 'Edit bot'
                    }
                    onClick={() => {
                      setEditingBot(bot);
                    }}
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </EditIconButton>
                </BotCardHeader>
                <BotTagRow>
                  {statusLabel && (
                    <Tag
                      bold={bot.is_active === true}
                      size={TagSizes.small}
                      color={bot.is_active ? '#16a34a' : '#9ca3af'}
                    >
                      {statusLabel}
                    </Tag>
                  )}
                  {bot.is_public && (
                    <Tag size={TagSizes.small} color="#2563eb">
                      Public
                    </Tag>
                  )}
                  {bot.is_legacy_contact_bot && (
                    <Tag size={TagSizes.small} color="#d97706">
                      Legacy
                    </Tag>
                  )}
                </BotTagRow>
                {bot.model && (
                  <BotCardMeta type={TextTypes.Body5} tag="p">
                    {bot.model}
                  </BotCardMeta>
                )}
                {bot.bot_username && (
                  <BotCardMeta type={TextTypes.Body5} tag="p">
                    {bot.bot_username}
                  </BotCardMeta>
                )}
              </BotCard>
            );
          })}
        </BotGrid>
      )}
      <Actions>
        <Button
          type="button"
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Medium}
          disabled={
            !hasConfiguration || !hasConfigurationOwner || isBotsLoading
          }
          onClick={() => {
            void refreshBots();
          }}
        >
          {isBotsLoading ? 'Refreshing…' : 'Refresh bots'}
        </Button>
      </Actions>
      <OpenChatBotEditModal
        bot={editingBot}
        configurationOwnerUserUuid={configurationOwnerUserUuid}
        open={editingBot !== null}
        onClose={() => {
          setEditingBot(null);
        }}
        onSaved={async () => {
          await refreshBots();
        }}
      />
    </Panel>
  );
}
