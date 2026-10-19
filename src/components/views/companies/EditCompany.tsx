import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  InputWidth,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Switch,
  Tag,
  TagAppearance,
  Text,
  TextArea,
  TextInput,
  TextTypes,
  Toast,
} from '@a-little-world/little-world-design-system';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_COMPANIES_ENDPOINT,
  Company,
  COMPANY_FLAG_CONFIG,
  COMPANY_FLAGS,
  CompanyCohort,
  CompanyPayload,
  createCompany,
  createCompanyCohort,
  ensureCompanySignupLink,
  fetchCompany,
  removeCompanyLogo,
  updateCompany,
  updateCompanyCohort,
  uploadCompanyLogo,
} from '../../../api/companies';
import { resolveCourseImageUrl } from '../../../api/courses';
import { shortLinkUrl } from '../../../api/shortLinks';
import type { MatchingPanelUser } from '../../../api/index';
import { MANAGEMENT_PERMISSION_MANAGE_COMPANIES } from '../../../constants/managementPermissions';
import { hasManagementPermission } from '../../../helpers/managementPermissions';
import {
  COMPANIES_ROUTE,
  getCompanyEditRoute,
  getShortLinkEditRoute,
} from '../../../router/routes';
import { registerInput, useGlobalState } from '../../../store';
import {
  Divider,
  EditorRoot,
  FormStack,
  MainPane,
  PaneHeading,
  PaneHint,
  PaneRoot,
  SectionTitle,
  TopBarDivider,
  TwoCol,
} from '../../atoms/EditorShell.styles';
import { CopyableLink, copyResultToast } from '../../atoms/CopyableLink';
import { ImageUploadField } from '../../atoms/ImageUploadField';
import { DataTable } from '../../blocks/DataTable';
import { usePageHeader } from '../../blocks/LayoutHeaderContext';
import {
  AddCohortRow,
  CohortNameCell,
  DetailsFields,
  DetailsRow,
  FlagCell,
  FlagGrid,
  LoadingWrap,
  LogoBox,
  LogoColumn,
  LogoFrame,
  LogoImage,
  SignupLinkActions,
} from './EditCompany.styles';

/**
 * The DS Switch top-aligns its toggle when it has a description. Centre it on the text block
 * instead, and stretch it so every toggle in a column sits at the same right edge.
 */
const FlagSwitch = styled(Switch)`
  && {
    align-items: center;
  }
`;

type CompanyFormValues = CompanyPayload;

const defaultFormValues: CompanyFormValues = {
  slug: '',
  name: '',
  description: '',
  is_active: true,
  custom_onboarding: false,
  force_match_eligible: false,
  match_priority: false,
  skip_email_verification: false,
  disable_time_overlap_score: false,
};

const companyToFormValues = (company: Company): CompanyFormValues => ({
  slug: company.slug,
  name: company.name,
  description: company.description,
  is_active: company.is_active,
  custom_onboarding: company.custom_onboarding,
  force_match_eligible: company.force_match_eligible,
  match_priority: company.match_priority,
  skip_email_verification: company.skip_email_verification,
  disable_time_overlap_score: company.disable_time_overlap_score,
});

/** DRF names the offending field; "slug: already exists" beats a bare "already exists". */
const describeError = (e: any, fallback: string) => {
  if (!e?.message) return fallback;
  return e.cause && typeof e.cause === 'string'
    ? `${e.cause}: ${e.message}`
    : e.message;
};

type ToastState = { id: number; headline: string; title: string } | null;

/** The sign-up code for a cohort, e.g. `kiron-ukr` — what `lw-company` links set. */
const cohortCode = (company: Pick<Company, 'slug'>, cohortSlug: string) =>
  `${company.slug}-${cohortSlug}`;

// ---------------------------------------------------------------------------
// Cohorts
// ---------------------------------------------------------------------------

