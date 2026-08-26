import {
  Button,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Checkbox,
  Label,
  Modal,
  Select,
  Text,
  TextArea,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { FormEvent, useMemo, useState } from 'react';
import styled from 'styled-components';

import {
  AssigneeUser,
  TaskPriority,
  createManualSupportTask,
} from '../../api/supportTasks';
import { RED_40 } from '../../constants';
import { useTaskPriorityList } from '../../hooks/useTaskPriorities';
import UserImage from '../atoms/UserImage';

const Form = styled.form`
  width: 100%;
`;

const FormContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const Intro = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'p' as const,
})`
  margin: 0;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  width: 100%;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: ${({ theme }) => theme.spacing.medium};
  align-items: start;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    grid-template-columns: 1fr;
  }
`;

const AssigneeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
`;

const AssigneeActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const SelectedCount = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const AssigneeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  max-height: 14rem;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  background: ${({ theme }) => theme.color.surface.secondary};
`;

const AssigneeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  border-radius: ${({ theme }) => theme.radius.xxxsmall};

  &:hover {
    background: ${({ theme }) => theme.color.surface.primary};
  }
`;

const AssigneeDetails = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const AssigneeEmail = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyAssignees = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'div' as const,
})`
  padding: ${({ theme }) => theme.spacing.small};
  color: ${({ theme }) => theme.color.text.tertiary};
  text-align: center;
`;

interface Props {
  open: boolean;
  onClose: () => void;
  assigneeUsers: AssigneeUser[];
  onCreated: () => void;
}

type FormProps = Omit<Props, 'open'>;

function CreateSupportTaskForm({
  onClose,
  assigneeUsers,
  onCreated,
}: FormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const priorityOptions = useTaskPriorityList().map(({ priority, label }) => ({
    value: priority,
    label,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredAssignees = useMemo(() => {
    const query = assigneeSearch.trim().toLowerCase();
    if (!query) return assigneeUsers;
    return assigneeUsers.filter(user =>
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(query),
    );
  }, [assigneeSearch, assigneeUsers]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssigneeIds([]);
    setAssigneeSearch('');
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const toggleAssignee = (userId: number) => {
    setAssigneeIds(current =>
      current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId],
    );
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createManualSupportTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        assignee_ids: assigneeIds,
      });
      onCreated();
      resetForm();
      onClose();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to create task.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <CardHeader>Create support task</CardHeader>
      <FormContent align="flex-start">
        <Intro>
          Add the task details and choose one or more matching team members who
          should own it.
        </Intro>

        <Field>
          <Label htmlFor="task-title">Title</Label>
          <TextInput
            id="task-title"
            name="title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            required
            autoFocus
            inline
          />
        </Field>

        <Field>
          <Label htmlFor="task-description">Description</Label>
          <TextArea
            id="task-description"
            name="description"
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Add context or instructions for the assignees"
          />
        </Field>

        <MetaGrid>
          <Field>
            <Label>Priority</Label>
            <Select
              value={priority}
              options={priorityOptions}
              onValueChange={value => setPriority(value as TaskPriority)}
              placeholder="Priority"
              cannotError
              inModal
            />
          </Field>

          <Field>
            <AssigneeHeader>
              <Label htmlFor="task-assignee-search">Assigned to</Label>
              <SelectedCount>{assigneeIds.length} selected</SelectedCount>
            </AssigneeHeader>
            <TextInput
              id="task-assignee-search"
              name="assignee-search"
              value={assigneeSearch}
              onChange={event => setAssigneeSearch(event.target.value)}
              placeholder="Search team members"
              inline
            />
          </Field>
        </MetaGrid>

        <Field>
          <AssigneeActions>
            <Button
              type="button"
              variation={ButtonVariations.Inline}
              onClick={() =>
                setAssigneeIds(
                  Array.from(
                    new Set([
                      ...assigneeIds,
                      ...filteredAssignees.map(user => user.id),
                    ]),
                  ),
                )
              }
              disabled={!filteredAssignees.length}
            >
              Select visible
            </Button>
            <Button
              type="button"
              variation={ButtonVariations.Inline}
              onClick={() => setAssigneeIds([])}
              disabled={!assigneeIds.length}
            >
              Clear
            </Button>
          </AssigneeActions>
          <AssigneeList>
            {filteredAssignees.length ? (
              filteredAssignees.map(user => (
                <AssigneeRow key={user.id}>
                  <Checkbox
                    id={`task-assignee-${user.id}`}
                    label=""
                    checked={assigneeIds.includes(user.id)}
                    onCheckedChange={() => toggleAssignee(user.id)}
                  />
                  <UserImage
                    alt={`${user.first_name} ${user.last_name}`}
                    user={{
                      id: user.id,
                      first_name: user.first_name,
                      second_name: user.last_name,
                      image: null,
                      avatar_config: { seed: user.email },
                      image_type: 'avatar',
                    }}
                    dimensions={{ width: 32, height: 32 }}
                  />
                  <AssigneeDetails>
                    <Text type={TextTypes.Body6} bold tag="span">
                      {user.first_name} {user.last_name}
                    </Text>
                    <AssigneeEmail>{user.email}</AssigneeEmail>
                  </AssigneeDetails>
                </AssigneeRow>
              ))
            ) : (
              <EmptyAssignees>No matching team members found.</EmptyAssignees>
            )}
          </AssigneeList>
        </Field>

        {error && (
          <Text type={TextTypes.Body7} color={RED_40}>
            {error}
          </Text>
        )}
      </FormContent>
      <CardFooter align="space-between">
        <Button
          type="button"
          variation={ButtonVariations.Inline}
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || submitting}>
          {submitting ? 'Creating…' : 'Create task'}
        </Button>
      </CardFooter>
    </Form>
  );
}

export default function CreateSupportTaskModal({
  open,
  onClose,
  assigneeUsers,
  onCreated,
}: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Large}>
        {open && (
          <CreateSupportTaskForm
            onClose={onClose}
            assigneeUsers={assigneeUsers}
            onCreated={onCreated}
          />
        )}
      </Card>
    </Modal>
  );
}
