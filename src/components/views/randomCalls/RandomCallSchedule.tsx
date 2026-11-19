import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  InputWidth,
  Modal,
  PencilIcon,
  Select,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextInput,
  TrashIcon,
} from '@a-little-world/little-world-design-system';

import { isEmpty } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import { useTheme } from 'styled-components';
import useSWR, { mutate } from 'swr';

import {
  createLobby,
  deleteLobby,
  getUpcomingLobbiesEndpoint,
  LobbyFrequency,
  LobbyListItem,
  LobbyMutationScope,
  updateLobby,
} from '../../../api/randomCalls';
import { formatDate, formatEventTime } from '../../../helpers/date';
import { dataFetcher } from '../../../store';
import { DatePicker } from '../../atoms/DatePicker';
import { PageContainer } from '../../atoms/PageLayout';
import {
  DatePickerContainer,
  FormField,
  FormLabel,
  Header,
  ScheduleDate,
  ScheduleItem,
  ScheduleItemInfo,
  ScheduleList,
  ScheduleStatus,
  ScheduleTime,
  Section,
  TimeInput,
  Title,
} from './RandomCalls.styles';

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
];

function RandomCallSchedule() {
  const theme = useTheme();
  const [showLobbyForm, setShowLobbyForm] = useState(false);
  const [editingLobby, setEditingLobby] = useState<LobbyListItem | null>(null);
  const [deletingLobby, setDeletingLobby] = useState<LobbyListItem | null>(
    null,
  );
  const [isSavingLobby, setIsSavingLobby] = useState(false);
  const [isDeletingLobby, setIsDeletingLobby] = useState(false);
  const [newLobbyStartDate, setNewLobbyStartDate] = useState<Date | null>(
    new Date(),
  );
  const [newLobbyStartTime, setNewLobbyStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes());
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [newLobbyEndTime, setNewLobbyEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [matchProposalTimeout, setMatchProposalTimeout] = useState(60);
  const [frequency, setFrequency] = useState<LobbyFrequency>('once');

  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);

  const timeValue = (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  const combineDateAndTime = (date: Date | null, time: string): Date => {
    if (!date) return new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const handleCloseLobbyForm = useCallback(() => {
    if (isSavingLobby) return;
    setShowLobbyForm(false);
    setEditingLobby(null);
  }, [isSavingLobby]);

  const resetLobbyForm = useCallback(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const endTime = new Date(now);
    endTime.setHours(endTime.getHours() + 2);
    setNewLobbyStartDate(now);
    setNewLobbyStartTime(timeValue(now));
    setNewLobbyEndTime(timeValue(endTime));
    setMatchProposalTimeout(60);
    setFrequency('once');
  }, []);

  const handleOpenCreateLobby = () => {
    resetLobbyForm();
    setEditingLobby(null);
    setShowLobbyForm(true);
  };

  const handleOpenEditLobby = (lobby: LobbyListItem) => {
    const startTime = new Date(lobby.start_time);
    const endTime = new Date(lobby.end_time);
    setNewLobbyStartDate(startTime);
    setNewLobbyStartTime(timeValue(startTime));
    setNewLobbyEndTime(timeValue(endTime));
    setMatchProposalTimeout(lobby.match_proposal_timeout);
    setFrequency(lobby.frequency);
    setEditingLobby(lobby);
    setShowLobbyForm(true);
  };

  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewLobbyStartTime(e.target.value);
    },
    [],
  );

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewLobbyEndTime(e.target.value);
    },
    [],
  );

  const handleMatchProposalTimeoutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      if (Number.isNaN(value)) {
        setMatchProposalTimeout(60);
        return;
      }
      setMatchProposalTimeout(Math.max(1, value));
    },
    [],
  );

  const { data: upcomingLobbies, error } = useSWR<LobbyListItem[]>(
    getUpcomingLobbiesEndpoint(),
    dataFetcher,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const validateLobbyForm = () => {
    if (!newLobbyStartDate) {
      alert('Please select a start date');
      return null;
    }

    const startDateTime = combineDateAndTime(
      newLobbyStartDate,
      newLobbyStartTime,
    );
    const endDateTime = combineDateAndTime(newLobbyStartDate, newLobbyEndTime);

    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return null;
    }
    return { startDateTime, endDateTime };
  };

  const saveLobby = async (scope: LobbyMutationScope = 'single') => {
    const times = validateLobbyForm();
    if (!times) return;
    const { startDateTime, endDateTime } = times;
    setIsSavingLobby(true);
    try {
      if (editingLobby) {
        await updateLobby({
          lobbyUuid: editingLobby.uuid,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          matchProposalTimeout,
          frequency,
          scope,
        });
      } else {
        await createLobby({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          matchProposalTimeout,
          frequency,
          onSuccess: () => undefined,
          onError: error => {
            throw error;
          },
        });
      }
      setShowLobbyForm(false);
      setEditingLobby(null);
      await mutate(getUpcomingLobbiesEndpoint());
      alert(`Lobby ${editingLobby ? 'updated' : 'created'} successfully!`);
    } catch (error: any) {
      console.error('Error saving lobby:', error);
      alert(error?.message || 'Failed to save lobby. Please try again.');
    } finally {
      setIsSavingLobby(false);
    }
  };

  const handleSaveLobby = () => {
    const scope =
      editingLobby && editingLobby.frequency !== frequency
        ? 'future'
        : 'single';
    saveLobby(scope);
  };

  const isEditingSeries = Boolean(editingLobby?.recurrence_group);

  const handleDeleteLobby = async (scope: LobbyMutationScope = 'single') => {
    if (!deletingLobby) return;
    setIsDeletingLobby(true);
    try {
      await deleteLobby(deletingLobby.uuid, scope);
      setDeletingLobby(null);
      await mutate(getUpcomingLobbiesEndpoint());
      alert('Lobby deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting lobby:', error);
      alert(error?.message || 'Failed to delete lobby. Please try again.');
    } finally {
      setIsDeletingLobby(false);
    }
  };

  const schedule = upcomingLobbies ?? [];

  // Series are only generated to 31 December; showing where each one stops is the
  // reminder to schedule the next year.
  const seriesEnds = schedule.reduce<Record<string, Date>>((ends, lobby) => {
    if (!lobby.recurrence_group) return ends;
    const start = new Date(lobby.start_time);
    const current = ends[lobby.recurrence_group];
    if (!current || start > current) ends[lobby.recurrence_group] = start;
    return ends;
  }, {});

  return (
    <PageContainer>
      <Header>
        <Title>Schedule</Title>
        <Button
          appearance={ButtonAppearance.Primary}
          size={ButtonSizes.Small}
          onClick={handleOpenCreateLobby}
        >
          Create Lobby
        </Button>
      </Header>

      <Modal open={showLobbyForm} onClose={handleCloseLobbyForm}>
        <Card width={CardSizes.Medium}>
          <CardHeader>
            {editingLobby ? 'Edit Lobby' : 'Create New Lobby'}
          </CardHeader>
          <CardContent align="flex-start">
            <DatePickerContainer>
              <FormField>
                <FormLabel>Start Date</FormLabel>
                <DatePicker
                  date={newLobbyStartDate}
                  setDate={setNewLobbyStartDate}
                  disablePastDays
                  inModal
                />
                <FormLabel>Start Time</FormLabel>
                <TimeInput
                  ref={startTimeInputRef}
                  value={newLobbyStartTime}
                  onChange={handleStartTimeChange}
                  disabled={isSavingLobby}
                />
              </FormField>
              <FormField>
                <FormLabel>End Date</FormLabel>
                <DatePicker
                  date={newLobbyStartDate}
                  setDate={() => {}}
                  disabled
                  inModal
                />
                <FormLabel>End Time</FormLabel>
                <TimeInput
                  ref={endTimeInputRef}
                  value={newLobbyEndTime}
                  onChange={handleEndTimeChange}
                  disabled={isSavingLobby}
                />
              </FormField>
            </DatePickerContainer>
            <FormField>
              <Select
                label="Frequency"
                id="lobbyFrequency"
                value={frequency}
                options={FREQUENCY_OPTIONS}
                placeholder="Select a frequency"
                onValueChange={value => setFrequency(value as LobbyFrequency)}
                inModal
                cannotError
                disabled={isSavingLobby}
              />
            </FormField>
            <FormField>
              <TextInput
                label="Match Proposal Timeout (seconds)"
                id="matchProposalTimeout"
                type="number"
                min={30}
                max={240}
                width={InputWidth.Medium}
                value={String(matchProposalTimeout)}
                onChange={handleMatchProposalTimeoutChange}
                disabled={isSavingLobby}
              />
            </FormField>
          </CardContent>
          <CardFooter align="space-between">
            <Button
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Medium}
              onClick={handleCloseLobbyForm}
              disabled={isSavingLobby}
            >
              Cancel
            </Button>
            {isEditingSeries ? (
              <>
                <Button
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Medium}
                  onClick={() => saveLobby('single')}
                  disabled={
                    isSavingLobby || frequency !== editingLobby?.frequency
                  }
                >
                  Save This Lobby
                </Button>
                <Button
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Medium}
                  onClick={() => saveLobby('future')}
                  disabled={isSavingLobby}
                >
                  {isSavingLobby ? 'Saving...' : 'Save This and Future'}
                </Button>
              </>
            ) : (
              <Button
                appearance={ButtonAppearance.Primary}
                size={ButtonSizes.Medium}
                onClick={handleSaveLobby}
                disabled={isSavingLobby}
              >
                {isSavingLobby
                  ? 'Saving...'
                  : editingLobby
                    ? 'Save Changes'
                    : 'Create Lobby'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </Modal>

      <Section>
        {error ? (
          <Text color="secondary">No upcoming lobbies scheduled</Text>
        ) : isEmpty(schedule) ? (
          <Text color="secondary">No upcoming lobbies scheduled</Text>
        ) : (
          <ScheduleList>
            {schedule.map(lobbyItem => {
              const startDate = new Date(lobbyItem.start_time);
              const endDate = new Date(lobbyItem.end_time);
              const formattedDate = formatDate(
                startDate,
                'EEEE, d MMMM yyyy',
                'de',
              );
              const formattedTime = formatEventTime(startDate, endDate);
              const seriesEnd = lobbyItem.recurrence_group
                ? seriesEnds[lobbyItem.recurrence_group]
                : undefined;

              return (
                <ScheduleItem key={lobbyItem.uuid}>
                  <ScheduleItemInfo>
                    <ScheduleDate>{formattedDate}</ScheduleDate>
                    <ScheduleTime>{formattedTime}</ScheduleTime>
                  </ScheduleItemInfo>
                  <ScheduleStatus>
                    <Tag
                      appearance={
                        lobbyItem.status
                          ? TagAppearance.success
                          : TagAppearance.outline
                      }
                      size={TagSizes.small}
                    >
                      {lobbyItem.status ? 'Active' : 'Upcoming'}
                    </Tag>
                    <Text>{lobbyItem.active_users_count} users</Text>
                    {lobbyItem.frequency !== 'once' && (
                      <Text>
                        {
                          FREQUENCY_OPTIONS.find(
                            option => option.value === lobbyItem.frequency,
                          )?.label
                        }
                        {seriesEnd &&
                          (seriesEnd > startDate
                            ? ` until ${formatDate(seriesEnd, 'd MMM yyyy', 'de')}`
                            : ', last in series')}
                      </Text>
                    )}
                    {startDate > new Date() && (
                      <>
                        <Button
                          variation={ButtonVariations.Circle}
                          appearance={ButtonAppearance.Secondary}
                          size={ButtonSizes.Medium}
                          onClick={() => handleOpenEditLobby(lobbyItem)}
                          color={theme.color.text.accent}
                        >
                          <PencilIcon
                            label="Edit lobby"
                            width={16}
                            height={16}
                          />
                        </Button>
                        <Button
                          variation={ButtonVariations.Circle}
                          appearance={ButtonAppearance.Secondary}
                          size={ButtonSizes.Medium}
                          onClick={() => setDeletingLobby(lobbyItem)}
                          color={theme.color.text.error}
                        >
                          <TrashIcon
                            label="Delete lobby"
                            width={16}
                            height={16}
                          />
                        </Button>
                      </>
                    )}
                  </ScheduleStatus>
                </ScheduleItem>
              );
            })}
          </ScheduleList>
        )}
      </Section>

      <Modal
        open={Boolean(deletingLobby)}
        onClose={() => {
          if (!isDeletingLobby) setDeletingLobby(null);
        }}
      >
        <Card width={CardSizes.Medium}>
          <CardHeader>Delete Lobby?</CardHeader>
          <CardContent align="flex-start">
            <Text>
              This will permanently delete the scheduled random call session.
              Are you sure you want to continue?
            </Text>
          </CardContent>
          <CardFooter align="space-between">
            <Button
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Medium}
              onClick={() => setDeletingLobby(null)}
              disabled={isDeletingLobby}
            >
              Cancel
            </Button>
            <Button
              appearance={ButtonAppearance.Primary}
              size={ButtonSizes.Medium}
              onClick={() => handleDeleteLobby('single')}
              disabled={isDeletingLobby}
            >
              {isDeletingLobby ? 'Deleting...' : 'Delete This Lobby'}
            </Button>
            {deletingLobby?.recurrence_group && (
              <Button
                appearance={ButtonAppearance.Primary}
                size={ButtonSizes.Medium}
                onClick={() => handleDeleteLobby('future')}
                disabled={isDeletingLobby}
              >
                Delete This and Future
              </Button>
            )}
          </CardFooter>
        </Card>
      </Modal>
    </PageContainer>
  );
}

export default RandomCallSchedule;
