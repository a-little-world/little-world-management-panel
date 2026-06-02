import {
  Button,
  ButtonVariations,
  Link,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { css } from 'styled-components';

const BreadcrumbsRoot = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  color: ${({ theme }) => theme.color.text.info};
  min-width: 0;
`;

const breadcrumbLinkStyles = css`
  color: ${({ theme }) => theme.color.text.heading};
`;

const BreadcrumbLink = styled(Link)`
  ${breadcrumbLinkStyles}
`;

const BreadcrumbLinkButton = styled(Button)`
  ${breadcrumbLinkStyles}
`;

const BreadcrumbSeparator = styled(Text)`
  color: ${({ theme }) => theme.color.text.quaternary};
`;

const BreadcrumbCurrentItem = styled(Text)`
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.title};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 360px;
`;

export type BreadcrumbItem =
  | { label: string; to: string }
  | { label: string; onClick: () => void };

export type BreadcrumbsProps = {
  /** Ancestor crumbs rendered as clickable links, left to right. */
  items: BreadcrumbItem[];
  /** The current (non-clickable) page label shown at the end. */
  current: string;
  /** Separator character between crumbs. Defaults to "/". */
  separator?: string;
};

const BreadcrumbCrumb = ({ item }: { item: BreadcrumbItem }) =>
  'to' in item ? (
    <BreadcrumbLink textType={TextTypes.Heading4} to={item.to}>
      {item.label}
    </BreadcrumbLink>
  ) : (
    <BreadcrumbLinkButton
      onClick={item.onClick}
      variation={ButtonVariations.Inline}
    >
      <Text type={TextTypes.Heading4} tag="span">
        {item.label}
      </Text>
    </BreadcrumbLinkButton>
  );

/**
 * Generic breadcrumb trail. Renders a row of ancestor links followed by the
 * current page label. Pass `items` for each ancestor and `current` for the
 * active page.
 */
const Breadcrumbs = ({ items, current, separator = '/' }: BreadcrumbsProps) => (
  <BreadcrumbsRoot>
    {items.map((item, idx) => (
      <React.Fragment key={'to' in item ? item.to : `${item.label}-${idx}`}>
        <BreadcrumbCrumb item={item} />
        <BreadcrumbSeparator tag="span" type={TextTypes.Heading4}>
          {separator}
        </BreadcrumbSeparator>
      </React.Fragment>
    ))}
    <BreadcrumbCurrentItem tag="span" type={TextTypes.Heading4}>
      {current}
    </BreadcrumbCurrentItem>
  </BreadcrumbsRoot>
);

export default Breadcrumbs;
