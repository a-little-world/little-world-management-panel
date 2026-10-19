import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  EyeOpenIcon,
  Loading,
  LoadingSizes,
  PencilIcon,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
  Toast,
} from '@a-little-world/little-world-design-system';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React, { useMemo, useState } from 'react';
import { createSearchParams, Link, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import {
  ADMIN_COMPANIES_ENDPOINT,
  Company,
  COMPANY_FLAG_CONFIG,
  COMPANY_FLAGS,
  fetchCompanies,
} from '../../../api/companies';
import { shortLinkUrl } from '../../../api/shortLinks';
import { CopyableLink, copyResultToast } from '../../atoms/CopyableLink';
import { MANAGEMENT_PERMISSION_MANAGE_COMPANIES } from '../../../constants/managementPermissions';
import { hasManagementPermission } from '../../../helpers/managementPermissions';
import { getCompanyEditRoute, USERS_ROUTE } from '../../../router/routes';
import { useGlobalState } from '../../../store';
import type { MatchingPanelUser } from '../../../api/index';
import {
  Description,
  ListPanel,
  ListScroll,
  PageContainer,
  PageHeader,
} from '../../atoms/PageLayout';
import { DataTable } from '../../blocks/DataTable';
import { usePageHeader } from '../../blocks/LayoutHeaderContext';

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

/** One line, cut with an ellipsis; the full text is in the tooltip. */
const DescriptionCell = styled.span`
  display: block;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserCountLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  color: ${({ theme }) => theme.color.text.accent};
`;

/** Keeps long sign-up URLs to one truncated line so the table stays readable. */
const SignupLinkCell = styled.div`
  max-width: 280px;
`;

/** The users list, filtered to one company (the filter key the Users page reads from the URL). */
const companyUsersLink = (company: Company) =>
  `${USERS_ROUTE}?${createSearchParams({ state__company: company.slug })}`;

const LoadingWrap = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
`;

const columnHelper = createColumnHelper<Company>();

function Companies() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { panelUser } = useGlobalState();
  const canManage = hasManagementPermission(
    panelUser as MatchingPanelUser | undefined,
    MANAGEMENT_PERMISSION_MANAGE_COMPANIES,
  );

  const [toast, setToast] = useState<ReturnType<typeof copyResultToast> | null>(
    null,
  );

  const { data, error, isLoading } = useSWR<Company[]>(
    ADMIN_COMPANIES_ENDPOINT,
    fetchCompanies,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const columns = useMemo<ColumnDef<Company, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ getValue }) => (
          <Text type={TextTypes.Body6} tag="span" bold>
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.display({
        id: 'signup_link',
        header: 'Sign-up link',
        cell: ({ row }) => {
          const link = row.original.signup_link;
          if (!link?.sets_company) {
            return (
              <Tag
                size={TagSizes.small}
                appearance={TagAppearance.outline}
                color={theme.color.text.error}
              >
                {link ? 'Link not working' : 'No link'}
              </Tag>
            );
          }
          return (
            <SignupLinkCell>
              <CopyableLink
                url={shortLinkUrl(link.tag)}
                label={row.original.name}
                onCopied={result => setToast(copyResultToast(result))}
              />
            </SignupLinkCell>
          );
        },
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ getValue }) =>
          getValue() ? (
            <DescriptionCell title={getValue()}>
              <Text type={TextTypes.Body6} tag="span">
                {getValue()}
              </Text>
            </DescriptionCell>
          ) : (
            <Text type={TextTypes.Body6} tag="span">
              —
            </Text>
          ),
      }),
      columnHelper.display({
        id: 'flags',
        header: 'Flags',
        cell: ({ row }) => {
          const enabled = COMPANY_FLAGS.filter(flag => row.original[flag]);
          if (!enabled.length) {
            return (
              <Text type={TextTypes.Body6} tag="span">
                —
              </Text>
            );
          }
          return (
            <TagRow>
              {enabled.map(flag => (
                <Tag
                  key={flag}
                  bold
                  size={TagSizes.small}
                  appearance={TagAppearance.outline}
                  color={COMPANY_FLAG_CONFIG[flag].color}
                >
                  {COMPANY_FLAG_CONFIG[flag].label}
                </Tag>
              ))}
            </TagRow>
          );
        },
      }),
      columnHelper.accessor(row => row.cohorts.length, {
        id: 'cohorts',
        header: 'Cohorts',
        cell: ({ getValue }) => (
          <Text type={TextTypes.Body6} tag="span">
            {getValue() || '—'}
          </Text>
        ),
      }),
      columnHelper.accessor('user_count', {
        header: 'Users',
        cell: ({ row, getValue }) => (
          <UserCountLink
            to={companyUsersLink(row.original)}
            aria-label={`View users of ${row.original.name}`}
            title="View these users"
          >
            <Text type={TextTypes.Body6} tag="span">
              {getValue()}
            </Text>
            <EyeOpenIcon label="view users" width={16} height={16} />
          </UserCountLink>
        ),
      }),
      columnHelper.accessor('is_active', {
        header: 'Status',
        cell: ({ getValue }) =>
          getValue() ? (
            <Tag appearance={TagAppearance.success}>Active</Tag>
          ) : (
            <Tag appearance={TagAppearance.outline}>Inactive</Tag>
          ),
      }),
      columnHelper.display({
        id: 'edit',
        header: canManage ? 'Edit' : 'View',
        cell: ({ row }) => (
          <Button
            variation={ButtonVariations.Circle}
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Medium}
            onClick={() => navigate(getCompanyEditRoute(row.original.id))}
            color={theme.color.text.accent}
          >
            <PencilIcon label="edit icon" width={16} height={16} />
          </Button>
        ),
      }),
    ],
    [canManage, navigate, theme],
  );

  usePageHeader({
    actions: canManage ? (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={() => navigate(getCompanyEditRoute('new'))}
      >
        Create company
      </Button>
    ) : undefined,
  });

  return (
    <PageContainer>
      <PageHeader>
        <Description>
          Partner companies and their cohorts. A company's flags are defaults
          for all of its users. Companies are never deleted — deactivate one to
          stop new users joining it.
        </Description>
      </PageHeader>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load companies.
        </StatusMessage>
      )}

      <ListPanel>
        <ListScroll>
          {isLoading ? (
            <LoadingWrap>
              <Loading size={LoadingSizes.Medium} />
            </LoadingWrap>
          ) : (
            <DataTable
              columns={columns}
              data={data ?? []}
              getRowLink={company => getCompanyEditRoute(company.id)}
            />
          )}
        </ListScroll>
      </ListPanel>
      {toast && (
        <Toast
          key={toast.id}
          headline={toast.headline}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </PageContainer>
  );
}

export default Companies;
