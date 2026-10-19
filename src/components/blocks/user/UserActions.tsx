import {
  Accordion,
  Button,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Checkbox,
  Loading,
  Modal,
  Select,
  StatusMessage,
  StatusTypes,
  Text,
  TextArea,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty, map } from 'lodash';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';
import useSWR from 'swr';

import {
  ADMIN_COMPANIES_ENDPOINT,
  Company,
  fetchCompanies,
  formatCompanyLabel,
} from '../../../api/companies';
import {
  deleteUser,
  fetchMatchingPanelUser,
  fetchUserManagementPermissions,
  inviteNativeAppTester,
  migrateUser,
  sendPushNotification,
  sendSms,
  setHadPrematchingCall,
  setHasMatchPriority,
  setForceMatchEligible,
  setNewsletterSubscribed,
  setUserCompany,
  setUserManagementPermission,
  setUserSearching,
  setUserUnresponsive,
  updateUserProfileFields,
} from '../../../api/index';
import { formatCountryOfResidenceOptions } from '../../../helpers/countryOfResidenceOptions';
import { registerInput, useGlobalState } from '../../../store';

const SUPPORT_USERS = [
  {
    label: 'littleworld.management@gmail.com',
    value: 'littleworld.management@gmail.com',
  },
  {
    label: 'tim.timschupp+420@gmail.com',
    value: 'tim.timschupp+420@gmail.com',
  },
];

const NATIVE_APP_PLATFORM_OPTIONS = [
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' },
];

const USER_TYPE_OPTIONS = [
  { label: 'Learner', value: 'learner' },
  { label: 'Volunteer', value: 'volunteer' },
];

/** Radix Select forbids empty values, so "no company" / "no cohort" need a sentinel. */
const NO_COMPANY = 'none';

/**
 * Match priority and force-match eligibility are company defaults a user can override.
 * The override is tri-state: `null` follows the company, true/false pins the user.
 */
type FlagOverride = 'default' | 'on' | 'off';

const toFlagOverride = (override: boolean | null | undefined): FlagOverride =>
  override == null ? 'default' : override ? 'on' : 'off';

const fromFlagOverride = (value: FlagOverride): boolean | null =>
  value === 'on' ? true : value === 'off' ? false : null;

/**
 * `inherited` is what the user gets with the override cleared, as computed by the backend
 * (company flag, or for match priority also a priority signup campaign) — never the effective
 * value, which reflects the override itself.
 */
const flagOverrideOptions = (inherited: boolean | undefined) => [
  {
    label:
      inherited === undefined
        ? 'Default'
        : `Default (currently ${inherited ? 'on' : 'off'})`,
    value: 'default',
  },
  { label: 'On', value: 'on' },
  { label: 'Off', value: 'off' },
];

/** Form keys whose value is a `FlagOverride` and must be converted before sending. */
const FLAG_OVERRIDE_KEYS = ['priority', 'forceMatchEligible'];

/** Only staff can grant/revoke `management.apply_management_permissions`. */
const APPLY_MANAGEMENT_PERMISSIONS = 'management.apply_management_permissions';

