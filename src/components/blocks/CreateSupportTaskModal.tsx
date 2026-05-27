import {
  Button,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Dropdown,
  Label,
  Modal,
  Text,
  TextArea,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import {
  StaffUser,
  TaskPriority,
  createManualSupportTask,
} from '../../api/supportTasks';
import { RED_40 } from '../../constants';
import { useTaskPriorityList } from '../../hooks/useTaskPriorities';
import { registerInput } from '../../store';

const UNASSIGNED = 'UNASSIGNED';

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  align-items: start;
  width: 100%;
`;

interface Props {
  open: boolean;
  onClose: () => void;
  staffUsers: StaffUser[];
  onCreated: () => void;
}

export default function CreateSupportTaskModal({
  open,
  onClose,
  staffUsers,
  onCreated,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM' as TaskPriority,
      assigned_to: UNASSIGNED,
    },
  });
  const priorityOptions = useTaskPriorityList().map(({ priority, label }) => ({
    value: priority,
    label,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assigneeOptions = [
    { value: UNASSIGNED, label: '-' },
    ...staffUsers.map(u => ({
      value: String(u.id),
      label: `${u.first_name} ${u.last_name}`,
    })),
  ];

  const handleClose = useCallback(() => {
    reset();
    setError(null);
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setError(null);
    try {
      await createManualSupportTask({
        title: data.title.trim(),
        description: data.description?.trim(),
        priority: data.priority as TaskPriority,
        assigned_to_id:
          data.assigned_to === UNASSIGNED ? null : Number(data.assigned_to),
      });
      onCreated();
      handleClose();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Card width={CardSizes.Large}>
        <CardHeader>New task</CardHeader>
        <CardContent align="flex-start" scrollable={false}>
          <TextInput
            {...registerInput({
              register,
              name: 'title',
              options: { required: 'Title is required' },
            })}
            id="task-title"
            error={errors?.title?.message as string}
            placeholder="Title"
            inline
          />
          <TextArea
            {...registerInput({ register, name: 'description' })}
            id="task-description"
            placeholder="Description"
          />
          <TwoCol>
            <div>
              <Label>Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    options={priorityOptions}
                    onValueChange={field.onChange}
                    placeholder="Priority"
                    cannotError
                  />
                )}
              />
            </div>
            <div>
              <Label>Assigned to</Label>
              <Controller
                name="assigned_to"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    options={assigneeOptions}
                    onValueChange={field.onChange}
                    placeholder="Assigned to"
                    cannotError
                  />
                )}
              />
            </div>
          </TwoCol>
          {error && (
            <Text type={TextTypes.Body7} color={RED_40}>
              {error}
            </Text>
          )}
        </CardContent>
        <CardFooter align="space-between">
          <Button variation={ButtonVariations.Inline} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={!isValid || submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {submitting ? 'Creating…' : 'Create task'}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
}
