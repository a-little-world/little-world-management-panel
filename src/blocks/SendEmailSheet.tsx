import {
  Button,
  Dropdown,
  MessageTypes,
  StatusMessage,
  Text,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { sendBulkEmail } from '../api/index';
import LoadingSpinner from '../atoms/LoadingSpinner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import {
  onFormError,
  registerInput,
  useFilterOptions,
  useUserListData,
} from '../store';

const Recipients = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export function SendEmailSheet({
  emailTemplateName,
}: {
  emailTemplateName?: string;
}) {
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { filterOptions, isLoading } = useFilterOptions();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    control,
    setError,
    watch,
  } = useForm();
  const { userList, isLoading: userListLoading } = useUserListData(
    watch('user_list') ? `list=${watch('user_list')}` : '',
  );

  const recipients = userList?.count ?? 0;
  const [, ...optionsWithoutAll] = isLoading ? [[], []] : filterOptions?.lists;

  const onError = e => {
    setIsSubmitting(false);
    onFormError({ e, formFields: getValues(), setError });
  };

  const onSuccess = () => {
    setIsSubmitting(false);
    setEmailSent(true);
  };

  const onSendEmail = () => {
    setIsSubmitting(true);
    sendBulkEmail({
      userList: watch('user_list'),
      emailTemplate: emailTemplateName,
      onError,
      onSuccess,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button disabled={!Boolean(emailTemplateName)}>Send Email</Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Send Email</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full overflow-scroll">
          <form onSubmit={handleSubmit(onSendEmail)}>
            <TextInput
              id={'subject'}
              {...registerInput({
                register,
                name: 'subject',
                options: { required: 'Required' },
              })}
              placeholder="Subject"
              label="Subject"
              error={errors.subject?.message}
            />
            {!isLoading && (
              <Controller
                defaultValue={null}
                name={'user_list'}
                control={control}
                rules={{ required: 'Required' }}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { error },
                }) => (
                  <Dropdown
                    name={name}
                    inputRef={ref}
                    onValueChange={val => onChange({ target: { value: val } })}
                    onBlur={onBlur}
                    value={value}
                    error={error?.message}
                    label={'User List'}
                    placeholder="Select a user list..."
                    options={optionsWithoutAll.map(({ name, description }) => ({
                      value: name,
                      label: description,
                    }))}
                  />
                )}
              />
            )}
            <Recipients>
              Number of recipients:{' '}
              {userListLoading ? <LoadingSpinner inline /> : recipients}
            </Recipients>
            <StatusMessage
              $visible={emailSent || !!errors?.root?.serverError}
              $type={emailSent ? MessageTypes.Success : MessageTypes.Error}
            >
              {emailSent
                ? 'Email successfully sent'
                : errors?.root?.serverError?.message}
            </StatusMessage>
            <Button
              type="submit"
              disabled={userListLoading || emailSent || isSubmitting}
            >
              Send Email
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default SendEmailSheet;
