import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import type { OpenChatClient } from '@open-chat-go/client';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLink,
  XIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import useSWR from 'swr';

import type { OpenChatInteractionState } from '../../../api/openChat';
import { fetchOpenChatInteractionStateDirect } from '../../../api/openChatBrowserClient';
import { OPEN_CHAT_INTERACTION_STATE_POLL_INTERVAL_MS } from './openChatConstants';
import { OpenChatInteractionWidget } from '../user/UserChat.styles';

const WidgetShell = styled(OpenChatInteractionWidget)<{
  $collapsedPreview: boolean;
}>`
  position: relative;
  overflow: hidden;
  isolation: isolate;
  margin: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.xsmall};
  border-radius: ${({ theme }) => theme.radius.small};
  box-shadow:
    0 6px 16px -6px rgba(15, 23, 42, 0.14),
    0 3px 8px -4px rgba(15, 23, 42, 0.1);

  ${({ $collapsedPreview }) =>
    $collapsedPreview &&
    css`
      min-height: 2.75rem;
    `}
`;

const WidgetHeader = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xsmall};
  background: ${({ theme }) => theme.color.surface.primary};
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  padding: ${({ theme }) =>
    `${theme.spacing.xxsmall} ${theme.spacing.xxxsmall}`};
`;

const WidgetTitleBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
`;

const WidgetTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  min-width: 0;
  flex: 1;
`;

const StatusPill = styled.span<{ $state: string }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 0.0625rem 0.3125rem;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-transform: lowercase;

  ${({ $state, theme }) => {
    switch ($state) {
      case 'active':
        return css`
          color: ${theme.color.status.info};
          border-color: ${theme.color.status.info};
          background: ${theme.color.status.info}1a;
        `;
      case 'finished':
        return css`
          color: ${theme.color.status.success};
          border-color: ${theme.color.status.success};
          background: ${theme.color.status.success}1a;
        `;
      case 'failed':
        return css`
          color: ${theme.color.status.error};
          border-color: ${theme.color.status.error};
          background: ${theme.color.status.error}1a;
        `;
      default:
        return css`
          color: ${theme.color.text.secondary};
          background: ${theme.color.surface.secondary};
        `;
    }
  }}
`;

const WidgetTitle = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  min-width: 0;
  color: ${({ theme }) => theme.color.text.tertiary};
  line-height: 1.3;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const WidgetActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  flex-shrink: 0;
`;

const WidgetIconButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.color.text.link};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xxxsmall};
  border-radius: ${({ theme }) => theme.radius.xxxsmall};

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

const CollapsedPreview = styled.div`
  position: absolute;
  z-index: 0;
  left: 50%;
  bottom: 0.5rem;
  transform: translateX(-50%);
  width: 3.5rem;
  height: 1.375rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  pointer-events: none;
`;

const ExpandedPreview = styled.div`
  position: relative;
  z-index: 0;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.xsmall};
`;

const InteractionFrame = styled.iframe<{ $expanded: boolean }>`
  border: 0;
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  display: block;
  background: ${({ theme }) => theme.color.surface.primary};
  transition:
    height 0.2s ease,
    width 0.2s ease;

  ${({ $expanded }) =>
    $expanded
      ? css`
          width: 100%;
          height: 16rem;
          min-height: 16rem;
        `
      : css`
          width: 3.5rem;
          height: 1.375rem;
          min-height: 1.375rem;
        `}
`;

const WidgetHint = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'p' as const,
})`
  position: relative;
  z-index: 1;
  margin: ${({ theme }) => `${theme.spacing.xxsmall} 0 0`};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.35;
`;

type OpenChatInteractionEmbedProps = {
  title?: string;
  frameUrl: string | null;
  interactionId?: string;
  interactionShareUuid?: string | null;
  configurationOwnerUserUuid?: string;
  openChatClient?: OpenChatClient | null;
  onOpenInteraction?: (interactionId: string) => void;
};

type LiveToolCall = {
  id: string;
  name: string;
  status: string;
  error?: string;
};

const LiveToolStatus = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'p' as const,
})`
  position: relative;
  z-index: 1;
  margin: ${({ theme }) => `${theme.spacing.xxsmall} 0 0`};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.35;
