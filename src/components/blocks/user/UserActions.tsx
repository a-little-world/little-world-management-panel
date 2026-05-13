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
  Dropdown,
  Loading,
  Modal,
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
  deleteUser,
  fetchUserManagementPermissions,
  inviteNativeAppTester,
  sendPushNotification,
  sendSms,
  setHadPrematchingCall,
  setHasMatchPriority,
  setNewsletterSubscribed,
  setRandomCallsAccess,
  setUserManagementPermission,
  setUserSearching,
  setUserUnresponsive,
} from '../../../api/index';
import { registerInput } from '../../../store';

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

/** Django `management.apply_management_permissions` — cannot be granted/revoked via API. */
const APPLY_MANAGEMENT_PERMISSIONS = 'management.apply_management_permissions';

function ManagementPermissionsSection({
  onUserUpdated,
  userId,
  permissionsData,
  permissionsError,
  permissionsLoading,
  permissionsMutate,
}: {
  onUserUpdated: () => void;
  userId: string;
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
    if (permission === APPLY_MANAGEMENT_PERMISSIONS) return;
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
      {rows.map(row => (
        <div key={row.permission} className="flex flex-col gap-1">
          <Checkbox
            disabled={pendingPermission !== null}
            readOnly={row.permission === APPLY_MANAGEMENT_PERMISSIONS}
            id={`mgmt-perm-${row.codename}`}
            label={
              row.permission === APPLY_MANAGEMENT_PERMISSIONS
                ? `${row.label} [READ ONLY]`
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
      ))}
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
      <Dropdown
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

const UserActions = ({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate: () => void;
}) => {
  const theme = useTheme();
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);
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

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, errors },
    setError,
  } = useForm();

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
        } else if (key === 'randomCallsAccess') {
          func = setRandomCallsAccess;
        } else {
          console.error(`No function mapped for key: ${key}`);
          return Promise.reject(
            new Error(`No function mapped for key: ${key}`),
          );
        }

        return func({
          userId: user.id,
          [key]: data[key],
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
    deleteUser({
      id: user.id,
      onError: error => {
        console.error(error);
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
        setChangesSaved(true);
        onUpdate();
      },
    });
  };

  const hasRandomCallsAccess = (
    user.state.extra_user_permissions || []
  ).includes('use-random-calls');
  const permissionsStatus = (
    permissionsError as { status?: number } | undefined
  )?.status;
  const showManagementPermissionsSection =
    Boolean(permissionsData) ||
    (Boolean(permissionsError) && permissionsStatus !== 403);

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
          ...(showManagementPermissionsSection
            ? [
                {
                  header: 'Management permissions',
                  content: (
                    <ManagementPermissionsSection
                      userId={user.id}
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
                      <Dropdown
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
                    defaultValue={
                      user.state.searching_state === 'idle' ? false : true
                    }
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
                        onCheckedChange={val =>
                          onChange({ target: { value: val } })
                        }
                        onBlur={onBlur}
                        value={value}
                        defaultChecked={value}
                        error={error?.message}
                        label={'Is user searching for another match?'}
                        required={false}
                      />
                    )}
                  />
                  <Controller
                    defaultValue={user.state.has_match_priority}
                    name="priority"
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <Checkbox
                        id="priority"
                        name={name}
                        inputRef={ref}
                        onCheckedChange={val =>
                          onChange({ target: { value: val } })
                        }
                        onBlur={onBlur}
                        value={value}
                        defaultChecked={value}
                        error={error?.message}
                        label={'Should the user be given match priority?'}
                        required={false}
                      />
                    )}
                  />
                  <Controller
                    defaultValue={hasRandomCallsAccess}
                    name="randomCallsAccess"
                    control={control}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <Checkbox
                        id="randomCallsAccess"
                        name={name}
                        inputRef={ref}
                        onCheckedChange={val =>
                          onChange({ target: { value: val } })
                        }
                        onBlur={onBlur}
                        value={value}
                        defaultChecked={value}
                        error={error?.message}
                        label={'Random Calls Access'}
                        required={false}
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
                    Delete the user and censor their profile
                  </Text>
                  <div>
                    <Button
                      onClick={() => setDeleteUserModalOpen(true)}
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
            <StatusMessage type={StatusTypes.Error} visible={true}>
              Cannot delete the user via this view. Please request admin user to
              delete the user.
            </StatusMessage>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onDeleteUser}
              backgroundColor={theme.color.status.error}
              disabled
              size={ButtonSizes.Stretch}
            >
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    </div>
  );
};

export default UserActions;
