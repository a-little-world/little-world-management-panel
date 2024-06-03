import {
  Button,
  ButtonVariations,
  CheckIcon,
  Checkbox,
  ExclamationIcon,
  Modal,
  Text,
  TextArea,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';
import useSWR from 'swr';

import { Card, CardFooter, CardHeader, CardTitle } from '../atoms/Card';
import { dataFetcher } from '../store';
import { registerInput } from './SelectedUsersSheet';

const fields = [
  { key: 'receiver', label: 'Reciever' },
  { key: 'template', label: 'Template' },
  { key: 'sucess', label: 'Sent status' },
  { key: 'time', label: 'Time' },
  { key: 'retrieve', label: 'View' },
];

function SendSms({ userId, action }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSendSms = data => {
    fetch(data).then(response => response.text());
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit(onSendSms)}>
      <TextArea
        {...registerInput({
          register: register,
          name: 'smsMessage',
          options: {},
        })}
        label={'Send the user an sms'}
        placeholder={'Write your message here...'}
      />
      <Button>Send SMS</Button>
    </form>
  );
}

const UserActions = ({ user }) => {
  const theme = useTheme();
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const { data: actions } = useSWR(`/api/admin/quick_actions/`, dataFetcher);

  const saveChanges = () => {
    setIsSubmitting(true);
    // fetch('').then(() => {});
    setIsSubmitting(false);
  };
  console.log({ actions });
  return (
    <div className="w-full">
      <SendSms userId={user} action={actions?.[0]} />
      <form className="mb-4" onSubmit={handleSubmit(saveChanges)}>
        <Checkbox
          {...registerInput({
            register,
            name: 'matchReady',
            options: {},
          })}
          id="addUserHashInput"
          error={errors?.userHash?.message}
          label="User has completed Pre-matching call"
        />
        <Checkbox
          {...registerInput({
            register,
            name: 'userUnresponsive',
            options: {},
          })}
          id="userUnresponsive"
          error={errors?.userHash?.message}
          label="This user is no longer responsive?"
        />
        <Button type="submit">Save Changes</Button>
      </form>
      <div className="rounded-xl border p-2">
        <p>Danger Zone</p>
        <p>Delete the user and censor their profile</p>
        <Button
          onClick={() => setDeleteUserModalOpen(true)}
          backgroundColor={theme.color.status.error}
        >
          Delete User
        </Button>
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
