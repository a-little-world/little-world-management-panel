import {
  Button,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Modal,
  TextArea,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { StaffUser } from '../../api/supportTasks';
import { useTaskPriorities } from '../../hooks/useTaskPriorities';
import { registerInput } from '../../store';
import { DropdownRow } from './Filters';

interface SupportTaskModalParams {
  open: boolean;
  staffUsers: StaffUser[];
  onCreated?: () => void;
  onClose?: () => void;
}
const TaskForm = styled.form``;

export default function SupportTaskModal({
  open,
  staffUsers,
  onCreated,
  onClose,
}: SupportTaskModalParams) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ mode: 'onSubmit' });

  const priorities = useTaskPriorities();

  const onSubmit = async (data: any) => {
    console.log(data);
  };
  const handleClose = () => {};

  return (
    <Modal open={open} onClose={() => onClose?.()}>
      <Card width={CardSizes.Large}>
        <CardHeader>Create New Support Task</CardHeader>
        <CardContent align="flex-start">
          <TaskForm onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              {...registerInput({
                register,
                name: 'title',
              })}
              id="titleInput"
              error={errors?.['title']?.message}
              placeholder={'Task title'}
              required={true}
              inline
            />
          </TaskForm>
          <TextArea
            {...registerInput({
              register,
              name: 'description',
            })}
            id="descriptionInput"
            error={errors?.['description']?.message}
            placeholder={'Task description'}
            required={true}
          />
          <DropdownRow>
            {/* <DropdownItem>
              <Select
                label={'User List'}
                value={filters[FilterKeys.UserList]}
                options={
                  filterOptions?.lists?.map(({ name, description }: any) => ({
                    value: name,
                    label: description,
                  })) ?? []
                }
                onValueChange={val => onUpdateFilters(FilterKeys.UserList, val)}
                placeholder="Select a user list..."
              />
            </DropdownItem> */}
          </DropdownRow>
        </CardContent>
        <CardFooter align="space-between">
          <Button variation={ButtonVariations.Inline} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {submitting ? 'Creating…' : 'Create task'}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
}
