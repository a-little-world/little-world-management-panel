import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Select,
  StatusMessage,
  StatusTypes,
  Switch,
  Text,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';

import {
  ExternalSession,
  ExternalSessionCompanyOption,
} from '../../../api/partnerEventRegistrations';
import { registerInput } from '../../../store';
import { DatePicker } from '../../atoms/DatePicker';
import {
  DatePickerContainer,
  FormField,
  FormLabel,
  FormStack,
} from '../../atoms/FormLayout';
import { TimeInput } from './RandomCalls.styles';

export const NO_COMPANY = 'NONE';

export type ExternalSessionFormValues = {
  name: string;
  companyId: string;
  startDate: Date | null;
  startTime: string;
  endTime: string;
  enforceEmailDomain: boolean;
  liveSupportUrl: string;
};

type ExternalSessionFormProps = {
  editingSession: ExternalSession | null;
  companies: ExternalSessionCompanyOption[];
  saving: boolean;
  formError: string | null;
  initialValues: ExternalSessionFormValues;
  onCancel: () => void;
  onSubmit: (values: ExternalSessionFormValues) => void;
};

function ExternalSessionForm({
  editingSession,
  companies,
  saving,
  formError,
  initialValues,
  onCancel,
  onSubmit,
}: ExternalSessionFormProps) {
  const theme = useTheme();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExternalSessionFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const companyOptions = useMemo(
    () => [
      { value: NO_COMPANY, label: 'No company (generic landing)' },
      ...companies.map(company => ({
        value: String(company.id),
        label: `${company.name} (${company.slug})`,
      })),
    ],
    [companies],
  );

  return (
    <Card width={CardSizes.Medium}>
      <CardHeader>
        {editingSession ? 'Edit external session' : 'Create external session'}
      </CardHeader>
      <CardContent align="flex-start" marginBottom={theme.spacing.large}>
        <FormStack>
          {formError && (
            <StatusMessage type={StatusTypes.Error} visible>
              {formError}
            </StatusMessage>
          )}
          <TextInput
            id="external-session-name"
            label="Lobby name"
            placeholder="capgemini"
            required
            error={errors?.name?.message}
            {...registerInput({
              register,
              name: 'name',
              options: { required: 'Required' },
            })}
          />
          <Controller
            name="companyId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                id="external-session-company"
                label="Company"
                placeholder="Select company"
                value={value}
                options={companyOptions}
                onValueChange={onChange}
                cannotError
                inModal
              />
            )}
          />
          <Controller
            name="enforceEmailDomain"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                label="Require company email domain"
                labelInline
                checked={value}
                onCheckedChange={onChange}
                cannotError
                disabled={saving}
              />
            )}
          />
          <TextInput
            id="external-session-live-support"
            label="Live Support"
            placeholder="https://zoom.us/j/…"
            error={errors?.liveSupportUrl?.message}
            {...registerInput({
              register,
              name: 'liveSupportUrl',
              options: {
                validate: value =>
                  !value?.trim() ||
                  value.trim().startsWith('http://') ||
                  value.trim().startsWith('https://') ||
                  'Enter a link starting with http:// or https://.',
              },
            })}
          />
          <Text type={TextTypes.Body6}>
            Optional meeting link. Partners who are stuck can open it and talk
            to the team. Learners do not see it.
          </Text>
          <Controller
            name="startDate"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                label="Session date"
                date={value}
                setDate={onChange}
                disablePastDays={!editingSession}
                inModal
              />
            )}
          />
          <DatePickerContainer>
            <FormField>
              <FormLabel htmlFor="external-session-start">Start time</FormLabel>
              <Controller
                name="startTime"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TimeInput
                    id="external-session-start"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={saving}
                    required
                  />
                )}
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="external-session-end">End time</FormLabel>
              <Controller
                name="endTime"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TimeInput
                    id="external-session-end"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={saving}
                    required
                  />
                )}
              />
            </FormField>
          </DatePickerContainer>
        </FormStack>
      </CardContent>
      <CardFooter align="space-between">
        <Button
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Small}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          appearance={ButtonAppearance.Primary}
          size={ButtonSizes.Small}
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
        >
          {saving ? 'Saving…' : editingSession ? 'Save' : 'Create session'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ExternalSessionForm;
