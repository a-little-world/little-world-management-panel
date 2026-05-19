import {
  Button,
  ButtonVariations,
  Dropdown,
  Modal,
  RadioGroup,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { RadioGroupVariations } from '@a-little-world/little-world-design-system-core';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';

import {
  StaffUser,
  TaskPriority,
  UserSearchResult,
  createManualSupportTask,
  searchUsers,
} from '../../api/supportTasks';
import { ORANGE_40 } from '../../constants';
import { useTaskPriorityList } from '../../hooks/useTaskPriorities';

// ─── Styled ───────────────────────────────────────────────────────────────────

const ModalCard = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border-radius: ${({ theme }) => theme.radius.large};
  padding: ${({ theme }) => theme.spacing.large};
  width: 540px;
  max-width: 95vw;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.medium};
  right: ${({ theme }) => theme.spacing.medium};
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme }) => theme.color.surface.secondary};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${({ theme }) => theme.color.text.secondary};
  &:hover {
    background: ${({ theme }) => theme.color.surface.tertiary};
  }
`;

const Eyebrow = styled(Text).attrs({ type: TextTypes.Body7, tag: 'div' as const })`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const ModalTitle = styled.h2`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.15;
  color: ${ORANGE_40};
  margin: 0;
`;

const FieldLabel = styled(Text).attrs({ type: TextTypes.Body6, tag: 'label' as const })`
  font-weight: 700;
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xxxsmall};
`;

const OptionalNote = styled(Text).attrs({ type: TextTypes.Body7, tag: 'span' as const })`
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 400;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xxxsmall};
`;

const RequiredStar = styled.span`
  color: ${ORANGE_40};
  margin-left: 4px;
`;

const TitleInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: 12px 14px;
  font-size: 15px;
  color: ${({ theme }) => theme.color.text.primary};
  background: ${({ theme }) => theme.color.surface.primary};
  box-sizing: border-box;
  outline: none;
  &::placeholder {
    color: ${({ theme }) => theme.color.text.quaternary};
  }
  &:focus {
    border-color: ${({ theme }) => theme.color.border.moderate};
  }
`;

const DescriptionTextarea = styled.textarea`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: 12px 14px;
  font-size: 15px;
  color: ${({ theme }) => theme.color.text.primary};
  background: ${({ theme }) => theme.color.surface.primary};
  box-sizing: border-box;
  min-height: 108px;
  resize: vertical;
  font-family: inherit;
  outline: none;
  &::placeholder {
    color: ${({ theme }) => theme.color.text.quaternary};
  }
  &:focus {
    border-color: ${({ theme }) => theme.color.border.moderate};
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  align-items: start;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  margin: 0;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
  align-items: center;
`;

// ─── User search combobox ─────────────────────────────────────────────────────

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: 10px 36px 10px 14px;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.primary};
  background: ${({ theme }) => theme.color.surface.primary};
  box-sizing: border-box;
  outline: none;
  &::placeholder {
    color: ${({ theme }) => theme.color.text.quaternary};
  }
  &:focus {
    border-color: ${({ theme }) => theme.color.border.moderate};
  }
`;

const SearchChevron = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.color.text.tertiary};
  font-size: 12px;
`;

const ResultsList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  list-style: none;
  margin: 0;
  padding: ${({ theme }) => theme.spacing.xxxsmall} 0;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const ResultItem = styled.li`
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

const ResultName = styled.span`
  font-weight: 600;
  margin-right: 6px;
`;

const ResultEmail = styled.span`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const ErrorText = styled.span`
  color: red;
  font-size: 12px;
`;

const SearchingItem = styled.li`
  padding: 8px 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.tertiary};
  cursor: default;
`;

// ─── Priority items ────────────────────────────────────────────────────────────

const UNASSIGNED = 'UNASSIGNED';

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  staffUsers: StaffUser[];
  onCreated: () => void;
}

export default function CreateSupportTaskModal({ open, onClose, staffUsers, onCreated }: Props) {
  const priorityItems = useTaskPriorityList().map(({ priority, label }) => ({
    id: priority,
    value: priority,
    label,
  }));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState<string>(UNASSIGNED);
  const [relatedUser, setRelatedUser] = useState<UserSearchResult | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priorityRef = useRef<HTMLInputElement>(null!);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssignedTo(UNASSIGNED);
    setRelatedUser(null);
    setUserQuery('');
    setUserResults([]);
    setError(null);
    onClose();
  };

  const handleUserQueryChange = useCallback((q: string) => {
    setUserQuery(q);
    if (relatedUser) setRelatedUser(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(q);
        setUserResults(results);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [relatedUser]);

  const handleSelectUser = (user: UserSearchResult) => {
    setRelatedUser(user);
    setUserQuery(`${user.first_name} ${user.second_name} (${user.email})`);
    setUserResults([]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createManualSupportTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        related_user_id: relatedUser?.id ?? null,
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

  const assigneeOptions = [
    { value: UNASSIGNED, label: '— Unassigned' },
    ...staffUsers.map(u => ({ value: String(u.id), label: `${u.first_name} ${u.last_name}` })),
  ];

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalCard>
        <CloseButton onClick={handleClose}>×</CloseButton>

        <div>
          <Eyebrow>Support tasks</Eyebrow>
          <ModalTitle>New task</ModalTitle>
          <Text type={TextTypes.Body6} tag="p">
            Create a task manually. No automatic actions will run.
          </Text>
        </div>

        <div>
          <FieldLabel>
            Title <RequiredStar>*</RequiredStar>
          </FieldLabel>
          <TitleInput
            id="task-title"
            placeholder="Short summary of the task"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <FieldRow>
            <FieldLabel>Description</FieldLabel>
            <OptionalNote>Optional</OptionalNote>
          </FieldRow>
          <DescriptionTextarea
            id="task-description"
            placeholder="What needs to be done, and any context the assignee will need."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <TwoCol>
          <div>
            <FieldLabel>Priority</FieldLabel>
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
            <FieldLabel>Assigned to</FieldLabel>
            <Dropdown
              value={assignedTo}
              options={assigneeOptions}
              onValueChange={setAssignedTo}
              placeholder="Unassigned"
              cannotError
            />
          </div>
        </TwoCol>

        <div>
          <FieldRow>
            <FieldLabel>Related user</FieldLabel>
            <OptionalNote>Optional · the user this task is about</OptionalNote>
          </FieldRow>
          <SearchWrapper>
            <SearchInput
              placeholder="Search by name or email…"
              value={userQuery}
              onChange={e => handleUserQueryChange(e.target.value)}
              autoComplete="off"
            />
            <SearchChevron>▾</SearchChevron>
            {userResults.length > 0 && (
              <ResultsList>
                {userResults.map(u => (
                  <ResultItem key={u.id} onClick={() => handleSelectUser(u)}>
                    <ResultName>
                      {u.first_name} {u.second_name}
                    </ResultName>
                    <ResultEmail>{u.email}</ResultEmail>
                  </ResultItem>
                ))}
              </ResultsList>
            )}
            {searching && userQuery && !userResults.length && (
              <ResultsList>
                <SearchingItem>Searching…</SearchingItem>
              </ResultsList>
            )}
          </SearchWrapper>
        </div>

        {error && (
          <ErrorText>{error}</ErrorText>
        )}

        <Divider />

        <Footer>
          <Button variation={ButtonVariations.Inline} onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || submitting}>
            {submitting ? 'Creating…' : 'Create task'}
          </Button>
        </Footer>
      </ModalCard>
    </Modal>
  );
}