/** Rename in place: the input keeps its own draft so typing does not hit the table data. */
function CohortName({
  cohort,
  disabled,
  onRename,
}: {
  cohort: CompanyCohort;
  disabled: boolean;
  onRename: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(cohort.name);
  useEffect(() => setName(cohort.name), [cohort.name]);
  const changed = name.trim() !== cohort.name && !!name.trim();

  return (
    <CohortNameCell>
      <TextInput
        id={`cohort_name_${cohort.id}`}
        aria-label={`Name of cohort ${cohort.slug}`}
        value={name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setName(event.target.value)
        }
        disabled={disabled}
        width={InputWidth.Medium}
      />
      {changed && (
        <Button
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Small}
          onClick={() => onRename(name.trim())}
          disabled={disabled}
        >
          Rename
        </Button>
      )}
    </CohortNameCell>
  );
}

const cohortColumnHelper = createColumnHelper<CompanyCohort>();

function CohortsSection({
  company,
  canManage,
  onCompanyChange,
  onToast,
}: {
  company: Company;
  canManage: boolean;
  onCompanyChange: (company: Company) => Promise<void>;
  onToast: (toast: ToastState) => void;
}) {
  const theme = useTheme();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');

  const run = async (action: () => Promise<Company>, success: string) => {
    setPending(true);
    setError(null);
    try {
      await onCompanyChange(await action());
      onToast({ id: Date.now(), headline: 'Success', title: success });
      return true;
    } catch (e: any) {
      setError(describeError(e, 'Could not update the cohort.'));
      return false;
    } finally {
      setPending(false);
    }
  };

  const addCohort = async () => {
    const added = await run(
      () =>
        createCompanyCohort(company.id, {
          slug: newSlug.trim(),
          name: newName.trim(),
        }),
      'Cohort added.',
    );
    if (added) {
      setNewSlug('');
      setNewName('');
    }
  };

  const columns = useMemo<ColumnDef<CompanyCohort, any>[]>(
    () => [
      cohortColumnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) =>
          canManage ? (
            <CohortName
              cohort={row.original}
              disabled={pending}
              onRename={async name => {
                await run(
                  () =>
                    updateCompanyCohort(company.id, row.original.id, { name }),
                  'Cohort renamed.',
                );
              }}
            />
          ) : (
            <Text type={TextTypes.Body6} tag="span">
              {row.original.name}
            </Text>
          ),
      }),
      // The full code is what links and filters use; the cohort slug alone (`ukr`) means nothing.
      cohortColumnHelper.accessor(cohort => cohortCode(company, cohort.slug), {
        id: 'code',
        header: 'Sign-up code',
        cell: ({ getValue }) => (
          <Text type={TextTypes.Body6} tag="span">
            {getValue()}
          </Text>
        ),
      }),
      cohortColumnHelper.accessor('user_count', {
        header: 'Users',
        cell: ({ getValue }) => (
          <Text type={TextTypes.Body6} tag="span">
            {getValue()}
          </Text>
        ),
      }),
      cohortColumnHelper.accessor('is_active', {
        header: 'Status',
        cell: ({ getValue }) =>
          getValue() ? (
            <Tag appearance={TagAppearance.success}>Active</Tag>
          ) : (
            <Tag appearance={TagAppearance.outline}>Inactive</Tag>
          ),
      }),
      ...(canManage
        ? [
            cohortColumnHelper.display({
              id: 'toggle',
              header: '',
              cell: ({ row }) => (
                <Button
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Small}
                  disabled={pending}
                  // Deactivating is the destructive direction, so it reads red.
                  color={
                    row.original.is_active ? theme.color.text.error : undefined
                  }
                  borderColor={
                    row.original.is_active
                      ? theme.color.border.error
                      : undefined
                  }
                  onClick={() =>
                    run(
                      () =>
                        updateCompanyCohort(company.id, row.original.id, {
                          is_active: !row.original.is_active,
                        }),
                      row.original.is_active
                        ? 'Cohort deactivated.'
                        : 'Cohort activated.',
                    )
                  }
                >
                  {row.original.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              ),
            }),
          ]
        : []),
    ],
    // `run` closes over `company` and `pending`, which are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, company, pending, theme],
  );

  return (
    <FormStack>
      <SectionTitle>Cohorts</SectionTitle>
      <PaneHint>
        A cohort groups a company's users, e.g. one intake per semester. Users
        are assigned to a cohort from their profile. Deactivated cohorts keep
        their users but cannot be assigned any more.
      </PaneHint>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible withBorder>
          {error}
        </StatusMessage>
      )}

      {canManage && (
        <AddCohortRow>
          <TextInput
            id="new_cohort_name"
            label="New cohort name"
            placeholder="e.g. Summer semester 2026"
            value={newName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setNewName(event.target.value)
            }
            disabled={pending}
            width={InputWidth.Medium}
            cannotError
          />
          <TextInput
            id="new_cohort_slug"
            label={`Code after “${company.slug}-”`}
            placeholder="e.g. so26"
            labelTooltip="Completes the sign-up code that puts users in this cohort. Unique within this company; cannot be changed later."
            value={newSlug}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setNewSlug(event.target.value)
            }
            disabled={pending}
            width={InputWidth.Small}
            cannotError
          />
          <Button
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            onClick={addCohort}
            disabled={pending || !newSlug.trim() || !newName.trim()}
          >
            Add cohort
          </Button>
        </AddCohortRow>
      )}
      {canManage && newSlug.trim() && (
        <Text type={TextTypes.Body7} tag="span">
          Sign-up code: {cohortCode(company, newSlug.trim().toLowerCase())}
        </Text>
      )}

      <DataTable columns={columns} data={company.cohorts} />
    </FormStack>
  );
}