function ManagementPermissionsSection({
  onUserUpdated,
  userId,
  canGrantApplyManagementPermissions,
  permissionsData,
  permissionsError,
  permissionsLoading,
  permissionsMutate,
}: {
  onUserUpdated: () => void;
  userId: string;
  canGrantApplyManagementPermissions: boolean;
  permissionsData?: { permissions: any[] };
  permissionsError?: unknown;
  permissionsLoading: boolean;
  permissionsMutate: () => Promise<any>;
}) {
  const [pendingPermission, setPendingPermission] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const rows = permissionsData?.permissions ?? [];

  const onToggle = (permission: string, nextEnabled: boolean) => {
    if (
      permission === APPLY_MANAGEMENT_PERMISSIONS &&
      !canGrantApplyManagementPermissions
    ) {
      return;
    }
    setActionError(null);
    setPendingPermission(permission);
    setUserManagementPermission({
      userId,
      action: nextEnabled ? 'add' : 'remove',
      permission,
      onSuccess: async () => {
        await permissionsMutate();
        onUserUpdated();
        setPendingPermission(null);
      },
      onError: (e: any) => {
        setActionError(e?.message || 'Could not update permission.');
        setPendingPermission(null);
        permissionsMutate();
      },
    });
  };

  if (permissionsLoading) {
    return <Loading />;
  }

  if (permissionsError) {
    return (
      <Text type={TextTypes.Body4}>Could not load management permissions.</Text>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {actionError && (
        <StatusMessage type={StatusTypes.Error} visible>
          {actionError}
        </StatusMessage>
      )}
      {rows.map(row => {
        const isApplyPermissionReadOnly =
          row.permission === APPLY_MANAGEMENT_PERMISSIONS &&
          !canGrantApplyManagementPermissions;

        return (
          <div key={row.permission} className="flex flex-col gap-1">
            <Checkbox
              disabled={pendingPermission !== null}
              readOnly={isApplyPermissionReadOnly}
              id={`mgmt-perm-${row.codename}`}
              label={
                isApplyPermissionReadOnly
                  ? `${row.label} [STAFF ONLY]`
                  : (row.label ?? row.codename)
              }
              checked={row.enabled}
              onCheckedChange={(val: boolean) => {
                if (val !== row.enabled) {
                  onToggle(row.permission, val);
                }
              }}
              required={false}
            />
          </div>
        );
      })}
    </div>
  );
}

function SendSms({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccessfully, setSentSuccessfully] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onError = error => {
    setError('smsMessage', {
      message: error?.message || 'Issue sending message',
    });
    setIsSubmitting(false);
  };

  const onSendSms = data => {
    setIsSubmitting(true);
    sendSms({
      userId: userId,
      message: data,
      onError,
      onSuccess: () => {
        setIsSubmitting(false);
        setSentSuccessfully(true);
      },
    });
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit(onSendSms)}>
      <TextArea
        {...registerInput({
          register,
          name: 'smsMessage',
          options: {},
        })}
        label={'Send the user an sms'}
        placeholder={'Write your message here...'}
        error={errors?.smsMessage?.message}
      />
      {sentSuccessfully && <div>Sms sent successfully</div>}
      <Button type="submit" disabled={isSubmitting || sentSuccessfully}>
        Send SMS
      </Button>
    </form>
  );
}

function SendPushNotification({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccessfully, setSentSuccessfully] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onError = error => {
    setError('pushNotificationDescription', {
      message: error?.message || 'Issue sending push notification',
    });
    setIsSubmitting(false);
  };

  const onSendPushNotification = data => {
    setIsSubmitting(true);
    sendPushNotification({
      userId: userId,
      message: data,
      onError,
      onSuccess: () => {
        setIsSubmitting(false);
        setSentSuccessfully(true);
      },
    });
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit(onSendPushNotification)}>
      <TextInput
        {...registerInput({
          register,
          name: 'pushNotificationTitle',
          options: {},
        })}
        onChange={() => setSentSuccessfully(false)}
        placeholder="Title"
        error={errors?.pushNotificationTitle?.message}
      />
      <TextArea
        {...registerInput({
          register,
          name: 'pushNotificationDescription',
          options: {},
        })}
        onChange={() => setSentSuccessfully(false)}
        placeholder={'Write your message here...'}
        error={errors?.pushNotificationDescription?.message}
      />

      {sentSuccessfully && <div>Push notification sent successfully</div>}
      <Button type="submit" disabled={isSubmitting}>
        Send push notification
      </Button>
    </form>
  );
}

