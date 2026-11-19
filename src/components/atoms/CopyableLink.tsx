import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  CopyIcon,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

const LinkCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  min-width: 0;
`;

const LinkAnchor = styled.a`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.text.accent};
`;

export type CopyResult = { ok: true; url: string } | { ok: false; url: string };

/**
 * A link (opens in a new tab) with a copy-to-clipboard button. The caller shows the outcome,
 * since each page already owns its toast.
 */
export function CopyableLink({
  url,
  label,
  onCopied,
}: {
  url: string;
  /** Names the link in the button's accessible label, e.g. the short-link tag. */
  label: string;
  onCopied: (result: CopyResult) => void;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onCopied({ ok: true, url });
    } catch {
      // Clipboard access needs a secure context, and `navigator.clipboard` is simply
      // absent without one — the link is on screen either way.
      onCopied({ ok: false, url });
    }
  };

  return (
    <LinkCell>
      <LinkAnchor
        href={url}
        title={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {url}
      </LinkAnchor>
      <Button
        variation={ButtonVariations.Circle}
        appearance={ButtonAppearance.Secondary}
        size={ButtonSizes.Small}
        onClick={copy}
        title={`Copy the link for “${label}”`}
      >
        <CopyIcon label={`copy link for ${label}`} width={16} height={16} />
      </Button>
    </LinkCell>
  );
}

/** Toast copy for a `CopyableLink` result, shared so every page words it the same way. */
export const copyResultToast = (result: CopyResult) =>
  result.ok
    ? { id: Date.now(), headline: 'Copied', title: result.url }
    : {
        id: Date.now(),
        headline: 'Error',
        title:
          'Could not reach the clipboard. Select the link and copy it manually.',
      };
