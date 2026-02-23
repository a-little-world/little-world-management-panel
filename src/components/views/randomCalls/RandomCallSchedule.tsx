import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Modal,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
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
import {
  Container,
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
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [newLobbyEndDate, setNewLobbyEndDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setHours(date.getHours() + 2);
    return date;
  });
  const [newLobbyEndTime, setNewLobbyEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

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

  const { data: upcomingLobbies, error } = useSWR<UpcomingLobbyItem[]>(
    getUpcomingLobbiesEndpoint(),
    dataFetcher,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const handleCreateLobby = async () => {
    if (!newLobbyStartDate || !newLobbyEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    const startDateTime = combineDateAndTime(
      newLobbyStartDate,
      newLobbyStartTime,
    );
    const endDateTime = combineDateAndTime(newLobbyEndDate, newLobbyEndTime);

    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }

    setIsCreatingLobby(true);
    createLobby({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      onSuccess: () => {
        const now = new Date();
        setNewLobbyStartDate(now);
        setNewLobbyStartTime(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        );
        const newEndDate = new Date();
        newEndDate.setHours(newEndDate.getHours() + 2);
        setNewLobbyEndDate(newEndDate);
        setNewLobbyEndTime(
          `${String(newEndDate.getHours()).padStart(2, '0')}:${String(newEndDate.getMinutes()).padStart(2, '0')}`,
        );
        setShowCreateLobby(false);
        mutate(getUpcomingLobbiesEndpoint());
        alert('Lobby created successfully!');
        setIsCreatingLobby(false);
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

  if (error) {
    return (
      <Container>
        <Text>Error loading schedule: {error.message}</Text>
      </Container>
    );
  }

  const schedule = upcomingLobbies ?? [];

  return (
    <Container>
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
          <CardContent>
            <DatePickerContainer>
              <FormField>
                <FormLabel>Start Date</FormLabel>
                <DatePicker
                  date={newLobbyStartDate}
                  setDate={setNewLobbyStartDate}
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
                  date={newLobbyEndDate}
                  setDate={setNewLobbyEndDate}
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

      {/* Schedule */}
      <Section>
        {isEmpty(schedule) ? (
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
    </Container>
  );
}

export default RandomCallSchedule;
