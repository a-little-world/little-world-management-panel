import React from 'react';
import styled from 'styled-components';

/* ── Styled primitives ── */

const BreadcrumbsRoot = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
  min-width: 0;
`;

const BreadcrumbLinkButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font: inherit;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${({ theme }) => theme.color.border.moderate};
`;

const BreadcrumbCurrentItem = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 360px;
`;

/* ── Component ── */

export type BreadcrumbItem = {
  label: string;
  onClick: () => void;
};

export type BreadcrumbsProps = {
  /** Ancestor crumbs rendered as clickable links, left to right. */
  items: BreadcrumbItem[];
  /** The current (non-clickable) page label shown at the end. */
  current: string;
  /** Separator character between crumbs. Defaults to "/". */
  separator?: string;
};

/**
 * Generic breadcrumb trail. Renders a row of ancestor links followed by the
 * current page label. Pass `items` for each ancestor and `current` for the
 * active page.
 */
const Breadcrumbs = ({ items, current, separator = '/' }: BreadcrumbsProps) => (
  <BreadcrumbsRoot>
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <BreadcrumbLinkButton type="button" onClick={item.onClick}>
          {item.label}
        </BreadcrumbLinkButton>
        <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
      </React.Fragment>
    ))}
    <BreadcrumbCurrentItem>{current}</BreadcrumbCurrentItem>
  </BreadcrumbsRoot>
);

export default Breadcrumbs;
