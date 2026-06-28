import {
  ChevronDownIcon,
  Label,
  Popover,
  PopoverSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import * as RadixPopover from '@radix-ui/react-popover';
import React from 'react';
import styled from 'styled-components';

import type { StaffUser } from '../../api/supportTasks';
import type { UserProfile } from './ObjectHistory';
import UserImage from '../atoms/UserImage';

const UNASSIGNED = 'UNASSIGNED';
const PICKER_WIDTH = '11rem';

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

function staffUserToProfile(user: StaffUser): UserProfile {
  return {
    id: user.id,
    first_name: user.first_name,
    second_name: user.last_name,
    image: null,
    avatar_config: { seed: user.email },
    image_type: 'avatar',
  };
}

function getAssigneeProfile(
  value: string,
  staffUsers: StaffUser[],
  assignedProfile: UserProfile | null | undefined,
): UserProfile | null {
  if (value === UNASSIGNED) {
    return null;
  }
  if (assignedProfile && String(assignedProfile.id) === value) {
    return assignedProfile;
  }
  const staffUser = staffUsers.find(user => String(user.id) === value);
  return staffUser ? staffUserToProfile(staffUser) : null;
}

type SupportTaskAssigneePickerProps = {
  value: string;
  staffUsers: StaffUser[];
  assignedProfile?: UserProfile | null;
  onValueChange: (value: string) => void;
};

export default function SupportTaskAssigneePicker({
  value,
  staffUsers,
  assignedProfile = null,
  onValueChange,
}: SupportTaskAssigneePickerProps) {
  const selectedProfile = getAssigneeProfile(value, staffUsers, assignedProfile);
  const options = [
    { value: UNASSIGNED, label: 'Unassigned', profile: null as UserProfile | null },
    ...staffUsers.map(user => ({
      value: String(user.id),
      label: `${user.first_name} ${user.last_name}`,
      profile: staffUserToProfile(user),
    })),
  ];

  if (
    assignedProfile &&
    !options.some(option => option.value === String(assignedProfile.id))
  ) {
    options.push({
      value: String(assignedProfile.id),
      label: `${assignedProfile.first_name} ${assignedProfile.second_name}`,
      profile: assignedProfile,
    });
  }

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
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
                    {selectedProfile.first_name} {selectedProfile.second_name}
                  </Text>
                </>
              ) : (
                <Text type={TextTypes.Body6} tag="span">
                  Unassigned
                </Text>
              )}
            </TriggerContent>
            <ChevronDownIcon label="Open assignee options" width="12px" />
          </Trigger>
        }
      >
        <OptionList>
          {options.map(option => (
            <RadixPopover.Close asChild key={option.value}>
              <OptionButton
                type="button"
                $selected={option.value === value}
                onClick={() => handleSelect(option.value)}
              >
                {option.profile && (
                  <UserImage
                    alt={option.label}
                    user={option.profile}
                    dimensions={{ width: 24, height: 24 }}
                  />
                )}
                <OptionLabel>{option.label}</OptionLabel>
              </OptionButton>
            </RadixPopover.Close>
          ))}
        </OptionList>
      </Popover>
    </Field>
  );
}

export { UNASSIGNED as SUPPORT_TASK_UNASSIGNED_ASSIGNEE };
