import {
  CheckIcon,
  ChevronDownIcon,
  Label,
  Popover,
  PopoverSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import type { AssigneeUser } from '../../api/supportTasks';
import type { UserProfile } from './ObjectHistory';
import UserImage from '../atoms/UserImage';

const PICKER_WIDTH = '16rem';

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  width: ${PICKER_WIDTH};
  flex-shrink: 0;
`;

const Trigger = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  width: 100%;
  min-height: 2.5rem;
  padding: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.xsmall};
  border: 2px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 5px;
  background: ${({ theme }) => theme.color.surface.primary};
  color: ${({ theme }) => theme.color.text.secondary};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.moderate};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.border.selected};
    outline-offset: 1px;
  }

  &[data-state='open'] {
    border-color: ${({ theme }) => theme.color.border.selected};
  }
`;

const TriggerContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  min-width: 0;
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  width: ${PICKER_WIDTH};
  max-height: 12rem;
  overflow-y: auto;
  margin: calc(-1 * ${({ theme }) => theme.spacing.xxsmall});
`;

const OptionButton = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  width: 100%;
  min-height: 2rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  background: ${({ theme, $selected }) =>
    $selected ? theme.color.surface.secondary : 'transparent'};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  cursor: pointer;
  text-align: left;
  color: ${({ theme }) => theme.color.text.primary};

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

const OptionLabel = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'span' as const,
})`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
`;

function assigneeUserToProfile(user: AssigneeUser): UserProfile {
  return {
    id: user.id,
    first_name: user.first_name,
    second_name: user.last_name,
    image: null,
    avatar_config: { seed: user.email },
    image_type: 'avatar',
  };
}

type SupportTaskAssigneePickerProps = {
  value: number[];
  assigneeUsers: AssigneeUser[];
  assignedProfiles?: UserProfile[];
  onValueChange: (value: number[]) => void;
};

export default function SupportTaskAssigneePicker({
  value,
  assigneeUsers,
  assignedProfiles = [],
  onValueChange,
}: SupportTaskAssigneePickerProps) {
  const options = assigneeUsers.map(user => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name}`,
    profile: assigneeUserToProfile(user),
  }));

  for (const profile of assignedProfiles) {
    if (!options.some(option => option.value === profile.id)) {
      options.push({
        value: profile.id,
        label: `${profile.first_name} ${profile.second_name}`,
        profile,
      });
    }
  }

  const selectedProfile = options.find(option =>
    value.includes(option.value),
  )?.profile;
  const handleSelect = (userId: number) => {
    onValueChange(
      value.includes(userId)
        ? value.filter(id => id !== userId)
        : [...value, userId],
    );
  };

  return (
    <Field>
      <Label htmlFor="support-task-assignee">Assigned to</Label>
      <Popover
        width={PopoverSizes.Auto}
        align="start"
        sideOffset={4}
        trigger={
          <Trigger id="support-task-assignee" type="button">
            <TriggerContent>
              {selectedProfile ? (
                <>
                  <UserImage
                    alt={`${selectedProfile.first_name} ${selectedProfile.second_name}`}
                    user={selectedProfile}
                    dimensions={{ width: 24, height: 24 }}
                  />
                  <Text type={TextTypes.Body6} tag="span">
                    {value.length === 1
                      ? `${selectedProfile.first_name} ${selectedProfile.second_name}`
                      : `${value.length} users`}
                  </Text>
                </>
              ) : (
                <Text type={TextTypes.Body6} tag="span">
                  No assignees
                </Text>
              )}
            </TriggerContent>
            <ChevronDownIcon label="Open assignee options" width="12px" />
          </Trigger>
        }
      >
        <OptionList>
          <OptionButton
            type="button"
            $selected={value.length === 0}
            onClick={() => onValueChange([])}
          >
            <OptionLabel>Clear all</OptionLabel>
          </OptionButton>
          {options.map(option => (
            <OptionButton
              key={option.value}
              type="button"
              $selected={value.includes(option.value)}
              onClick={() => handleSelect(option.value)}
            >
              <UserImage
                alt={option.label}
                user={option.profile}
                dimensions={{ width: 24, height: 24 }}
              />
              <OptionLabel>{option.label}</OptionLabel>
              {value.includes(option.value) && (
                <CheckIcon label="Assigned" width="14px" />
              )}
            </OptionButton>
          ))}
        </OptionList>
      </Popover>
    </Field>
  );
}
