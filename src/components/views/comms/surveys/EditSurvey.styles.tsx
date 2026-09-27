import styled from 'styled-components';

/**
 * Survey-specific styling only. The editor shell — panes, section headers, dividers, the
 * empty callout — is shared with the course editor and lives in
 * `components/atoms/EditorShell.styles`.
 */

/** German on the left, English on the right, so a gap is visible rather than implied. */
export const CopyRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  align-items: start;
`;

export const LockedNotice = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  background: ${({ theme }) => theme.color.surface.secondary};
  font-size: 0.75rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.color.text.secondary};
`;

/** Icon sizing for the small inline buttons — keeps `style={{}}` out of the view. */
export const InlineIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;

  > svg {
    width: 12px;
    height: 12px;
  }
`;

export const LoadingWrap = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
  display: flex;
  justify-content: center;
`;

export const LinkPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const LinkPreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  flex-wrap: wrap;
`;

export const LinkPath = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;