// ---------------------------------------------------------------------------
// Sign-up link
// ---------------------------------------------------------------------------

/** The short link partners share; editing it happens on the short-links page. */
function SignupLinkSection({
  company,
  canManage,
  onCompanyChange,
  onToast,
}: {
  company: Company;
  canManage: boolean;
  onCompanyChange: (company: Company) => Promise<void>;
  onToast: (toast: ToastState) => void;
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const link = company.signup_link;

  const recreate = async () => {
    setPending(true);
    setError(null);
    try {
      await onCompanyChange(await ensureCompanySignupLink(company.id));
      onToast({
        id: Date.now(),
        headline: 'Success',
        title: 'Sign-up link ready.',
      });
    } catch (e: any) {
      setError(describeError(e, 'Could not create the sign-up link.'));
    } finally {
      setPending(false);
    }
  };

  let problem: string | null = null;
  if (!link) problem = 'This company has no sign-up link.';
  else if (link.archived) problem = 'The sign-up link was archived.';
  else if (!link.sets_company)
    problem = `The sign-up link “${link.tag}” no longer sets this company’s lw-company cookie.`;

  return (
    <FormStack>
      <SectionTitle>Sign-up link</SectionTitle>
      <PaneHint>
        Share this link with the partner. Everyone who signs up through it is
        added to {company.name}.
      </PaneHint>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible withBorder>
          {error}
        </StatusMessage>
      )}
      {problem && (
        <StatusMessage type={StatusTypes.Warning} visible withBorder>
          {problem}
        </StatusMessage>
      )}

      {link && !link.archived && (
        <>
          <CopyableLink
            url={shortLinkUrl(link.tag)}
            label={company.name}
            onCopied={result => onToast(copyResultToast(result))}
          />
          <Text type={TextTypes.Body7} tag="span">
            {link.cohort
              ? `Signs users up to ${company.name} · ${link.cohort.name}. `
              : `Signs users up to ${company.name} (no cohort). `}
            Redirects to {link.url}
          </Text>
        </>
      )}

      <SignupLinkActions>
        {link && !link.archived && (
          <Button
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            onClick={() => navigate(getShortLinkEditRoute(link.id))}
          >
            Edit short link
          </Button>
        )}
        {problem && canManage && (
          <Button
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
            onClick={recreate}
            disabled={pending}
            loading={pending}
          >
            Create sign-up link
          </Button>
        )}
      </SignupLinkActions>
    </FormStack>
  );
}

// ---------------------------------------------------------------------------
// EditCompany — main page
// ---------------------------------------------------------------------------

