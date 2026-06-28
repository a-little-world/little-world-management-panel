import {
  AttachmentWidget,
  CallWidget,
} from '@a-little-world/little-world-design-system';

import { normalizeOpenChatBrowserUrl } from '../api/openChat';

export type OpenChatInteractionPayload = {
  type: 'open_chat_interaction';
  title?: string;
  interaction_id: string;
  shared_interaction_url?: string | null;
};

interface Message {
  sender: string;
}

interface ActiveChat {
  partner: {
    id: string;
  };
}

interface CustomChatElement {
  Component: React.ComponentType<any>;
  tag: string;
  props?: Record<string, any>;
}

interface GetCustomChatElementsParams {
  dispatch?: any;
  isPreview?: boolean;
  message: Message;
  userId: string;
  activeChat?: ActiveChat;
}

export const getCustomChatElements = ({
  isPreview,
  message,
  userId,
}: GetCustomChatElementsParams): CustomChatElement[] => {
  const customChatElements = [
    {
      Component: CallWidget,
      tag: 'MissedCallWidget',
      props: {
        isMissed: true,
        isPreview,
        header:
          message.sender !== userId ? 'Anruf Verpasst' : 'Nicht beantwortet',
        description:
          message.sender !== userId ? 'Zurück Rufen' : 'Erneut anrufen',
        isOutgoing: message.sender === userId,
        onReturnCall: isPreview ? undefined : () => {},
      },
    },
    {
      Component: CallWidget,
      tag: 'CallWidget',
      props: {
        isMissed: false,
        isPreview,
        header: 'Video Anruf',
        isOutgoing: message.sender === userId,
        onReturnCall: isPreview ? undefined : () => {},
      },
    },
    {
      Component: AttachmentWidget,
      tag: 'AttachmentWidget',
      props: { isPreview },
    },
  ];
  return customChatElements;
};

const MAX_FILE_NAME_LENGTH = 15;

export const formatFileName = (fileName: string): string => {
  // Extract file extension (if any)
  const lastDotIndex = fileName.lastIndexOf('.');
  const hasExtension = lastDotIndex !== -1;

  const name = hasExtension ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = hasExtension ? fileName.substring(lastDotIndex) : '';

  if (name.length <= MAX_FILE_NAME_LENGTH) {
    return fileName;
  }

  // Calculate how many characters to keep on each side
  const endChars = Math.floor((MAX_FILE_NAME_LENGTH - 3) / 2); // 3 for the ellipsis
  const beginningChars = Math.ceil((MAX_FILE_NAME_LENGTH - 3) / 2); // Give an extra char to the start if needed

  const shortenedName = `${name.substring(
    0,
    beginningChars,
  )}...${name.substring(name.length - endChars)}`;

  return shortenedName + extension;
};

export const messageContainsWidget = (message: string): boolean =>
  /AttachmentWidget|CallWidget/.test(message);

function extractOpenChatInteractionUuid(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const match = url.pathname.match(/\/interaction\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function withOpenChatLightTheme(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.searchParams.set('theme', 'light');
  return url.toString();
}

export function parseOpenChatInteractionPayload(
  value: string,
): OpenChatInteractionPayload | null {
  try {
    const parsed = JSON.parse(value) as Partial<OpenChatInteractionPayload>;
    if (
      parsed?.type !== 'open_chat_interaction' ||
      typeof parsed?.interaction_id !== 'string'
    ) {
      return null;
    }
    return {
      type: 'open_chat_interaction',
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      interaction_id: parsed.interaction_id,
      shared_interaction_url:
        typeof parsed.shared_interaction_url === 'string'
          ? parsed.shared_interaction_url
          : null,
    };
  } catch {
    return null;
  }
}

export function buildOpenChatInteractionNewestResponseUrl(
  rawUrl: string,
): string | null {
  try {
    const normalized = normalizeOpenChatBrowserUrl(rawUrl);
    const normalizedUrl = new URL(normalized);
    const interactionUuid = extractOpenChatInteractionUuid(normalized);
    if (!interactionUuid) {
      return null;
    }
    return withOpenChatLightTheme(
      `${normalizedUrl.origin}/interaction/${interactionUuid}/newest_response`,
    );
  } catch {
    return null;
  }
}

export const processAttachmentWidgets = (
  message: any,
  errorMessage: string,
): string => {
  let processedMessageText = message.text;

  if (message.parsable && messageContainsWidget(message.text)) {
    // Simple check: if the widget JSON is malformed, replace with error message
    const widgetStartTag = '<AttachmentWidget ';
    const widgetEndTag = ' ></AttachmentWidget>';

    const widgetStart = message.text.indexOf(widgetStartTag);
    const widgetEnd = message.text.indexOf(widgetEndTag);

    if (widgetStart !== -1 && widgetEnd > widgetStart) {
      const jsonStart = widgetStart + widgetStartTag.length;
      const jsonPart = message.text.substring(jsonStart, widgetEnd);

      try {
        // Try to parse the JSON - if it works, use as-is
        JSON.parse(jsonPart);
      } catch (_e) {
        // JSON is malformed, replace entire widget with error message
        processedMessageText = message.text.replace(
          message.text.substring(widgetStart, widgetEnd + widgetEndTag.length),
          errorMessage,
        );
      }
    }
  }

  return processedMessageText;
};