function InviteNativeAppTester({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccessfully, setSentSuccessfully] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      appInviteUrl: '',
      betaTesterEmail: user.email || '',
      nativeAppRepoUrl: '',
      nativeAppBugReportUrl: '',
      littleWorldAccountEmail: user.email || '',
    },
  });
  const isIos = platform === 'ios';

  const normalizePlatformValue = (value: any): 'ios' | 'android' => {
    if (value === 'ios' || value === 'android') return value;
    if (
      Array.isArray(value) &&
      (value[0] === 'ios' || value[0] === 'android')
    ) {
      return value[0];
    }
    if (value?.target?.value === 'ios' || value?.target?.value === 'android') {
      return value.target.value;
    }
    return 'ios';
  };

  const onSubmitInvite = data => {
    setIsSubmitting(true);
    setSentSuccessfully(false);
    inviteNativeAppTester({
      userId: user.id,
      platform,
      betaTesterEmail: data.betaTesterEmail,
      appInviteUrl: data.appInviteUrl,
      nativeAppRepoUrl: data.nativeAppRepoUrl,
      nativeAppBugReportUrl: data.nativeAppBugReportUrl,
      littleWorldAccountEmail: data.littleWorldAccountEmail,
      onSuccess: () => {
        setIsSubmitting(false);
        setSentSuccessfully(true);
      },
      onError: error => {
        setIsSubmitting(false);
        setError('root.serverError', {
          type: error?.status || 'server',
          message: error?.message || 'Failed to send native app invite email',
        });
      },
    });
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit(onSubmitInvite)}>
      <Text className="mb-2" tag="h4" bold>
        {isIos ? 'iOS Beta Invite' : 'Android Beta Invite'}
      </Text>
      <Select
        id="platform"
        name="platform"
        onValueChange={val => {
          setPlatform(normalizePlatformValue(val));
          setSentSuccessfully(false);
        }}
        value={platform}
        defaultChecked={platform}
        label="Platform Target"
        options={NATIVE_APP_PLATFORM_OPTIONS}
      />

      <TextInput
        key={`app-invite-${platform}`}
        {...registerInput({
          register,
          name: 'appInviteUrl',
          options: { required: 'App invite URL is required' },
        })}
        onChange={() => setSentSuccessfully(false)}
        label={isIos ? 'iOS TestFlight Link' : 'Android Play Store Beta Link'}
        placeholder={
          isIos
            ? 'https://testflight.apple.com/...'
            : 'https://play.google.com/...'
        }
        error={errors?.appInviteUrl?.message}
      />

      <TextInput
        {...registerInput({
          register,
          name: 'betaTesterEmail',
          options: { required: 'Tester invite email is required' },
        })}
        onChange={() => setSentSuccessfully(false)}
        label={
          isIos
            ? 'iOS Tester Invite Email (TestFlight/App Store)'
            : 'Android Tester Invite Email (Play Store)'
        }
        placeholder="tester@example.com"
        error={errors?.betaTesterEmail?.message}
      />

      <TextInput
        {...registerInput({
          register,
          name: 'nativeAppRepoUrl',
          options: { required: 'Repository URL is required' },
        })}
        onChange={() => setSentSuccessfully(false)}
        label="Native App Repository URL"
        placeholder="https://github.com/..."
        error={errors?.nativeAppRepoUrl?.message}
      />

      <TextInput
        {...registerInput({
          register,
          name: 'nativeAppBugReportUrl',
          options: { required: 'Bug report URL is required' },
        })}
        onChange={() => setSentSuccessfully(false)}
        label="Bug Report URL"
        placeholder="https://github.com/.../issues"
        error={errors?.nativeAppBugReportUrl?.message}
      />

      <TextInput
        key={`account-email-${platform}`}
        {...registerInput({
          register,
          name: 'littleWorldAccountEmail',
          options: {},
        })}
        onChange={() => setSentSuccessfully(false)}
        label={
          isIos
            ? 'Little World Account Email (used to login in iOS app)'
            : 'Little World Account Email (used to login in Android app)'
        }
        placeholder="user@example.com"
        error={errors?.littleWorldAccountEmail?.message}
      />

      <StatusMessage
        visible={sentSuccessfully || !!errors?.root?.serverError}
        type={sentSuccessfully ? StatusTypes.Success : StatusTypes.Error}
      >
        {sentSuccessfully
          ? `Native app beta invite sent (${platform})`
          : errors?.root?.serverError?.message}
      </StatusMessage>

      <Button type="submit" disabled={isSubmitting}>
        {isIos ? 'Send iOS Invite Email' : 'Send Android Invite Email'}
      </Button>
    </form>
  );
}

/**
 * Assigns the user to a company and, optionally, one of its cohorts. Only active companies
 * and cohorts can be chosen; a user already on an inactive one still sees it selected.
 */
