import {
  Button,
  ButtonVariations,
  Dropdown,
  Modal,
  MultiCheckbox,
  Switch,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { find, includes, isEmpty, isString, map, some } from 'lodash';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { USER_GROUPS } from '../../constants';
import { useFilterOptions } from '../../store';
import { Card, CardContent, CardFooter, CardHeader } from '../atoms/Card';

const FiltersModal = styled(Modal)`
  z-index: 1000;
`;

interface FiltersProps {
  defaultValues?: any;
  open: boolean;
  onClose: () => void;
  onUpdateFilters: (key: string, val: string) => void;
  onRemoveFilter: (key: string) => void;
}

enum FilterKeys {
  Company = 'state__company',
  EmailAuthenticated = 'state__email_authenticated',
  JobSearch = 'profile__job_search',
  HadPreMatchingCall = 'state__is_onboarded',
  HasPriority = 'state__has_match_priority',
  TargetGroups = 'profile__target_groups',
  UserType = 'profile__user_type',
  UserList = 'list',
}

type FilterOption = {
  key: string;
  value: string;
};

type OnUpdateFilters = (key: string, value: string) => void;
type OnRemoveFilter = (key: string) => void;

const handleFilterSelection = (
  selectedOptions: string[] | null,
  filters: string | Record<string, FilterOption>,
  onUpdateFilters: OnUpdateFilters,
  onRemoveFilter: OnRemoveFilter,
): void => {
  if (!selectedOptions) return;

  if (isString(filters)) {
    isEmpty(selectedOptions)
      ? onRemoveFilter(filters)
      : onUpdateFilters(filters, selectedOptions);
  } else {
    // if multiple filters
    for (const [key, filter] of Object.entries(filters)) {
      if (selectedOptions.some(option => option === filter.key)) {
        onUpdateFilters(filter.key, filter.value);
      } else {
        onRemoveFilter(filter.key);
      }
    }
  }
};

export const containsFilterKey = (filters: Record<string, any>): boolean => {
  return some(filters, (_, key: string) => {
    return includes(FilterKeys, key as FilterKeys);
  });
};

const formatDefaultValues = (defaultValues: any) => {
  const formattedValues = { ...defaultValues, user_journey: [] };
  if (defaultValues[FilterKeys.EmailAuthenticated]) {
    formattedValues.user_journey = [FilterKeys.EmailAuthenticated];
  }
  if (defaultValues[FilterKeys.HadPreMatchingCall]) {
    formattedValues.user_journey = [
      ...formattedValues.user_journey,
      FilterKeys.HadPreMatchingCall,
    ];
  }
  if (defaultValues[FilterKeys.JobSearch]) {
    formattedValues.user_journey = [
      ...formattedValues.user_journey,
      FilterKeys.JobSearch,
    ];
  }

  return formattedValues;
};

const Filters: React.FC<FiltersProps> = ({
  open,
  onClose,
  onUpdateFilters,
  onRemoveFilter,
  defaultValues,
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { filterOptions, isLoading: filtersLoading } = useFilterOptions();
  const companyChoices = find(
    filterOptions?.filters,
    element => element.name === FilterKeys.Company,
  )?.choices;

  const handleReset = () => {
    map(FilterKeys, filter => {
      onRemoveFilter(filter);
    });
  };

  useEffect(() => {
    setFilters(formatDefaultValues(defaultValues));
  }, [defaultValues]);

  return (
    <FiltersModal open={open} onClose={onClose}>
      <Card className="bg-white">
        <CardHeader>
          <Text type={TextTypes.Body2} tag="h2" center>
            Filters
          </Text>
        </CardHeader>
        <CardContent>
          <Dropdown
            key={FilterKeys.UserList + filters[FilterKeys.UserList]}
            label={'User List'}
            value={filters[FilterKeys.UserList]}
            options={
              filterOptions?.lists?.map(({ name, description }: any) => ({
                value: name,
                label: description,
              })) ?? []
            }
            onValueChange={val => onUpdateFilters(FilterKeys.UserList, val)}
            placeholder="Select a user list..."
          />
          <Dropdown
            key={FilterKeys.UserType + filters[FilterKeys.UserType]}
            onValueChange={val => {
              onUpdateFilters(FilterKeys.UserType, val);
            }}
            value={filters[FilterKeys.UserType]}
            label={'User type'}
            placeholder="Select a user type"
            options={[
              { label: 'Learner', value: 'learner' },
              { label: 'Volunteer', value: 'volunteer' },
            ]}
          />

          <Dropdown
            key={FilterKeys.Company + filters[FilterKeys.Company]}
            onValueChange={val => {
              onUpdateFilters(FilterKeys.Company, val);
            }}
            value={filters[FilterKeys.Company]}
            label={'Company'}
            placeholder="Select a company"
            disabled={filtersLoading}
            options={
              isEmpty(companyChoices)
                ? []
                : companyChoices.map(
                    ({ tag, value }: { tag: string; value: string }) => ({
                      label: tag,
                      value: value,
                    }),
                  )
            }
          />

          <Switch
            key={filters[FilterKeys.HasPriority]}
            name={FilterKeys.HasPriority}
            label={'Is Priority User'}
            value={filters[FilterKeys.HasPriority]}
            inputRef={null}
            onCheckedChange={val =>
              onUpdateFilters(FilterKeys.HasPriority, val)
            }
            checked={filters[FilterKeys.HasPriority]}
          />

          <MultiCheckbox
            key={filters.user_journey}
            name="user_journey"
            onSelection={val =>
              handleFilterSelection(
                val,
                [
                  { key: FilterKeys.EmailAuthenticated, value: 'true' },
                  { key: FilterKeys.HadPreMatchingCall, value: 'true' },
                  { key: FilterKeys.JobSearch, value: 'true' },
                ],
                onUpdateFilters,
                onRemoveFilter,
              )
            }
            options={[
              {
                label: 'Email authenticated',
                value: FilterKeys.EmailAuthenticated,
              },
              {
                label: 'Had pre-matching call',
                value: FilterKeys.HadPreMatchingCall,
              },
              {
                label: 'Searching for a job',
                value: FilterKeys.JobSearch,
              },
            ]}
            preSelected={filters.user_journey}
            heading={'User Journey Variables'}
          />

          <MultiCheckbox
            key={filters[FilterKeys.TargetGroups]}
            name={FilterKeys.TargetGroups}
            onSelection={val =>
              handleFilterSelection(
                val,
                FilterKeys.TargetGroups,
                onUpdateFilters,
                onRemoveFilter,
              )
            }
            options={[
              {
                label: 'Student',
                value: USER_GROUPS.student,
              },
              {
                label: 'Refugee',
                value: USER_GROUPS.refugee,
              },
              {
                label: 'Other',
                value: USER_GROUPS.other,
              },
              {
                label: 'Worker',
                value: USER_GROUPS.worker,
              },
            ]}
            preSelected={filters[FilterKeys.TargetGroups]}
            heading={'Groups'}
          />
        </CardContent>
        <CardFooter className="justify-between">
          <Button variation={ButtonVariations.Inline} onClick={handleReset}>
            Clear All
          </Button>
          <Button onClick={onClose}>Show results</Button>
        </CardFooter>
      </Card>
    </FiltersModal>
  );
};

export default Filters;
