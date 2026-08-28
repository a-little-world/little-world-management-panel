import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Checkbox,
  CheckboxSizes,
  StatusMessage,
  StatusTypes,
  Text,
  TextArea,
  TextAreaSize,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import {
  SupportTaskNote,
  addSupportTaskNote,
  patchSupportTaskNote,
} from '../../api/supportTasks';
import { Card, CardTitle } from '../atoms/Card';
import { CollapsibleHeader } from './ObjectHistory';

const NotesBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: 0 ${({ theme }) => theme.spacing.medium}
    ${({ theme }) => theme.spacing.medium};
`;

const NotesScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  max-height: 320px;
  overflow-y: auto;
`;

const NoteRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const NoteText = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'span' as const,
})<{ $completed: boolean }>`
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.5;
  text-decoration: ${({ $completed }) =>
    $completed ? 'line-through' : 'none'};
  color: ${({ $completed, theme }) =>
    $completed ? theme.color.text.tertiary : theme.color.text.primary};
`;

const NoteForm = styled.form`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const Composer = styled(NoteForm)`
  padding-top: ${({ theme }) => theme.spacing.xxsmall};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

interface NoteFormValues {
  text: string;
}

const TEXT_RULES = { required: 'Note text is required' };

function useNoteSubmit(
  submit: (text: string) => Promise<unknown>,
  onSaved: () => void,
  text = '',
) {
  const form = useForm<NoteFormValues>({ defaultValues: { text } });

  const onSubmit = form.handleSubmit(async ({ text }) => {
    try {
      await submit(text.trim());
      onSaved();
    } catch (e) {
      form.setError('root.serverError', {
        message: (e as Error)?.message || 'Could not save the note',
      });
    }
  });

  return { ...form, onSubmit };
}

function NoteComposer({
  onAdd,
}: {
  onAdd: (text: string) => Promise<unknown>;
}) {
  const {
    control,
    formState: { errors, isSubmitting },
    onSubmit,
    reset,
  } = useNoteSubmit(onAdd, () => reset());

  return (
    <Composer onSubmit={onSubmit}>
      <Controller
        name="text"
        control={control}
        rules={TEXT_RULES}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <TextArea
            id="new-note"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            placeholder="Create a new note"
            size={TextAreaSize.Small}
          />
        )}
      />
      <StatusMessage
        visible={!!errors?.root?.serverError}
        type={StatusTypes.Error}
      >
        {errors?.root?.serverError?.message}
      </StatusMessage>
      <FormActions>
        <Button type="submit" size={ButtonSizes.Small} loading={isSubmitting}>
          Add note
        </Button>
      </FormActions>
    </Composer>
  );
}

function NoteEditor({
  note,
  onSave,
  onCancel,
}: {
  note: SupportTaskNote;
  onSave: (text: string) => Promise<unknown>;
  onCancel: () => void;
}) {
  const {
    control,
    formState: { errors, isSubmitting },
    onSubmit,
  } = useNoteSubmit(onSave, onCancel, note.text);

  return (
    <NoteForm onSubmit={onSubmit}>
      <Controller
        name="text"
        control={control}
        rules={TEXT_RULES}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <TextArea
            id={`note-${note.id}`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            size={TextAreaSize.Small}
          />
        )}
      />
      <StatusMessage
        visible={!!errors?.root?.serverError}
        type={StatusTypes.Error}
      >
        {errors?.root?.serverError?.message}
      </StatusMessage>
      <FormActions>
        <Button type="submit" size={ButtonSizes.Small} loading={isSubmitting}>
          Save
        </Button>
        <Button
          type="button"
          size={ButtonSizes.Small}
          appearance={ButtonAppearance.Secondary}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </FormActions>
    </NoteForm>
  );
}

interface SupportTaskNotesProps {
  taskId: number;
  notes?: SupportTaskNote[];
  onChanged: () => void | Promise<unknown>;
  onToggleCompleted: (
    noteId: number,
    completed: boolean,
  ) => void | Promise<unknown>;
}

export default function SupportTaskNotes({
  taskId,
  notes,
  onChanged,
  onToggleCompleted,
}: SupportTaskNotesProps) {
  const [open, setOpen] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const addNote = async (text: string) => {
    await addSupportTaskNote(taskId, text);
    await onChanged();
  };

  const saveNote = async (noteId: number, text: string) => {
    await patchSupportTaskNote(noteId, { text });
    await onChanged();
  };

  return (
    <Card center={false}>
      <CollapsibleHeader onClick={() => setOpen(o => !o)}>
        <CardTitle>Internal notes</CardTitle>
        {open ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
      </CollapsibleHeader>
      {open && (
        <NotesBody>
          <NotesScroll>
            {(notes ?? []).map(note => (
              <NoteRow key={note.id}>
                <Checkbox
                  checked={note.completed}
                  onCheckedChange={checked =>
                    onToggleCompleted(note.id, !!checked)
                  }
                  size={CheckboxSizes.Small}
                  required={false}
                />
                {editingId === note.id ? (
                  <NoteEditor
                    note={note}
                    onSave={text => saveNote(note.id, text)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <NoteText $completed={note.completed}>{note.text}</NoteText>
                    <Button
                      variation={ButtonVariations.Icon}
                      size={ButtonSizes.Small}
                      aria-label="Edit note"
                      onClick={() => setEditingId(note.id)}
                    >
                      <PencilIcon size={14} />
                    </Button>
                  </>
                )}
              </NoteRow>
            ))}
          </NotesScroll>
          <NoteComposer onAdd={addNote} />
        </NotesBody>
      )}
    </Card>
  );
}
