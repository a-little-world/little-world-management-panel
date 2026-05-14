import {
  Button,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Dropdown,
  Modal,
  MultiCheckbox,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ACTION_TYPE_CONFIG, PRIORITY_CONFIG, StaffUser } from '../../api/supportTasks';

// ─── Filter keys ──────────────────────────────────────────────────────────────

export enum TaskFilterKeys {
  Priority   = 'priority',
  ActionType = 'action_type',
  AssignedTo = 'assigned_to',
}

export const containsTaskFilterKey = (filters: Record<string, any>): boolean =>
  Object.keys(filters).some(k => Object.values(TaskFilterKeys).includes(k as TaskFilterKeys));

// ─── Options ──────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const ACTION_TYPE_OPTIONS = Object.entries(ACTION_TYPE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

// ─── Styled ───────────────────────────────────────────────────────────────────

const FiltersModal = styled(Modal)`
  z-index: 1000;
`;

const DropdownRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

const DropdownItem = styled.div`
  flex: 1 1 16rem;
  min-width: 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface SupportTaskFiltersProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: Record<string, any>;
  onUpdateFilters: (key: string, val: string | string[]) => void;
  onRemoveFilter: (key: string) => void;
  staffUsers: StaffUser[];
}

const SupportTaskFilters: React.FC<SupportTaskFiltersProps> = ({
  open,
  onClose,
  defaultValues,
  onUpdateFilters,
  onRemoveFilter,
  staffUsers,
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    setFilters({ ...(defaultValues ?? {}) });
  }, [defaultValues]);

  const handleReset = () => {
    Object.values(TaskFilterKeys).forEach(k => onRemoveFilter(k));
  };

  const assignedToOptions = [
    { value: 'unassigned', label: '— Unassigned' },
    ...staffUsers.map(u => ({ value: String(u.id), label: `${u.first_name} ${u.last_name}` })),
  ];

  return (
    <FiltersModal open={open} onClose={onClose}>
      <Card width={CardSizes.Large}>
        <CardHeader>Task Filters</CardHeader>
        <CardContent align="flex-start">

          <MultiCheckbox
            key={filters[TaskFilterKeys.Priority]}
            name={TaskFilterKeys.Priority}
            heading="Priority"
            options={PRIORITY_OPTIONS}
            preSelected={
              filters[TaskFilterKeys.Priority]
                ? [filters[TaskFilterKeys.Priority]].flat()
                : []
            }
            onSelection={val => {
              if (!val || val.length === 0) {
                onRemoveFilter(TaskFilterKeys.Priority);
              } else {
                onUpdateFilters(TaskFilterKeys.Priority, val);
              }
            }}
          />

          <MultiCheckbox
            key={filters[TaskFilterKeys.ActionType]}
            name={TaskFilterKeys.ActionType}
            heading="Type"
            options={ACTION_TYPE_OPTIONS}
            preSelected={
              filters[TaskFilterKeys.ActionType]
                ? [filters[TaskFilterKeys.ActionType]].flat()
                : []
            }
            onSelection={val => {
              if (!val || val.length === 0) {
                onRemoveFilter(TaskFilterKeys.ActionType);
              } else {
                onUpdateFilters(TaskFilterKeys.ActionType, val);
              }
            }}
          />

          <DropdownRow>
            <DropdownItem>
              <Dropdown
                key={TaskFilterKeys.AssignedTo + (filters[TaskFilterKeys.AssignedTo] ?? '')}
                label="Assigned to"
                value={filters[TaskFilterKeys.AssignedTo]}
                options={assignedToOptions}
                onValueChange={val => {
                  if (val === 'unassigned') {
                    onUpdateFilters(TaskFilterKeys.AssignedTo, 'unassigned');
                  } else {
                    onUpdateFilters(TaskFilterKeys.AssignedTo, val);
                  }
                }}
                placeholder="Any assignee"
              />
            </DropdownItem>
          </DropdownRow>

        </CardContent>
        <CardFooter align="space-between">
          <Button variation={ButtonVariations.Inline} onClick={handleReset}>
            Clear all
          </Button>
          <Button onClick={onClose}>Show results</Button>
        </CardFooter>
      </Card>
    </FiltersModal>
  );
};

export default SupportTaskFilters;
