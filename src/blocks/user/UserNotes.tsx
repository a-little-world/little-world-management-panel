import {
  Button,
  ButtonAppearance,
  MessageTypes,
  StatusMessage,
  TextArea,
  TextAreaSize,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { updateUserNotes } from '../../api';
import { registerInput } from '../../store';

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.large};
  margin-top: ${({ theme }) => theme.spacing.small};

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    justify-content: flex-end;
  }
`;

interface UserNotesProps {
  notes?: string;
  userId: string;
}

const UserNotes = ({ notes, userId }: UserNotesProps) => {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm({ defaultValues: { notes } });
  const notesVal = watch('notes');
  const displayStatusMessage = saved || !!errors?.root?.serverError;

  const handleSave = ({ notes }: { notes: string }) => {
    updateUserNotes({
      userId,
      notes,
      onError: error =>
        setError('root.serverError', {
          message: error?.message || 'Issue saving notes',
        }),
      onSuccess: () => setSaved(true),
    });
  };

  useEffect(() => {
    setSaved(false);
  }, [notesVal]);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      {displayStatusMessage && (
        <StatusMessage
          $visible={displayStatusMessage}
          $type={saved ? MessageTypes.Success : MessageTypes.Error}
        >
          {saved
            ? 'Notes saved successfully'
            : errors?.root?.serverError?.message}
        </StatusMessage>
      )}
      <TextArea
        {...registerInput({
          register,
          name: 'notes',
          options: { required: 'Required*' },
        })}
        placeholder={'Write your notes for this user here...'}
        size={TextAreaSize.Large}
        expandable
        error={errors?.notes?.message}
      />

      <ButtonsContainer>
        <Button
          appearance={ButtonAppearance.Secondary}
          onClick={() => setValue('notes', notes)}
        >
          Undo changes
        </Button>
        <Button type="submit">Save</Button>
      </ButtonsContainer>
    </form>
  );
};

export default UserNotes;
