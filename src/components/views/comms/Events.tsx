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
  Modal,
  StatusMessage,
  StatusTypes,
  Switch,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextArea,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { RefObject, useMemo, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_EVENTS_ENDPOINT,
  CommunityEvent,
  CommunityEventPayload,
  createCommunityEvent,
  updateCommunityEvent,
} from '../../../api/communityEvents';
import { DatePicker } from '../../atoms/DatePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import {
  Container,
  DatePickerContainer,
  Description,
  EventImage,
  EventMeta,
  EventMetaRow,
  EventsGrid,
  FormField,
  FormLabel,
  FormStack,
  Header,
  HeaderText,
  TimeInput,
  Title,
} from './Events.styles';

const FREQUENCY_LABELS: Record<CommunityEvent['frequency'], string> = {
  once: 'Once',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString();
};

type TabValue = 'active' | 'inactive';

const defaultFormFields: Omit<CommunityEventPayload, 'time' | 'end_time'> = {
  title: '',
  description: '',
  group_id: null,
  frequency: 'once',
  link: '',
  custom_filter: 'none',
  active: true,
};

const toTimeString = (date: Date) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const combineDateAndTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

function Events() {
  const activeSwitchRef = useRef<HTMLButtonElement>(null);
  const { data, error, isLoading } = useSWR<CommunityEvent[]>(
    ADMIN_EVENTS_ENDPOINT,
    // simple fetcher – no tags / options needed here
    url => fetch(url).then(res => res.json()),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const [tab, setTab] = useState<TabValue>('active');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [form, setForm] =
    useState<Omit<CommunityEventPayload, 'time' | 'end_time'>>(
      defaultFormFields,
    );
  const [eventDate, setEventDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState(toTimeString(new Date()));
  const [endTime, setEndTime] = useState(() => {
    const oneHourLater = new Date();
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    return toTimeString(oneHourLater);
  });
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusTypes>(
    StatusTypes.Success,
  );
  const [modalError, setModalError] = useState<string | null>(null);

  const sortedActive = useMemo(
    () =>
      (data || [])
        .filter(e => e.active)
        .slice()
        .sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        ),
    [data],
  );

  const sortedInactive = useMemo(
    () =>
      (data || [])
        .filter(e => !e.active)
        .slice()
        .sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        ),
    [data],
  );

  const customFilterOptions = useMemo(() => {
    const opts = data?.[0]?.options?.custom_filter as
      | Array<{ tag: string; value: string }>
      | undefined;
    if (!opts || opts.length === 0) {
      return [{ label: 'None', value: 'none' }];
    }
    return opts.map(item => ({
      label: item.tag,
      value: item.value,
    }));
  }, [data]);

  const openCreateModal = () => {
    setEditingEvent(null);
    const now = new Date();
    const later = new Date(now);
    later.setHours(later.getHours() + 1);
    setForm(defaultFormFields);
    setEventDate(now);
    setStartTime(toTimeString(now));
    setEndTime(toTimeString(later));
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (event: CommunityEvent) => {
    const eventStart = new Date(event.time);
    const eventEnd = event.end_time
      ? new Date(event.end_time)
      : new Date(eventStart);
    if (!event.end_time) {
      eventEnd.setHours(eventEnd.getHours() + 1);
    }

    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      group_id: event.group_id,
      frequency: event.frequency,
      link: event.link,
      custom_filter: event.custom_filter,
      active: event.active,
    });
    setEventDate(eventStart);
    setStartTime(toTimeString(eventStart));
    setEndTime(toTimeString(eventEnd));
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingEvent(null);
    setModalError(null);
  };

  const handleSave = async () => {
    if (!eventDate) {
      setModalError('Please select a date.');
      return;
    }

    const startDateTime = combineDateAndTime(eventDate, startTime);
    const endDateTime = combineDateAndTime(eventDate, endTime);

    if (!editingEvent && startDateTime.getTime() < Date.now()) {
      setModalError('Start date/time cannot be in the past for new events.');
      return;
    }

    if (endDateTime <= startDateTime) {
      setModalError('End time must be after start time.');
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    setModalError(null);

    const payload: CommunityEventPayload = {
      ...form,
      time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
    };

    try {
      if (editingEvent) {
        await updateCommunityEvent(editingEvent.id, payload);
      } else {
        await createCommunityEvent(payload);
      }
      await mutate(ADMIN_EVENTS_ENDPOINT);
      setStatusType(StatusTypes.Success);
      setStatusMessage('Event saved successfully.');
      setModalOpen(false);
      setEditingEvent(null);
    } catch (e: any) {
      setStatusType(StatusTypes.Error);
      setStatusMessage(e?.message || 'Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentList = tab === 'active' ? sortedActive : sortedInactive;

  return (
    <Container>
      <Header>
        <HeaderText>
          <Title>Events</Title>
          <Description>
            Manage community events shown to users. Use the tabs to switch
            between active and inactive events.
          </Description>
        </HeaderText>
        <Button
          appearance={ButtonAppearance.Primary}
          size={ButtonSizes.Small}
          onClick={openCreateModal}
        >
          Create event
        </Button>
      </Header>

      {statusMessage && (
        <StatusMessage type={statusType} visible>
          {statusMessage}
        </StatusMessage>
      )}

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load events.
        </StatusMessage>
      )}

      <Tabs value={tab} onValueChange={value => setTab(value as TabValue)}>
        <TabsList>
          <TabsTrigger value="active">Active events</TabsTrigger>
          <TabsTrigger value="inactive">Inactive events</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? (
            <Text type={TextTypes.Body2}>Loading events…</Text>
          ) : currentList.length === 0 ? (
            <Text type={TextTypes.Body2}>No events in this category.</Text>
          ) : (
            <EventsGrid>
              {currentList.map(event => (
                <Card key={event.id} width={CardSizes.Medium}>
                  <CardHeader>
                    <Text type={TextTypes.Body1}>{event.title}</Text>
                  </CardHeader>
                  <CardContent>
                    {event.image && (
                      <EventImage src={event.image} alt={event.title} />
                    )}
                    <Text type={TextTypes.Body3}>{event.description}</Text>
                    <EventMeta>
                      <EventMetaRow>
                        <strong>Starts:</strong> {formatDateTime(event.time)}
                      </EventMetaRow>
                      <EventMetaRow>
                        <strong>Ends:</strong> {formatDateTime(event.end_time)}
                      </EventMetaRow>
                      <EventMetaRow>
                        <strong>Frequency:</strong>{' '}
                        {FREQUENCY_LABELS[event.frequency]}
                      </EventMetaRow>
                      {event.link && (
                        <EventMetaRow>
                          <strong>Link:</strong> {event.link}
                        </EventMetaRow>
                      )}
                      <EventMetaRow>
                        <Tag
                          appearance={
                            event.active
                              ? TagAppearance.success
                              : TagAppearance.outline
                          }
                          size={TagSizes.small}
                        >
                          {event.active ? 'Active' : 'Inactive'}
                        </Tag>
                      </EventMetaRow>
                    </EventMeta>
                  </CardContent>
                  <CardFooter align="space-between">
                    <Button
                      appearance={ButtonAppearance.Secondary}
                      size={ButtonSizes.Small}
                      onClick={() => openEditModal(event)}
                    >
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </EventsGrid>
          )}
        </TabsContent>
      </Tabs>

      <Modal open={modalOpen} onClose={closeModal}>
        <Card width={CardSizes.Large}>
          <CardHeader>
            {editingEvent ? 'Edit event' : 'Create event'}
          </CardHeader>
          <CardContent>
            <FormStack>
              {modalError && (
                <StatusMessage type={StatusTypes.Error} visible>
                  {modalError}
                </StatusMessage>
              )}

              <Switch
                inputRef={activeSwitchRef as RefObject<HTMLButtonElement>}
                label="Active"
                labelInline
                checked={form.active}
                onCheckedChange={value =>
                  setForm(prev => ({
                    ...prev,
                    active: value,
                  }))
                }
              />

              <TextInput
                id="event-title"
                label="Title"
                value={form.title}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter event title"
              />

              <TextArea
                id="event-description"
                label="Description"
                value={form.description}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter event description"
                rows={4}
              />

              <DatePickerContainer>
                <FormField>
                  <FormLabel>Event Date</FormLabel>
                  <DatePicker
                    date={eventDate}
                    setDate={setEventDate}
                    disablePastDays={!editingEvent}
                    inModal
                  />
                </FormField>
                <FormField>
                  <FormLabel>Start Time</FormLabel>
                  <TimeInput
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    disabled={saving}
                  />
                </FormField>
                <FormField>
                  <FormLabel>End Time</FormLabel>
                  <TimeInput
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    disabled={saving}
                  />
                </FormField>
              </DatePickerContainer>

              <Dropdown
                id="event-frequency"
                label="Frequency"
                placeholder="Select frequency"
                value={form.frequency}
                options={[
                  { label: 'Once', value: 'once' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Fortnightly', value: 'fortnightly' },
                  { label: 'Monthly', value: 'monthly' },
                ]}
                onValueChange={value =>
                  setForm(prev => ({
                    ...prev,
                    frequency: value as CommunityEvent['frequency'],
                  }))
                }
                cannotError
              />

              <Dropdown
                id="event-custom-filter"
                label="Custom Filter"
                placeholder="Select custom filter"
                value={form.custom_filter}
                options={customFilterOptions}
                onValueChange={value =>
                  setForm(prev => ({
                    ...prev,
                    custom_filter: value,
                  }))
                }
                cannotError
              />

              <TextInput
                id="event-group-id"
                label="Group ID (optional)"
                value={form.group_id || ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    group_id: e.target.value || null,
                  }))
                }
                placeholder="Enter group id"
              />

              <TextInput
                id="event-link"
                label="Link (optional)"
                value={form.link}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    link: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </FormStack>
          </CardContent>
          <CardFooter align="space-between">
            <Button
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Small}
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              appearance={ButtonAppearance.Primary}
              size={ButtonSizes.Small}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    </Container>
  );
}

export default Events;
