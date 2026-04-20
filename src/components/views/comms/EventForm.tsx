import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Dropdown,
  StatusMessage,
  StatusTypes,
  Switch,
  Text,
  TextArea,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { RefObject, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';

import {
  CommunityEvent,
  CommunityEventPayload,
  resolveCommunityEventImageUrl,
} from '../../../api/communityEvents';
import { registerInput } from '../../../store';
import { DatePicker } from '../../atoms/DatePicker';
import { ImageUploadField } from '../../atoms/ImageUploadField';
import {
  EventModalAside,
  EventModalCardHeaderRow,
  EventModalFieldPair,
  EventModalLayout,
  EventModalPrimary,
  EventModalScheduleRow,
  FormField,
  FormLabel,
  TimeInput,
} from './Events.styles';

export type EventFormValues = Omit<
  CommunityEventPayload,
  'time' | 'end_time'
> & {
  eventDate: Date | null;
  startTime: string;
  endTime: string;
  eventImageFile: File | null;
};

type EventFormProps = {
  editingEvent: CommunityEvent | null;
  saving: boolean;
  modalError: string | null;
  customFilterOptions: Array<{ label: string; value: string }>;
  initialValues: EventFormValues;
  onCancel: () => void;
  onSubmit: (values: EventFormValues) => void;
};

function EventForm({
  editingEvent,
  saving,
  modalError,
  customFilterOptions,
  initialValues,
  onCancel,
  onSubmit,
}: EventFormProps) {
  const theme = useTheme();
  const activeSwitchRef = useRef<HTMLButtonElement>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <Card width={CardSizes.Large}>
      <CardHeader
        asContainer
        center={false}
        align="stretch"
        marginBottom={theme.spacing.xsmall}
      >
        <EventModalCardHeaderRow>
          <Text type={TextTypes.Heading4} center={false}>
            {editingEvent ? 'Edit event' : 'Create event'}
          </Text>
          <Controller
            name="active"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                inputRef={activeSwitchRef as RefObject<HTMLButtonElement>}
                label="Active"
                labelInline
                checked={value}
                onCheckedChange={onChange}
              />
            )}
          />
        </EventModalCardHeaderRow>
      </CardHeader>
      <CardContent
        scrollable
        align="stretch"
        textAlign="left"
        gap={theme.spacing.xsmall}
        marginBottom={theme.spacing.xsmall}
      >
        {modalError && (
          <StatusMessage type={StatusTypes.Error} visible>
            {modalError}
          </StatusMessage>
        )}

        <EventModalLayout>
          <EventModalPrimary>
            <TextInput
              id="title"
              label="Title"
              placeholder="Enter event title"
              required
              error={errors?.title?.message}
              {...registerInput({
                register,
                name: 'title',
                options: {
                  required: 'Required',
                },
              })}
            />

            <TextArea
              id="description"
              label="Description"
              placeholder="Enter event description"
              rows={3}
              required
              error={errors?.description?.message}
              {...registerInput({
                register,
                name: 'description',
                options: {
                  required: 'Required',
                },
              })}
            />

            <EventModalScheduleRow>
              <FormField>
                <FormLabel>Event date</FormLabel>
                <Controller
                  name="eventDate"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      date={value}
                      setDate={onChange}
                      disablePastDays={!editingEvent}
                      inModal
                    />
                  )}
                />
              </FormField>
              <FormField>
                <FormLabel>Start time</FormLabel>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TimeInput
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      disabled={saving}
                    />
                  )}
                />
              </FormField>
              <FormField>
                <FormLabel>End time</FormLabel>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TimeInput
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      disabled={saving}
                    />
                  )}
                />
              </FormField>
            </EventModalScheduleRow>

            <EventModalFieldPair>
              <Controller
                name="frequency"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Dropdown
                    id="frequency"
                    label="Frequency"
                    placeholder="Select frequency"
                    value={value}
                    options={[
                      { label: 'Once', value: 'once' },
                      { label: 'Weekly', value: 'weekly' },
                      { label: 'Fortnightly', value: 'fortnightly' },
                      { label: 'Monthly', value: 'monthly' },
                    ]}
                    onValueChange={nextValue =>
                      onChange(nextValue as CommunityEvent['frequency'])
                    }
                    cannotError
                  />
                )}
              />
              <Controller
                name="custom_filter"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Dropdown
                    id="custon_filter"
                    label="Custom filter"
                    placeholder="Select custom filter"
                    value={value}
                    options={customFilterOptions}
                    onValueChange={onChange}
                    cannotError
                  />
                )}
              />
            </EventModalFieldPair>
          </EventModalPrimary>
          <EventModalAside>
            <Controller
              name="eventImageFile"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ImageUploadField
                  id="image"
                  label="Event image (optional)"
                  file={value}
                  onFileChange={onChange}
                  existingImageUrl={resolveCommunityEventImageUrl(
                    editingEvent?.image ?? null,
                  )}
                  disabled={saving}
                  compact
                  helperText="JPEG, PNG, WebP, or GIF · max 5 MB"
                />
              )}
            />
            <TextInput
              id="group_id"
              label="Group ID (optional)"
              placeholder="Enter group id"
              {...registerInput({
                register,
                name: 'group_id',
                options: {
                  setValueAs: (value: string) => value || null,
                },
              })}
            />
            <TextInput
              id="link"
              label="Link"
              placeholder="https://..."
              error={errors?.link?.message}
              required
              {...registerInput({
                register,
                name: 'link',
                options: {
                  required: 'Required',
                },
              })}
            />
          </EventModalAside>
        </EventModalLayout>
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
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default EventForm;