`;

function resolveToolStatusLabel(toolCalls: LiveToolCall[]): string | null {
  if (!toolCalls.length) {
    return null;
  }

  const latest = toolCalls[toolCalls.length - 1];
  const ongoing = [...toolCalls]
    .reverse()
    .find(call => call.status === 'ongoing');
  if (ongoing) {
    return `Calling ${ongoing.name || 'tool'}...`;
  }

  if (latest.status === 'failed') {
    return `Tool failed: ${latest.name || 'tool'}`;
  }
  if (latest.status === 'pending_confirmation') {
    return `Waiting confirmation: ${latest.name || 'tool'}`;
  }
  if (latest.status === 'succeeded') {
    return `Last tool succeeded: ${latest.name || 'tool'}`;
  }
  return `Tool update: ${latest.name || 'tool'}`;
}

function normalizeLiveToolCalls(value: unknown): LiveToolCall[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(raw => {
      const call = raw as Record<string, unknown>;
      const id = typeof call.id === 'string' ? call.id : '';
      const name = typeof call.name === 'string' ? call.name : 'tool';
      const status = typeof call.status === 'string' ? call.status : '';
      const error = typeof call.error === 'string' ? call.error : undefined;
      if (!id && !name) {
        return null;
      }
      const toolCall: LiveToolCall = {
        id: id || `${name}-${Math.random()}`,
        name,
        status,
      };
      if (error) {
        toolCall.error = error;
      }
      return toolCall;
    })
    .filter((item): item is LiveToolCall => item !== null);
}

function resolveInteractionStateLabel(
  interactionState: OpenChatInteractionState | undefined,
): string {
  return interactionState?.state?.trim() || 'idle';
}

function shouldAutoExpandInteraction(state: string): boolean {
  return state === 'active';
}

export function OpenChatInteractionEmbed({
  title,
  frameUrl,
  interactionId,
  interactionShareUuid,
  configurationOwnerUserUuid,
  openChatClient,
  onOpenInteraction,
}: OpenChatInteractionEmbedProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const [liveToolCalls, setLiveToolCalls] = useState<LiveToolCall[]>([]);
  const canPollState = Boolean(openChatClient && interactionId?.trim());

  const { data: interactionState } = useSWR(
    canPollState
      ? [
          '/open-chat/interaction-state/direct',
          interactionId,
          configurationOwnerUserUuid,
        ]
      : null,
    () =>
      fetchOpenChatInteractionStateDirect(
        openChatClient!,
        interactionId as string,
      ),
    {
      refreshInterval: OPEN_CHAT_INTERACTION_STATE_POLL_INTERVAL_MS,
      revalidateOnFocus: true,
    },
  );

  const stateLabel = resolveInteractionStateLabel(interactionState);
  const autoExpanded = shouldAutoExpandInteraction(stateLabel);
  const isExpanded = manualExpanded ?? autoExpanded;

  useEffect(() => {
    setManualExpanded(null);
    setIsVisible(true);
    setLiveToolCalls([]);
  }, [interactionShareUuid, frameUrl]);

  useEffect(() => {
    if (!shouldAutoExpandInteraction(stateLabel)) {
      setManualExpanded(null);
    }
  }, [stateLabel]);

  useEffect(() => {
    if (!interactionShareUuid?.trim() || !frameUrl?.trim()) {
      return;
    }

    let socket: WebSocket | null = null;
    try {
      const frame = new URL(frameUrl);
      const protocol = frame.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(
        `${protocol}//${frame.host}/ws/interaction/${interactionShareUuid}`,
      );
    } catch {
      return;
    }

    socket.onmessage = event => {
      try {
        const parsed = JSON.parse(String(event.data)) as {
          type?: string;
          content?: { tool_calls?: unknown };
        };
        if (
          parsed.type !== 'new_partial_message' &&
          parsed.type !== 'new_message'
        ) {
          return;
        }
        const normalized = normalizeLiveToolCalls(parsed.content?.tool_calls);
        if (normalized.length > 0) {
          setLiveToolCalls(normalized);
        }
      } catch {
        // ignore invalid websocket payload
      }
    };

    return () => {
      socket?.close();
    };
  }, [interactionShareUuid, frameUrl]);

  const collapsedPreview = Boolean(frameUrl && isVisible && !isExpanded);
  const displayTitle = title?.trim() || 'Open Chat interaction';
  const toolStatusLabel = resolveToolStatusLabel(liveToolCalls);

  const handleToggleExpanded = () => {
    setManualExpanded(current => !(current ?? autoExpanded));
  };

  return (
    <WidgetShell $collapsedPreview={collapsedPreview}>
      {frameUrl && isVisible && !isExpanded && (
        <CollapsedPreview aria-hidden>
          <InteractionFrame
            $expanded={false}
            src={frameUrl}
            title={
              interactionId
                ? `open-chat-interaction-widget-${interactionId}`
                : 'open-chat-interaction-widget'
            }
            tabIndex={-1}
          />
        </CollapsedPreview>
      )}

      <WidgetHeader>
        <WidgetTitleBlock>
          <WidgetTitleRow>
            <StatusPill $state={stateLabel}>{stateLabel}</StatusPill>
            <WidgetTitle>{displayTitle}</WidgetTitle>
          </WidgetTitleRow>
        </WidgetTitleBlock>
        <WidgetActions>
          {frameUrl && isVisible && (
            <WidgetIconButton
              type="button"
              onClick={handleToggleExpanded}
              aria-label={isExpanded ? 'Collapse preview' : 'Expand preview'}
              title={isExpanded ? 'Collapse preview' : 'Expand preview'}
            >
              {isExpanded ? (
                <ChevronUpIcon size={14} />
              ) : (
                <ChevronDownIcon size={14} />
              )}
            </WidgetIconButton>
          )}
          {frameUrl && (
            <WidgetIconButton
              type="button"
              onClick={() => {
                setIsVisible(current => !current);
                if (isVisible) {
                  setManualExpanded(false);
                }
              }}
              aria-label={isVisible ? 'Close preview' : 'Show preview'}
              title={isVisible ? 'Close preview' : 'Show preview'}
            >
              {isVisible ? <XIcon size={14} /> : <ChevronDownIcon size={14} />}
            </WidgetIconButton>
          )}
          {interactionId && onOpenInteraction && (
            <WidgetIconButton
              type="button"
              onClick={() => onOpenInteraction(interactionId)}
              aria-label="Open interaction page"
              title="Open interaction page"
            >
              <ExternalLink size={14} />
            </WidgetIconButton>
          )}
        </WidgetActions>
      </WidgetHeader>

      {!frameUrl && <WidgetHint>Interaction preview unavailable.</WidgetHint>}

      {frameUrl && !isVisible && (
        <WidgetHint>Preview hidden — use the arrow to show again.</WidgetHint>
      )}

      {frameUrl && isVisible && toolStatusLabel && (
        <LiveToolStatus>{toolStatusLabel}</LiveToolStatus>
      )}

      {frameUrl && isVisible && isExpanded && (
        <ExpandedPreview>
          <InteractionFrame
            $expanded
            src={frameUrl}
            title={
              interactionId
                ? `open-chat-interaction-widget-${interactionId}`
                : 'open-chat-interaction-widget'
            }
          />
        </ExpandedPreview>
      )}
    </WidgetShell>
  );
}