function EditCompany() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const isNew = companyId === 'new';
  const { panelUser } = useGlobalState();
  const canManage = hasManagementPermission(
    panelUser as MatchingPanelUser | undefined,
    MANAGEMENT_PERMISSION_MANAGE_COMPANIES,
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  // The logo goes through its own multipart endpoint after the JSON save, like course images.
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [clearLogo, setClearLogo] = useState(false);

  const detailUrl = `${ADMIN_COMPANIES_ENDPOINT}${companyId}/`;
  const { data, isLoading, error } = useSWR<Company>(
    !isNew ? detailUrl : null,
    () => fetchCompany(Number(companyId)),
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({ defaultValues: defaultFormValues });

  const hydratedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isNew || !data) return;
    // Hydrate once per company so SWR revalidation cannot wipe in-progress edits.
    if (hydratedIdRef.current === companyId) return;
    hydratedIdRef.current = companyId ?? null;
    reset(companyToFormValues(data));
  }, [isNew, data, reset, companyId]);

  /** Cohort writes return the whole company; store it without refetching. */
  const onCompanyChange = async (company: Company) => {
    await mutate(detailUrl, company, { revalidate: false });
    await mutate(ADMIN_COMPANIES_ENDPOINT);
  };

  const readOnly = !canManage || saving;

  const handleLogoChange = (file: File | null) => {
    setPendingLogo(file);
    setClearLogo(!file && !!data?.logo);
  };

  /** Applies a pending logo upload or removal; returns the company as it now stands. */
  const saveLogo = async (company: Company) => {
    if (pendingLogo) {
      const updated = await uploadCompanyLogo(company.id, pendingLogo);
      setPendingLogo(null);
      return updated;
    }
    if (clearLogo) {
      const updated = await removeCompanyLogo(company.id);
      setClearLogo(false);
      return updated;
    }
    return company;
  };

  const onSave = async (formValues: CompanyFormValues) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (isNew) {
        const created = await createCompany({
          ...formValues,
          slug: formValues.slug.trim(),
          name: formValues.name.trim(),
        });
        await saveLogo(created);
        await mutate(ADMIN_COMPANIES_ENDPOINT);
        setToast({
          id: Date.now(),
          headline: 'Success',
          title: 'Company created.',
        });
        navigate(getCompanyEditRoute(created.id));
        return;
      }
      // The slug is immutable; leaving it out avoids a 400 for an unchanged value.
      const { slug: _slug, ...changes } = formValues;
      const updated = await saveLogo(
        await updateCompany(Number(companyId), {
          ...changes,
          name: changes.name.trim(),
        }),
      );
      await onCompanyChange(updated);
      reset(companyToFormValues(updated));
      setToast({
        id: Date.now(),
        headline: 'Success',
        title: 'Company saved.',
      });
    } catch (e: any) {
      setSaveError(describeError(e, 'Failed to save company.'));
      setToast({
        id: Date.now(),
        headline: 'Error',
        title: 'Company not saved.',
      });
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isNew ? 'New company' : data?.name || '…';

  usePageHeader({
    breadcrumbs: {
      items: [{ label: 'Companies', to: COMPANIES_ROUTE }],
      current: pageTitle,
    },
    actions: canManage ? (
      <>
        <Controller
          name="is_active"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              label={value ? 'Active' : 'Inactive'}
              labelInline
              cannotError
              checked={!!value}
              onCheckedChange={onChange}
              disabled={saving}
            />
          )}
        />
        <TopBarDivider />
        <Button
          appearance={ButtonAppearance.Primary}
          size={ButtonSizes.Small}
          onClick={handleSubmit(onSave)}
          disabled={saving}
          loading={saving}
        >
          {isNew ? 'Create company' : 'Save changes'}
        </Button>
      </>
    ) : undefined,
  });

  return (
    <EditorRoot>
      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load company.
        </StatusMessage>
      )}
      {!canManage && (
        <StatusMessage type={StatusTypes.Warning} visible withBorder>
          Read only — editing companies needs the “manage companies” permission.
        </StatusMessage>
      )}
      {saveError && (
        <StatusMessage type={StatusTypes.Error} visible withBorder>
          {saveError}
        </StatusMessage>
      )}

      {isLoading && !isNew ? (
        <LoadingWrap>
          <Loading size={LoadingSizes.Medium} />
        </LoadingWrap>
      ) : (
        <MainPane>
          <PaneRoot $center $maxWidth="1000px">
            <div>
              <PaneHeading>Company details</PaneHeading>
              <PaneHint>
                {isNew
                  ? 'The slug is what signup links and filters use. It cannot be changed once the company exists.'
                  : `${data?.user_count ?? 0} users. Flags are defaults for every user in the company.`}
              </PaneHint>
            </div>

            <FormStack>
              <DetailsRow>
                <LogoColumn>
                  {canManage ? (
                    <ImageUploadField
                      label="Logo"
                      existingImageUrl={
                        clearLogo ? null : resolveCourseImageUrl(data?.logo)
                      }
                      file={pendingLogo}
                      onFileChange={handleLogoChange}
                      disabled={saving}
                      compact
                    />
                  ) : (
                    <LogoFrame>
                      <Text type={TextTypes.Body6} bold tag="span">
                        Logo
                      </Text>
                      <LogoBox>
                        {data?.logo ? (
                          <LogoImage
                            src={resolveCourseImageUrl(data.logo) ?? undefined}
                            alt={`${data.name} logo`}
                          />
                        ) : (
                          <Text type={TextTypes.Body6} tag="span">
                            No logo
                          </Text>
                        )}
                      </LogoBox>
                    </LogoFrame>
                  )}
                </LogoColumn>

                <DetailsFields>
                  <TwoCol>
                    <TextInput
                      label="Name"
                      required
                      placeholder="e.g. FH Aachen"
                      width={InputWidth.Large}
                      disabled={readOnly}
                      error={errors.name?.message}
                      {...registerInput({
                        register,
                        name: 'name',
                        options: { required: 'Required' },
                      })}
                    />
                    <TextInput
                      label="Slug"
                      required
                      placeholder="e.g. fh-aachen"
                      labelTooltip="Stable identifier used in signup links, filters and survey audiences. Cannot be changed once created."
                      width={InputWidth.Large}
                      disabled={readOnly || !isNew}
                      error={errors.slug?.message}
                      {...registerInput({
                        register,
                        name: 'slug',
                        options: { required: 'Required' },
                      })}
                    />
                  </TwoCol>

                  <TextArea
                    label="Description"
                    rows={3}
                    placeholder="Who the partner is and what the partnership covers."
                    disabled={readOnly}
                    {...registerInput({ register, name: 'description' })}
                  />
                </DetailsFields>
              </DetailsRow>

              {!isNew && data && (
                <>
                  <Divider />
                  <SignupLinkSection
                    company={data}
                    canManage={canManage}
                    onCompanyChange={onCompanyChange}
                    onToast={setToast}
                  />
                </>
              )}

              <Divider />
              <SectionTitle>Flags</SectionTitle>

              <FlagGrid>
                {COMPANY_FLAGS.map(flag => (
                  <FlagCell key={flag}>
                    <Controller
                      name={flag}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FlagSwitch
                          id={`company_${flag}`}
                          label={COMPANY_FLAG_CONFIG[flag].label}
                          description={COMPANY_FLAG_CONFIG[flag].description}
                          labelInline
                          fullWidth
                          cannotError
                          checked={!!value}
                          onCheckedChange={onChange}
                          disabled={readOnly}
                        />
                      )}
                    />
                  </FlagCell>
                ))}
              </FlagGrid>
            </FormStack>

            {!isNew && data && (
              <>
                <Divider />
                <CohortsSection
                  company={data}
                  canManage={canManage}
                  onCompanyChange={onCompanyChange}
                  onToast={setToast}
                />
              </>
            )}
          </PaneRoot>
        </MainPane>
      )}

      {toast && (
        <Toast
          key={toast.id}
          headline={toast.headline}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </EditorRoot>
  );
}

export default EditCompany;
