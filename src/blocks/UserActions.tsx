import {
  Button,
  Checkbox,
  MessageTypes,
  Modal,
  Separator,
  StatusMessage,
  Text,
  TextArea,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty, map } from 'lodash';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';

import {
  sendSms,
  setHadPrematchingCall,
  setUserUnresponsive,
} from '../api/index';
import { Card, CardFooter, CardHeader, CardTitle } from '../atoms/Card';
import { registerInput } from '../store';

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

  return (
    <div className="w-full">
      <SendSms userId={user} />
      <Separator />
      <form
        className="mb-4"
        onSubmit={handleSubmit(saveChanges)}
        onChange={() => setChangesSaved(false)}
      >
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
            />
          )}
        />
        <StatusMessage
          $visible={changesSaved || !!errors?.root?.serverError}
          $type={changesSaved ? MessageTypes.Success : MessageTypes.Error}
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
        <Card>
          <CardHeader>
            <CardTitle>Are you sure you want to delete this user</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button>Delete Account</Button>
          </CardFooter>
        </Card>
      </Modal>
    </div>
  );
};

export default UserActions;
