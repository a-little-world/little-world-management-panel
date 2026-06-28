import {
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ChevronDownIcon, ChevronUpIcon, ExternalLink, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import useSWR from 'swr';

import {
  fetchOpenChatInteractionState,
  type OpenChatInteractionState,
} from '../../../api/openChat';
import { OPEN_CHAT_INTERACTION_STATE_POLL_INTERVAL_MS } from './openChatConstants';
import { OpenChatInteractionWidget } from '../user/UserChat.styles';

const WidgetShell = styled(OpenChatInteractionWidget)<{ $collapsedPreview: boolean }>`
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
  padding: ${({ theme }) => `${theme.spacing.xxsmall} ${theme.spacing.xxxsmall}`};
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
  transition: height 0.2s ease, width 0.2s ease;

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
  onOpenInteraction?: (interactionId: string) => void;
};

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
  onOpenInteraction,
}: OpenChatInteractionEmbedProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const canPollState = Boolean(
    interactionShareUuid?.trim() && configurationOwnerUserUuid?.trim(),
  );

  const { data: interactionState } = useSWR(
    canPollState
      ? [
          '/open-chat/interaction-state',
          interactionShareUuid,
          configurationOwnerUserUuid,
        ]
      : null,
    ([, shareUuid, userUuid]) =>
      fetchOpenChatInteractionState(shareUuid as string, userUuid as string),
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
  }, [interactionShareUuid, frameUrl]);

  useEffect(() => {
    if (!shouldAutoExpandInteraction(stateLabel)) {
      setManualExpanded(null);
    }
  }, [stateLabel]);

  const collapsedPreview = Boolean(frameUrl && isVisible && !isExpanded);
  const displayTitle = title?.trim() || 'Open Chat interaction';

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
              {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
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

      {!frameUrl && (
        <WidgetHint>Interaction preview unavailable.</WidgetHint>
      )}

      {frameUrl && !isVisible && (
        <WidgetHint>Preview hidden — use the arrow to show again.</WidgetHint>
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
