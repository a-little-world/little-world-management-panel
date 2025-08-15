import {
  Button,
  ButtonAppearance,
  StatusMessage,
  StatusTypes,
  TextArea,
  TextAreaSize,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { updateMatchNotes, updateUserNotes } from '../../../api';
import { registerInput } from '../../../store';

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.large};
  margin: ${({ theme }) => `${theme.spacing.small} 0 ${theme.spacing.large}`};

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    justify-content: flex-end;
  }
`;

const NotesUseCases = {
  user: {
    placeholder: 'Write your notes for this user...',
    updateNotes: updateUserNotes,
  },
  match: {
    placeholder: 'Write your notes for this match here...',
    updateNotes: updateMatchNotes,
  },
};

interface NotesProps {
  model: 'user' | 'match';
  notes?: string;
  modelId: string;
}

const Notes = ({ model, notes, modelId }: NotesProps) => {
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
  const useCase = NotesUseCases[model];

  const handleSave = ({ notes }: { notes: string }) => {
    useCase.updateNotes({
      id: modelId,
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
      <TextArea
        {...registerInput({
          register,
          name: 'notes',
          options: { required: 'Required*' },
        })}
        placeholder={useCase.placeholder}
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
      {displayStatusMessage && (
        <StatusMessage
          $visible={displayStatusMessage}
          $type={saved ? StatusTypes.Success : StatusTypes.Error}
        >
          {saved
            ? 'Notes saved successfully'
            : errors?.root?.serverError?.message}
        </StatusMessage>
      )}
    </form>
  );
};

export default Notes;
