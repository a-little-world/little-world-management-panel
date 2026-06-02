import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Loading,
  LoadingSizes,
  Modal,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_EVENTS_ENDPOINT,
  CommunityEvent,
  CommunityEventPayload,
  createCommunityEvent,
  fetchCommunityEvents,
  updateCommunityEvent,
} from '../../../../api/communityEvents';
import { COMMUNITY_EVENT_FREQUENCIES, LANGUAGES } from '../../../../constants';
import { formatDate, formatEventTime } from '../../../../helpers/date';
import { calculateNextOccurrence } from '../../../../helpers/events';
import {
  ListPanel,
  ListScroll,
  PageContainer,
} from '../../../atoms/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../atoms/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../atoms/Tabs';
import { usePageHeader } from '../../../blocks/LayoutHeaderContext';
import EventForm, { EventFormValues } from './EventForm';
import {
  ColDate,
  ColDateTime,
  ColMuted,
  ColMutedStart,
  ColTime,
  ColTitle,
} from './Events.styles';

const LIST_LOCALE = LANGUAGES.en;

const FREQUENCY_LABELS: Record<CommunityEvent['frequency'], string> = {
  once: 'Once',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
};

type TabValue = 'upcoming' | 'past';

function shouldBeInPastTab(event: CommunityEvent, now: Date): boolean {
  const start = new Date(event.time);
  const effectiveEnd = event.end_time ? new Date(event.end_time) : start;

  if (!event.active && effectiveEnd.getTime() < now.getTime()) {
    return true;
  }
  return (
    event.frequency === COMMUNITY_EVENT_FREQUENCIES.once &&
    effectiveEnd.getTime() < now.getTime()
  );
}

function isInUpcomingTab(event: CommunityEvent, now: Date): boolean {
  if (shouldBeInPastTab(event, now)) {
    return false;
  }

  const nextStart = calculateNextOccurrence(
    event.time,
    event.frequency,
    event.end_time ?? undefined,
  );
  return nextStart.getTime() >= now.getTime();
}

function getUpcomingSortTime(event: CommunityEvent): number {
  if (event.frequency === COMMUNITY_EVENT_FREQUENCIES.once) {
    return new Date(event.time).getTime();
  }
  return calculateNextOccurrence(
    event.time,
    event.frequency,
    event.end_time ?? undefined,
  ).getTime();
}

