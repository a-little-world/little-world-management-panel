import {
  Button,
  Select,
  Loading,
  StatusMessage,
  StatusTypes,
  Text,
} from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { sendBulkEmail } from '../../api/index';
import { toListSelectOptions } from '../../helpers/filterLists';
import { onFormError, useFilterOptions, useUserListData } from '../../store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import TextField from '../atoms/TextField';

const Recipients = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export function SendEmailSheet({
  cannotOpen,
  emailTemplateName,
  subject,
}: {
  emailTemplateName: string;
  subject: string;
  cannotOpen?: boolean;
}) {
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultData, setResultData] = useState({
    sendToCount: 0,
    unsubscribedCount: 0,
  });
  const {
    filterOptions,
    error: filterOptionsError,
    isLoading,
  } = useFilterOptions();
  const {
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
  // Handle undefined filterOptions gracefully when API fails
  const [, ...optionsWithoutAll] = isLoading
    ? [[], []]
    : filterOptions?.lists || [[], []];

  const onError = e => {
    setIsSubmitting(false);
    onFormError({ e, formFields: getValues(), setError });
  };

  const onSuccess = result => {
    setIsSubmitting(false);
    setResultData({
      sendToCount: result?.subscribed_user_count,
      unsubscribedCount: result?.unsubscribed_user_count,
    });
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
      <SheetTrigger disabled={cannotOpen || !Boolean(emailTemplateName)}>
        Send Email
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Send Email</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full overflow-scroll">
          <form onSubmit={handleSubmit(onSendEmail)}>
            <TextField>{subject}</TextField>
            {!isLoading && (
              <>
                {filterOptionsError ? (
                  <Text type="Body4" color="error">
                    Failed to load user lists. Please try refreshing the page.
                  </Text>
                ) : (
                  <Controller
                    defaultValue={null}
                    name={'user_list'}
                    control={control}
                    rules={{ required: 'Required' }}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <Select
                        id="user_list"
                        onValueChange={val =>
                          onChange({ target: { value: val } })
                        }
                        value={value}
                        error={error?.message}
                        label={'User List'}
                        placeholder="Select a user list..."
                        options={toListSelectOptions(optionsWithoutAll)}
                        inModal
                      />
                    )}
                  />
                )}
              </>
            )}
            <Recipients>
              Number of recipients:{' '}
              {userListLoading ? <Loading inline /> : recipients}
            </Recipients>
            <StatusMessage
              visible={emailSent || !!errors?.root?.serverError}
              type={emailSent ? StatusTypes.Success : StatusTypes.Error}
            >
              {emailSent
                ? 'Email successfully sent'
                : (errors?.root?.serverError?.message ?? 'Error sending email')}
            </StatusMessage>
            {emailSent && (
              <>
                Email was sent to {resultData.sendToCount} users
                <br />
                {resultData.unsubscribedCount} users have unsubscribed
              </>
            )}
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
