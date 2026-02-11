import {
  Button,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Checkbox,
  Dropdown,
  Modal,
  Separator,
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

import {
  deleteUser,
  sendPushNotification,
  sendSms,
  setHadPrematchingCall,
  setHasMatchPriority,
  setNewsletterSubscribed,
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
          name: 'pushNotificationHeadline',
          options: {},
        })}
        onChange={() => setSentSuccessfully(false)}
        label={'Send the user a push notification'}
        placeholder="Headline"
        error={errors?.pushNotificationHeadline?.message}
      />
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
      <Button type="submit" disabled={isSubmitting || sentSuccessfully}>
        Send push notification
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

  return (
    <div className="w-full">
      <SendSms userId={user.id} />
      <SendPushNotification userId={user.id} />
      <Separator />
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
              onCheckedChange={val => onChange({ target: { value: val } })}
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
              onCheckedChange={val => onChange({ target: { value: val } })}
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
              onCheckedChange={val => onChange({ target: { value: val } })}
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
              onCheckedChange={val => onChange({ target: { value: val } })}
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
          defaultValue={user.state.searching_state === 'idle' ? false : true}
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
              onCheckedChange={val => onChange({ target: { value: val } })}
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
              onCheckedChange={val => onChange({ target: { value: val } })}
              onBlur={onBlur}
              value={value}
              defaultChecked={value}
              error={error?.message}
              label={'Should the user be given match priority?'}
              required={false}
            />
          )}
        />

        <StatusMessage
          visible={changesSaved || !!errors?.root?.serverError}
          type={changesSaved ? StatusTypes.Success : StatusTypes.Error}
        >
          {changesSaved
            ? 'Changes updated successfully'
            : errors?.root?.serverError?.message}
        </StatusMessage>
        <Button type="submit" disabled={isSubmitting || isEmpty(dirtyFields)}>
          Save Changes
        </Button>
      </form>
      <Separator />
      <div className="p-2 flex flex-col gap-2">
        <Text tag="h3" type={TextTypes.Heading5}>
          Danger Zone
        </Text>
        <Text className="mb-2">Delete the user and censor their profile</Text>
        <div>
          <Button
            onClick={() => setDeleteUserModalOpen(true)}
            backgroundColor={theme.color.status.error}
          >
            Delete User
          </Button>
        </div>
      </div>
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