function getPastSortTime(event: CommunityEvent): number {
  const timestamp = new Date(event.time).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getUpcomingDisplayWindow(event: CommunityEvent): {
  start: Date;
  end: Date | null;
} {
  const origStart = new Date(event.time);
  const origEnd = event.end_time ? new Date(event.end_time) : null;

  if (event.frequency === COMMUNITY_EVENT_FREQUENCIES.once) {
    return { start: origStart, end: origEnd };
  }

  const nextStart = calculateNextOccurrence(
    event.time,
    event.frequency,
    event.end_time ?? undefined,
  );
  if (origEnd) {
    const durationMs = origEnd.getTime() - origStart.getTime();
    return {
      start: nextStart,
      end: new Date(nextStart.getTime() + durationMs),
    };
  }
  return { start: nextStart, end: null };
}

const defaultFormFields: Omit<CommunityEventPayload, 'time' | 'end_time'> = {
  title: '',
  description: '',
  group_id: null,
  frequency: 'once',
  link: '',
  custom_filter: 'none',
  active: true,
};

const toTimeString = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const getDefaultFormValues = (): EventFormValues => {
  const now = new Date();
  const later = new Date(now);
  later.setHours(later.getHours() + 1);

  return {
    ...defaultFormFields,
    eventDate: now,
    startTime: toTimeString(now),
    endTime: toTimeString(later),
    eventImageFile: null,
  };
};

const getEditFormValues = (event: CommunityEvent): EventFormValues => {
  const eventStart = new Date(event.time);
  const eventEnd = event.end_time
    ? new Date(event.end_time)
    : new Date(eventStart);

  if (!event.end_time) {
    eventEnd.setHours(eventEnd.getHours() + 1);
  }

  return {
    title: event.title,
    description: event.description,
    group_id: event.group_id,
    frequency: event.frequency,
    link: event.link,
    custom_filter: event.custom_filter,
    active: event.active,
    eventDate: eventStart,
    startTime: toTimeString(eventStart),
    endTime: toTimeString(eventEnd),
    eventImageFile: null,
  };
};

const combineDateAndTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

function Events() {
  const { data, error, isLoading } = useSWR<CommunityEvent[]>(
    ADMIN_EVENTS_ENDPOINT,
    fetchCommunityEvents,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const [tab, setTab] = useState<TabValue>('upcoming');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [formInitialValues, setFormInitialValues] =
    useState<EventFormValues>(getDefaultFormValues);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const sortedUpcoming = useMemo(() => {
    const now = new Date();
    return (data || [])
      .filter(e => isInUpcomingTab(e, now))
      .slice()
      .sort((a, b) => getUpcomingSortTime(a) - getUpcomingSortTime(b));
  }, [data]);

  const sortedPast = useMemo(() => {
    const now = new Date();
    return (data || [])
      .filter(e => !isInUpcomingTab(e, now))
      .slice()
      .sort((a, b) => getPastSortTime(b) - getPastSortTime(a));
  }, [data]);

  const customFilterOptions = useMemo(() => {
    const opts = data?.[0]?.options?.custom_filter;
    if (!opts || opts.length === 0) {
      return [{ label: 'None', value: 'none' }];
    }
    return opts.map(item => ({
      label: item.tag,
      value: item.value,
    }));
  }, [data]);

  const filterLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    customFilterOptions.forEach(o => map.set(o.value, o.label));
    return map;
  }, [customFilterOptions]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormInitialValues(getDefaultFormValues());
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (event: CommunityEvent) => {
    setEditingEvent(event);
    setFormInitialValues(getEditFormValues(event));
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingEvent(null);
    setModalError(null);
  };

  const handleSave = async (values: EventFormValues) => {
    const { eventDate, startTime, endTime, eventImageFile, ...form } = values;

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
      const imageArg = eventImageFile ?? undefined;
      if (editingEvent) {
        await updateCommunityEvent(editingEvent.id, payload, imageArg);
      } else {
        await createCommunityEvent(payload, imageArg);
      }
      await mutate(ADMIN_EVENTS_ENDPOINT);
      setStatusMessage('Event saved successfully.');
      setModalOpen(false);
      setEditingEvent(null);
    } catch (e: any) {
      setModalError(e?.message || 'Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  usePageHeader({
    actions: (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={openCreateModal}
      >
        Create event
      </Button>
    ),
  });

  const currentList = tab === 'upcoming' ? sortedUpcoming : sortedPast;

  return (
    <PageContainer>
      {statusMessage && (
        <StatusMessage type={StatusTypes.Success} visible>
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
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? (
            <Loading size={LoadingSizes.Medium} />
          ) : (
            <ListPanel>
              <ListScroll>
                {currentList.length === 0 ? (
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <Text type={TextTypes.Body4}>No events in this tab.</Text>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[11rem] min-w-[9rem]">
                          Date &amp; time
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-32 text-center">
                          Active
                        </TableHead>
                        <TableHead className="w-32 text-center">
                          Frequency
                        </TableHead>
                        <TableHead className="w-36 min-w-[7rem]">
                          Filter
                        </TableHead>
                        <TableHead className="w-[5.5rem] text-right">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentList.map(event => {
                        const { start, end } =
                          tab === 'upcoming'
                            ? getUpcomingDisplayWindow(event)
                            : {
                                start: new Date(event.time),
                                end: event.end_time
                                  ? new Date(event.end_time)
                                  : null,
                              };
                        const dateLine = formatDate(
                          start,
                          'EEE d MMM yyyy',
                          LIST_LOCALE,
                        );
                        const timeLine = end
                          ? formatEventTime(start, end)
                          : formatEventTime(start, undefined);

                        return (
                          <TableRow key={event.id}>
                            <TableCell className="align-top">
                              <ColDateTime>
                                <ColDate>{dateLine}</ColDate>
                                <ColTime>{timeLine}</ColTime>
                              </ColDateTime>
                            </TableCell>
                            <TableCell className="max-w-[14rem]">
                              <ColTitle title={event.title}>
                                {event.title}
                              </ColTitle>
                            </TableCell>
                            <TableCell className="text-center">
                              <Tag
                                appearance={
                                  event.active
                                    ? TagAppearance.success
                                    : TagAppearance.error
                                }
                              >
                                {event.active ? 'Active' : 'Inactive'}
                              </Tag>
                            </TableCell>
                            <TableCell className="text-center">
                              <ColMuted>
                                <Tag>{FREQUENCY_LABELS[event.frequency]}</Tag>
                              </ColMuted>
                            </TableCell>
                            <TableCell className="max-w-[10rem]">
                              <ColMutedStart title={event.custom_filter}>
                                {filterLabelMap.get(event.custom_filter) ??
                                  event.custom_filter}
                              </ColMutedStart>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                appearance={ButtonAppearance.Secondary}
                                size={ButtonSizes.Small}
                                onClick={() => openEditModal(event)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </ListScroll>
            </ListPanel>
          )}
        </TabsContent>
      </Tabs>

      <Modal open={modalOpen} onClose={closeModal}>
        <EventForm
          editingEvent={editingEvent}
          saving={saving}
          modalError={modalError}
          customFilterOptions={customFilterOptions}
          initialValues={formInitialValues}
          onCancel={closeModal}
          onSubmit={handleSave}
        />
      </Modal>
    </PageContainer>
  );
}

export default Events;
