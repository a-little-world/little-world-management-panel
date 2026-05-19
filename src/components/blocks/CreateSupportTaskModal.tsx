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
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  StaffUser,
  TaskPriority,
  createManualSupportTask,
} from '../../api/supportTasks';
import { RED_40 } from '../../constants';
import { useTaskPriorityList } from '../../hooks/useTaskPriorities';
import { registerInput } from '../../store';

const UNASSIGNED = 'UNASSIGNED';

interface Props {
  open: boolean;
  onClose: () => void;
  staffUsers: StaffUser[];
  onCreated: () => void;
}

export default function CreateSupportTaskModal({ open, onClose, staffUsers, onCreated }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onSubmit' });
  const priorityOptions = useTaskPriorityList().map(({ priority, label }) => ({ value: priority, label }));
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState(UNASSIGNED);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assigneeOptions = [
    { value: UNASSIGNED, label: '— Unassigned' },
    ...staffUsers.map(u => ({ value: String(u.id), label: `${u.first_name} ${u.last_name}` })),
  ];

  const handleClose = () => {
    reset();
    setPriority('MEDIUM');
    setAssignedTo(UNASSIGNED);
    setError(null);
    onClose();
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setError(null);
    try {
      await createManualSupportTask({
        title: data.title.trim(),
        description: data.description?.trim(),
        priority,
        assigned_to_id: assignedTo === UNASSIGNED ? null : Number(assignedTo),
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
        <CardContent align="flex-start">
          <TextInput
            {...registerInput({ register, name: 'title', options: { required: 'Title is required' } })}
            id="task-title"
            error={errors?.title?.message as string}
            placeholder="Short summary of the task"
            required
            inline
          />
          <TextArea
            {...registerInput({ register, name: 'description' })}
            id="task-description"
            placeholder="What needs to be done and any context the assignee will need."
          />
          <div>
            <Label>Priority</Label>
            <RadioGroup
              inputRef={priorityRef}
              type={RadioGroupVariations.Pill}
              items={priorityItems}
              value={priority}
              onValueChange={v => setPriority(v as TaskPriority)}
              inline
            />
          </div>
          <div>
            <Label>Assigned to</Label>
            <Dropdown
              value={assignedTo}
              options={assigneeOptions}
              onValueChange={setAssignedTo}
              placeholder="Unassigned"
              cannotError
            />
          </div>
          {error && <Text type={TextTypes.Body7} color={RED_40}>{error}</Text>}
        </CardContent>
        <CardFooter align="space-between">
          <Button variation={ButtonVariations.Inline} onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={submitting} onClick={handleSubmit(onSubmit)}>
            {submitting ? 'Creating…' : 'Create task'}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
}
