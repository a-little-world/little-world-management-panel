import {
  Button,
  ButtonVariations,
  Dropdown,
  Modal,
  MultiCheckbox,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { includes, map, some } from 'lodash';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Card, CardContent, CardFooter, CardHeader } from '../atoms/Card';
import { useFilterOptions } from '../store';

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
  HadPreMatchingCall = 'state__had_prematching_call',
  UserType = 'profile__user_type',
  UserList = 'list',
}

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
  return formattedValues;
};

const Filters: React.FC<FiltersProps> = ({
  open,
  onClose,
  onUpdateFilters,
  onRemoveFilter,
  defaultValues,
}) => {
  const [filters, setFilters] = useState({});
  const { filterOptions: userListOptions, isLoading: filtersLoading } =
    useFilterOptions();

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
            options={userListOptions?.lists.map(({ name, description }) => ({
              value: name,
              label: description,
            }))}
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
            options={[{ label: 'Accenture', value: 'accenture' }]}
          />

          <MultiCheckbox
            key={filters.user_journey}
            name="user_journey"
            onSelection={val => {
              val?.includes(FilterKeys.EmailAuthenticated)
                ? onUpdateFilters(FilterKeys.EmailAuthenticated, 'true')
                : onRemoveFilter(FilterKeys.EmailAuthenticated);
              val?.includes(FilterKeys.HadPreMatchingCall)
                ? onUpdateFilters(FilterKeys.HadPreMatchingCall, 'true')
                : onRemoveFilter(FilterKeys.HadPreMatchingCall);
            }}
            options={[
              {
                label: 'Email authenticated',
                value: FilterKeys.EmailAuthenticated,
              },
              {
                label: 'Had pre-matching call',
                value: FilterKeys.HadPreMatchingCall,
              },
            ]}
            preSelected={filters.user_journey}
            heading={'User Journey Variables'}
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