function CompanySection({
  user,
  companies,
  companiesLoading,
  onUpdate,
}: {
  user: any;
  companies?: Company[];
  companiesLoading: boolean;
  onUpdate: () => void;
}) {
  const currentCompany: string = user.state.company?.slug ?? NO_COMPANY;
  const currentCohort: string = user.state.company_cohort?.slug ?? NO_COMPANY;
  const [company, setCompany] = useState(currentCompany);
  const [cohort, setCohort] = useState(currentCohort);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCompany = companies?.find(row => row.slug === company);
  const isCurrent = (slug: string, current: string) => slug === current;

  const companyOptions = [
    { label: 'No company', value: NO_COMPANY },
    ...(companies ?? [])
      .filter(row => row.is_active || isCurrent(row.slug, currentCompany))
      .map(row => ({
        label: row.is_active ? row.name : `${row.name} (inactive)`,
        value: row.slug,
      })),
  ];
  const cohortOptions = [
    { label: 'No cohort', value: NO_COMPANY },
    ...(selectedCompany?.cohorts ?? [])
      .filter(
        row =>
          row.is_active ||
          (company === currentCompany && isCurrent(row.slug, currentCohort)),
      )
      .map(row => ({
        label: row.is_active ? row.name : `${row.name} (inactive)`,
        value: row.slug,
      })),
  ];

  const unchanged = company === currentCompany && cohort === currentCohort;

  const onSave = () => {
    setIsSubmitting(true);
    setSaved(false);
    setError(null);
    setUserCompany({
      id: user.id,
      company: company === NO_COMPANY ? null : company,
      cohort: company === NO_COMPANY || cohort === NO_COMPANY ? null : cohort,
      onError: e => {
        setError(e?.message || 'Could not change the company.');
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
        setSaved(true);
        onUpdate();
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 pt-2">
      <Text>
        {`Currently: ${formatCompanyLabel(user.state.company, user.state.company_cohort) || 'No company'}`}
      </Text>
      <Select
        id="user_company"
        key={`user_company_${company}_${companyOptions.length}`}
        label="Company"
        placeholder="Select a company"
        value={company}
        options={companyOptions}
        disabled={companiesLoading || isSubmitting}
        onValueChange={value => {
          setCompany(value);
          // Cohorts belong to one company; switching company clears the choice.
          setCohort(value === currentCompany ? currentCohort : NO_COMPANY);
          setSaved(false);
        }}
      />
      <Select
        id="user_company_cohort"
        key={`user_company_cohort_${company}_${cohort}`}
        label="Cohort"
        placeholder="Select a cohort"
        value={cohort}
        options={cohortOptions}
        disabled={companiesLoading || isSubmitting || company === NO_COMPANY}
        onValueChange={value => {
          setCohort(value);
          setSaved(false);
        }}
      />
      <StatusMessage
        visible={saved || !!error}
        type={saved ? StatusTypes.Success : StatusTypes.Error}
      >
        {saved ? 'Company updated' : error}
      </StatusMessage>
      <div>
        <Button onClick={onSave} disabled={isSubmitting || unchanged}>
          Save company
        </Button>
      </div>
    </div>
  );
}

const UserActions = ({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate: () => void;
}) => {
  const theme = useTheme();
  const { apiOptions, apiTranslations } = useGlobalState();
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);
  const [migrateUserModalOpen, setMigrateUserModalOpen] = useState(false);
  const [migrateUserError, setMigrateUserError] = useState<string | null>(null);
  const [migrateEmail, setMigrateEmail] = useState('');
  const [migrateRemoveCompany, setMigrateRemoveCompany] = useState(false);
  const [migrateCensor, setMigrateCensor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);
  const { data: currentUser, isLoading: currentUserLoading } = useSWR(
    '/api/matching/me/',
    fetchMatchingPanelUser,
    { revalidateOnFocus: false },
  );
  const {
    data: permissionsData,
    error: permissionsError,
    isLoading: permissionsLoading,
    mutate: permissionsMutate,
  } = useSWR(
    `/api/matching/users/${user.id}/permissions/`,
    () => fetchUserManagementPermissions(user.id),
    { revalidateOnFocus: false },
  );

  const { data: companies, isLoading: companiesLoading } = useSWR(
    ADMIN_COMPANIES_ENDPOINT,
    fetchCompanies,
    { revalidateOnFocus: false },
  );

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, errors },
    setError,
  } = useForm();

  const countryOptions = formatCountryOfResidenceOptions(
    (apiOptions as any)?.profile?.country_of_residence,
    apiTranslations as Record<string, Record<string, string>>,
  );

  const saveChanges = data => {
    if (isEmpty(dirtyFields)) return;
    setIsSubmitting(true);

    Promise.all(
      map(dirtyFields, (_, key) => {
        let func;
        if (key === 'unresponsive') {
          func = setUserUnresponsive;
        } else if (key === 'completed') {
          func = setHadPrematchingCall;
        } else if (key === 'newsletter') {
          func = setNewsletterSubscribed;
        } else if (key === 'searching') {
          func = setUserSearching;
        } else if (key === 'priority') {
          func = setHasMatchPriority;
        } else if (key === 'forceMatchEligible') {
          func = setForceMatchEligible;
        } else if (key === 'user_type' || key === 'country_of_residence') {
          func = updateUserProfileFields;
        } else {
          console.error(`No function mapped for key: ${key}`);
          return Promise.reject(
            new Error(`No function mapped for key: ${key}`),
          );
        }

        return func({
          userId: user.id,
          [key]: FLAG_OVERRIDE_KEYS.includes(key)
            ? fromFlagOverride(data[key])
            : data[key],
          onError: error => {
            setError(key, error.message);
            throw error;
          },
          onSuccess: () => null,
        });
      }),
    )
      .then(() => {
        setIsSubmitting(false);
        setChangesSaved(true);
        onUpdate();
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  const onDeleteUser = () => {
    setIsSubmitting(true);
    setChangesSaved(false);
    setDeleteUserError(null);
    deleteUser({
      id: user.id,
      onError: error => {
        console.error(error);
        setDeleteUserError(error?.message || 'Could not delete this user.');
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
        setChangesSaved(true);
        setDeleteUserModalOpen(false);
        onUpdate();
      },
    });
  };

  const openMigrateUserModal = () => {
    setMigrateUserError(null);
    setMigrateEmail('');
    setMigrateRemoveCompany(false);
    setMigrateCensor(true);
    setMigrateUserModalOpen(true);
  };

  const onMigrateUser = () => {
    setIsSubmitting(true);
    setChangesSaved(false);
    setMigrateUserError(null);
    migrateUser({
      id: user.id,
      newEmail: migrateEmail.trim() ? migrateEmail.trim() : null,
      removeCompany: migrateRemoveCompany,
      censor: migrateCensor,
      onError: error => {
        console.error(error);
        setMigrateUserError(error?.message || 'Could not migrate this user.');
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
        setChangesSaved(true);
        setMigrateUserModalOpen(false);
        onUpdate();
      },
    });
  };

  const permissionsStatus = (
    permissionsError as { status?: number } | undefined
  )?.status;
  const showManagementPermissionsSection =
    Boolean(permissionsData) ||
    (Boolean(permissionsError) && permissionsStatus !== 403);
  const canUpdateMatchingProfileFields = Boolean(currentUser?.is_matching_user);
  const canDeleteUser = Boolean(currentUser?.can_edit_management_permissions);
  const canMigrateUser = canDeleteUser;
  const canGrantApplyManagementPermissions = Boolean(
    currentUser?.can_grant_apply_management_permissions,
  );
  const targetIsProtected = Boolean(
    user.is_staff || user.is_superuser || user.is_matching_user,
  );
  const deleteDisabled =
    isSubmitting ||
    currentUserLoading ||
    permissionsLoading ||
    !canDeleteUser ||
    targetIsProtected;
  const migrateDisabled =
    isSubmitting ||
    currentUserLoading ||
    permissionsLoading ||
    !canMigrateUser ||
    targetIsProtected ||
    (!migrateEmail.trim() && !migrateRemoveCompany);

  return (
    <div className="w-full">
      <Accordion
        items={[
          {
            header: 'SMS / Push',
            content: (
              <div className="pt-2">
                <SendSms userId={user.id} />
                <SendPushNotification userId={user.id} />
              </div>
            ),
          },
          ...(canUpdateMatchingProfileFields
            ? [
                {
                  header: 'Company',
                  content: (
                    <CompanySection
                      user={user}
                      companies={companies}
                      companiesLoading={companiesLoading}
                      onUpdate={onUpdate}
                    />
                  ),
                },
              ]
            : []),
          ...(showManagementPermissionsSection
            ? [
                {
                  header: 'Management permissions',
                  content: (
                    <ManagementPermissionsSection
                      userId={user.id}
                      canGrantApplyManagementPermissions={
                        canGrantApplyManagementPermissions
                      }
                      onUserUpdated={onUpdate}
                      permissionsData={permissionsData}
                      permissionsError={permissionsError}
                      permissionsLoading={permissionsLoading}
                      permissionsMutate={permissionsMutate}
                    />
                  ),
                },
              ]
            : []),
          {
            header: 'Support User Actions',
            content: (
              <div className="pt-2">
                <form
                  className="mb-4"
                  onSubmit={handleSubmit(saveChanges)}
                  onChange={() => setChangesSaved(false)}
                >
                  <Controller
                    defaultValue={user.state.user_support}
                    name="support_user"
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <Select
                        id="support_user"
                        name={name}
                        inputRef={ref}
                        onCheckedChange={val =>
                          onChange({ target: { value: val } })
                        }
                        onBlur={onBlur}
                        value={value}
                        defaultChecked={value}
                        error={error?.message}
                        label="Change support user"
                        options={SUPPORT_USERS}
                      />
                    )}
                  />
                  {canUpdateMatchingProfileFields && (
                    <>
                      <Controller
                        defaultValue={user.profile.user_type}
                        name="user_type"
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <Select
                            id="user_type"
                            onValueChange={val =>
                              onChange({ target: { value: val } })
                            }
                            value={value}
                            error={error?.message}
                            label="User type"
                            options={USER_TYPE_OPTIONS}
                            placeholder="Select a user type"
                          />
                        )}
                      />
                      <Controller
                        defaultValue={user.profile.country_of_residence}
                        name="country_of_residence"
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <Select
                            id="country_of_residence"
                            onValueChange={val =>
                              onChange({ target: { value: val } })
                            }
                            value={value}
                            error={error?.message}
                            label="Country of residence"
                            options={countryOptions}
                            placeholder="Select a country"
                          />
                        )}
                      />
                    </>
                  )}
                  <Controller
                    defaultValue={user.profile.newsletter_subscribed}
                    name="newsletter"
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <Checkbox
                        id="newsletter"
                        name={name}
                        inputRef={ref}
                        onCheckedChange={val =>
                          onChange({ target: { value: val } })
                        }
                        onBlur={onBlur}
                        value={value}
                        defaultChecked={value}
                        error={error?.message}
                        label="Subscribed to newsletter"
                        required={false}
                      />
                    )}
                  />
                  <Controller
                    defaultValue={user.state.had_prematching_call}
                    name="completed"
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <Checkbox
                        id="completed"
                        name={name}
                        inputRef={ref}
                        onCheckedChange={val =>
                          onChange({ target: { value: val } })
                        }
                        onBlur={onBlur}
                        value={value}
                        defaultChecked={value}
                        error={error?.message}
                        label={'User has completed Pre-matching call'}
                        required={false}
                      />
                    )}
                  />
                  <Controller
                    defaultValue={user.state.unresponsive}
                    name="unresponsive"
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <Checkbox
                        id="unresponsive"
                        name={name}
                        inputRef={ref}
                        onCheckedChange={val =>
                          onChange({ target: { value: val } })
                        }
                        onBlur={onBlur}
                        value={value}
                        defaultChecked={value}
                        error={error?.message}
                        label="This user is no longer responsive?"
                        required={false}
                      />
                    )}
                  />
                  <Controller
                    defaultValue={user.state.searching_state === 'searching'}
                    name="searching"
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <Checkbox
                        id="searching"
                        name={name}
                        inputRef={ref}
                        checked={Boolean(value)}
                        onCheckedChange={onChange}
                        onBlur={onBlur}
                        error={error?.message}
                        label={'Is user searching for another match?'}
                        required={false}
                      />
                    )}
                  />
                  <Controller
                    defaultValue={toFlagOverride(
                      user.state.match_priority_override,
                    )}
                    name="priority"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <Select
                        id="priority"
                        onValueChange={onChange}
                        value={value}
                        error={error?.message}
                        label="Match priority"
                        labelTooltip="Prioritised in matching. Default follows the user's company or a priority signup campaign. International SMS follows the company or campaign only and is not changed by this setting."
                        options={flagOverrideOptions(
                          user.state.match_priority_default,
                        )}
                        placeholder="Select match priority"
                      />
                    )}
                  />
                  <Controller
                    defaultValue={toFlagOverride(
                      user.state.force_match_eligible_override,
                    )}
                    name="forceMatchEligible"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <Select
                        id="forceMatchEligible"
                        onValueChange={onChange}
                        value={value}
                        error={error?.message}
                        label="Force match eligible"
                        labelTooltip="Bypasses the A0 language level and outside-Germany checks. Default follows the user's company."
                        options={flagOverrideOptions(
                          user.state.force_match_eligible_default,
                        )}
                        placeholder="Select force match eligibility"
                      />
                    )}
                  />

                  <StatusMessage
                    visible={changesSaved || !!errors?.root?.serverError}
                    type={
                      changesSaved ? StatusTypes.Success : StatusTypes.Error
                    }
                  >
                    {changesSaved
                      ? 'Changes updated successfully'
                      : errors?.root?.serverError?.message}
                  </StatusMessage>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isEmpty(dirtyFields)}
                  >
                    Save Changes
                  </Button>
                </form>
              </div>
            ),
          },
          {
            header: 'Developer Actions',
            content: (
              <div className="pt-2">
                <InviteNativeAppTester user={user} />
              </div>
            ),
          },
          {
            header: 'Danger Zone',
            content: (
              <div className="pt-2">
                <div className="p-2 flex flex-col gap-2">
                  <Text tag="h3" type={TextTypes.Heading5}>
                    Danger Zone
                  </Text>
                  <Text className="mb-2">
                    Migrate the user: change their email or remove their company
                    attribution. Optionally keep a stale censored copy of the
                    profile so matches, chats and call history stay resolvable.
                  </Text>
                  <div>
                    <Button
                      onClick={openMigrateUserModal}
                      backgroundColor={theme.color.status.error}
                    >
                      Migrate User
                    </Button>
                  </div>
                  <Text className="mt-2 mb-2">
                    Delete the user and censor their profile
                  </Text>
                  <div>
                    <Button
                      onClick={() => {
                        setDeleteUserError(null);
                        setDeleteUserModalOpen(true);
                      }}
                      backgroundColor={theme.color.status.error}
                    >
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
      <Modal
        open={deleteUserModalOpen}
        onClose={() => setDeleteUserModalOpen(false)}
      >
        <Card width={CardSizes.Medium}>
          <CardHeader>Are you sure you want to delete this user?</CardHeader>
          <CardContent>
            <Text>
              This will delete the user account, censor their profile, close
              their proposals, update their matches, and send the account
              deletion email.
            </Text>
            <StatusMessage
              type={StatusTypes.Error}
              visible={!canDeleteUser || targetIsProtected || !!deleteUserError}
            >
              {deleteUserError ||
                (targetIsProtected
                  ? 'Staff, superusers, and matching users cannot be deleted from this view.'
                  : `You do not have the required permissions to delete this user.`)}
            </StatusMessage>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onDeleteUser}
              backgroundColor={theme.color.status.error}
              disabled={deleteDisabled}
              size={ButtonSizes.Stretch}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </CardFooter>
        </Card>
      </Modal>
      <Modal
        open={migrateUserModalOpen}
        onClose={() => setMigrateUserModalOpen(false)}
      >
        <Card width={CardSizes.Medium}>
          <CardHeader>Migrate user</CardHeader>
          <CardContent>
            <Text>
              Change the user's email address and/or remove their company
              attribution. When censoring is enabled the existing profile is
              kept as a stale censored copy, so matches, chats and call history
              stay resolvable.
            </Text>
            <TextInput
              id="migrate_email"
              label="New email address"
              placeholder="Leave empty to keep the current email"
              value={migrateEmail}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setMigrateEmail(event.target.value)
              }
              autoComplete="off"
            />
            <Checkbox
              id="migrate_remove_company"
              label={`Remove company (${formatCompanyLabel(user.state?.company, user.state?.company_cohort) || 'none'})`}
              checked={migrateRemoveCompany}
              onCheckedChange={checked =>
                setMigrateRemoveCompany(checked === true)
              }
              required={false}
            />
            <Checkbox
              id="migrate_censor"
              label="Censor the profile in place (keep a stale ghost for references)"
              checked={migrateCensor}
              onCheckedChange={checked => setMigrateCensor(checked === true)}
              required={false}
            />
            <StatusMessage
              type={StatusTypes.Error}
              visible={
                !canMigrateUser || targetIsProtected || !!migrateUserError
              }
            >
              {migrateUserError ||
                (targetIsProtected
                  ? 'Staff, superusers, and matching users cannot be migrated from this view.'
                  : `You do not have the required permissions to migrate this user.`)}
            </StatusMessage>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onMigrateUser}
              backgroundColor={theme.color.status.error}
              disabled={migrateDisabled}
              size={ButtonSizes.Stretch}
            >
              {isSubmitting ? 'Migrating...' : 'Migrate User'}
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    </div>
  );
};

export default UserActions;
