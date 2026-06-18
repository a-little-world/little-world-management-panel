import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  InputWidth,
  Modal,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';

import {
  createLobby,
  getUpcomingLobbiesEndpoint,
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

/** Upcoming lobby item from api/random_calls/upcoming */
interface UpcomingLobbyItem {
  uuid: string;
  name: string;
  start_time: string;
  end_time: string;
  status: boolean;
  active_users_count: number;
}

function RandomCallSchedule() {
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [isCreatingLobby, setIsCreatingLobby] = useState(false);
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

  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);

  const combineDateAndTime = (date: Date | null, time: string): Date => {
    if (!date) return new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const handleCloseCreateLobby = useCallback(() => {
    setShowCreateLobby(false);
  }, []);

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

  const { data: upcomingLobbies, error } = useSWR<UpcomingLobbyItem[]>(
    getUpcomingLobbiesEndpoint(),
    dataFetcher,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const handleCreateLobby = async () => {
    if (!newLobbyStartDate) {
      alert('Please select a start date');
      return;
    }

    const startDateTime = combineDateAndTime(
      newLobbyStartDate,
      newLobbyStartTime,
    );
    const endDateTime = combineDateAndTime(newLobbyStartDate, newLobbyEndTime);

    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }

    setIsCreatingLobby(true);
    createLobby({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      matchProposalTimeout,
      onSuccess: () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        setNewLobbyStartDate(now);
        setNewLobbyStartTime(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        );
        const endTime = new Date(now);
        endTime.setHours(endTime.getHours() + 2);
        setNewLobbyEndTime(
          `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`,
        );
        setMatchProposalTimeout(60);
        setShowCreateLobby(false);
        setIsCreatingLobby(false);
        mutate(getUpcomingLobbiesEndpoint());
        alert('Lobby created successfully!');
      },
      onError: (error: any) => {
        console.error('Error creating lobby:', error);
        const errorMessage =
          error?.message ||
          error?.data?.error ||
          'Failed to create lobby. Please try again.';
        alert(errorMessage);
        setIsCreatingLobby(false);
      },
    });
  };

  const schedule = upcomingLobbies ?? [];

  return (
    <PageContainer>
      <Header>
        <Title>Schedule</Title>
        <Button
          appearance={ButtonAppearance.Primary}
          size={ButtonSizes.Small}
          onClick={() => setShowCreateLobby(true)}
        >
          Create Lobby
        </Button>
      </Header>

      {/* Create Lobby Modal */}
      <Modal open={showCreateLobby} onClose={handleCloseCreateLobby}>
        <Card width={CardSizes.Medium}>
          <CardHeader>Create New Lobby</CardHeader>
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
                <FormLabel style={{ marginTop: '0.5rem' }}>
                  Start Time
                </FormLabel>
                <TimeInput
                  ref={startTimeInputRef}
                  value={newLobbyStartTime}
                  onChange={handleStartTimeChange}
                  disabled={isCreatingLobby}
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
                <FormLabel style={{ marginTop: '0.5rem' }}>End Time</FormLabel>
                <TimeInput
                  ref={endTimeInputRef}
                  value={newLobbyEndTime}
                  onChange={handleEndTimeChange}
                  disabled={isCreatingLobby}
                />
              </FormField>
            </DatePickerContainer>
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
                disabled={isCreatingLobby}
              />
            </FormField>
          </CardContent>
          <CardFooter align="space-between">
            <Button
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Medium}
              onClick={() => setShowCreateLobby(false)}
              disabled={isCreatingLobby}
            >
              Cancel
            </Button>
            <Button
              appearance={ButtonAppearance.Primary}
              size={ButtonSizes.Medium}
              onClick={handleCreateLobby}
              disabled={isCreatingLobby}
            >
              {isCreatingLobby ? 'Creating...' : 'Create Lobby'}
            </Button>
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
                  </ScheduleStatus>
                </ScheduleItem>
              );
            })}
          </ScheduleList>
        )}
      </Section>
    </PageContainer>
  );
}

export default RandomCallSchedule;
