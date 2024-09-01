import {
  Button,
  Dropdown,
  Text,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { isEmpty, map, size } from 'lodash';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import LoadingSpinner from '../atoms/LoadingSpinner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import { registerInput, useFilterOptions, useUserListData } from '../store';

export function SendEmailSheet() {
  const { filterOptions, isLoading } = useFilterOptions();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setError,
    watch,
  } = useForm();
  const { userList, isLoading: userListLoading } = useUserListData(
    `list=${watch('user_list')}`,
  );
  //   console.log({ userList });
  const recipients = userList?.count ?? 0;

  const onSendEmail = data => {
    console.log({ data });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Send Email</Button>
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
                    options={filterOptions?.lists?.map(
                      ({ name, description }) => ({
                        value: name,
                        label: description,
                      }),
                    )}
                  />
                )}
              />
            )}
            <Text>
              Number of recipients:{' '}
              {userListLoading ? <LoadingSpinner inline /> : recipients}
            </Text>
            <Button type="submit" disabled={userListLoading}>
              Send Email
            </Button>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default SendEmailSheet;
