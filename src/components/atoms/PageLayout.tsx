import styled, { css } from 'styled-components';

export const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  max-height: calc(100dvh - 5rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

/**
 * PageHeader — unified header for list and edit pages.
 *
 * variant="stack" (default) — column flex with bottom margin, used on list pages
 *                             (title + description + actions stacked vertically).
 * variant="grid"            — 3-col grid (left | centre | right), sticky to the top
 *                             of the page, used on edit/create pages.
 */
export const PageHeader = styled.div<{ variant?: 'stack' | 'grid' }>`
  flex-shrink: 0;

  ${({ variant, theme }) =>
    variant === 'grid'
      ? css`
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: ${theme.spacing.small};
          padding: ${theme.spacing.medium};
          border-bottom: 1px solid ${theme.color.border.subtle};
          background: ${theme.color.surface.primary};
        `
      : css`
          display: flex;
          flex-direction: column;
          align-items: stretch;
          margin-bottom: ${theme.spacing.small};

          ${({ theme }) => css`
            @media (min-width: ${theme.breakpoints.medium}) {
              margin-bottom: ${theme.spacing.medium};
            }
          `}
        `}
`;

/** Left slot — aligns content to the start (used inside PageHeader variant="grid"). */
export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

/** Right slot — aligns content to the end (used inside PageHeader variant="grid"). */
export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`;

export const Description = styled.p`
  color: ${({ theme }) => theme.color.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xsmall};
  margin-bottom: 0;
`;

export const ListPanel = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.color.surface.primary};
  overflow: hidden;
`;

export const ListScroll = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const PageContentContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.small} 0`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.spacing.small} 0`};

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.small}) {
      padding: ${theme.spacing.medium} 0;
    }
  `}
`;

export const NoResultsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  justify-content: center;
  align-items: center;
`;
