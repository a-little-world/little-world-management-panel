import {
  Button,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Dropdown,
  Label,
  Modal,
  MultiCheckbox,
  RadioGroup,
  Switch,
} from '@a-little-world/little-world-design-system';
import { find, includes, isEmpty, isString, map, some } from 'lodash';
import React, { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import styled from 'styled-components';

import { USER_GROUPS } from '../../constants';
import { useFilterOptions } from '../../store';
import {
  DateRangePicker,
  formatLocalDateYmd,
  parseYmdToLocalDate,
} from '../atoms/DateRangePicker';

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

const JourneySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const JourneyBooleanRowRoot = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  column-gap: ${({ theme }) => theme.spacing.medium};
  row-gap: ${({ theme }) => theme.spacing.xxsmall};
  width: 100%;
`;

const JourneyRowLabel = styled(Label)`
  flex: 0 0 auto;
  min-width: 11rem;
`;

const JourneyRadiosWrap = styled.div`
  flex: 1 1 auto;
  min-width: 0;

  [role='radiogroup'] {
    flex-direction: row !important;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.small};
    align-items: center;
  }
`;

type OnUpdateFilters = (key: string, value: string) => void;
type OnRemoveFilter = (key: string) => void;

type JourneyTriValue = 'any' | 'true' | 'false';

function journeyParamToTriValue(raw: unknown): JourneyTriValue {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === 'true' || v === true) return 'true';
  if (v === 'false' || v === false) return 'false';
  return 'any';
}

const JourneyBooleanRow: React.FC<{
  label: string;
  filterKey: string;
  rawValue: unknown;
  onUpdateFilters: OnUpdateFilters;
  onRemoveFilter: OnRemoveFilter;
}> = ({ label, filterKey, rawValue, onUpdateFilters, onRemoveFilter }) => {
  const inputRef = React.useRef<HTMLInputElement>(
    null,
  ) as React.RefObject<HTMLInputElement>;
  const value = journeyParamToTriValue(rawValue);
  return (
    <JourneyBooleanRowRoot>
      <JourneyRowLabel bold inline>
        {label}
      </JourneyRowLabel>
      <JourneyRadiosWrap>
        <RadioGroup
          name={filterKey}
          inputRef={inputRef}
          value={value}
          onValueChange={(next: string) => {
            if (next === 'any') onRemoveFilter(filterKey);
            else onUpdateFilters(filterKey, next);
          }}
          items={[
            { id: `${filterKey}-any`, label: 'Any', value: 'any' },
            { id: `${filterKey}-yes`, label: 'Yes', value: 'true' },
            { id: `${filterKey}-no`, label: 'No', value: 'false' },
          ]}
        />
      </JourneyRadiosWrap>
    </JourneyBooleanRowRoot>
  );
};

interface FiltersProps {
  defaultValues?: any;
  /** When false, filters are rendered inline (e.g. users modal passes true). */
  open?: boolean;
  onClose: () => void;
  onUpdateFilters: (key: string, val: string) => void;
  onRemoveFilter: (key: string) => void;
}

enum FilterKeys {
  Company = 'state__company',
  CountryOfResidence = 'profile__country_of_residence',
  EmailAuthenticated = 'state__email_authenticated',
  JobSearch = 'profile__job_search',
  IsOnboarded = 'state__is_onboarded',
  UserFormCompleted = 'state__user_form_completed',
  HasPriority = 'state__has_match_priority',
  TargetGroups = 'profile__target_groups',
  UserType = 'profile__user_type',
  UserList = 'list',
  JoinedBetweenAfter = 'joined_between_after',
  JoinedBetweenBefore = 'joined_between_before',
}

type FilterOption = {
  key: string;
  value: string;
};

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

const Filters: React.FC<FiltersProps> = ({
  open = true,
  onClose,
  onUpdateFilters,
  onRemoveFilter,
  defaultValues,
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [joinedBetweenRange, setJoinedBetweenRange] = useState<
    DateRange | undefined
  >();
  const { filterOptions, isLoading: filtersLoading } = useFilterOptions();
  const companyChoices = find(
    filterOptions?.filters,
    element => element.name === FilterKeys.Company,
  )?.choices;

  const countryChoices = find(
    filterOptions?.filters,
    element => element.name === FilterKeys.CountryOfResidence,
  )?.choices;

  const handleReset = () => {
    map(FilterKeys, filter => {
      onRemoveFilter(filter);
    });
  };

  useEffect(() => {
    setFilters({ ...(defaultValues ?? {}) });
  }, [defaultValues]);

  // Joined-between uses local range state while the user is mid-selection (from without to); the URL
  // only updates once both bounds exist. Re-sync from defaultValues (URL) when the modal opens so we
  // show applied filters, and when defaultValues change while open so the picker matches the query string.
  useEffect(() => {
    if (!open) return;
    const after = defaultValues?.[FilterKeys.JoinedBetweenAfter];
    const before = defaultValues?.[FilterKeys.JoinedBetweenBefore];
    if (typeof after === 'string' && typeof before === 'string') {
      setJoinedBetweenRange({
        from: parseYmdToLocalDate(after),
        to: parseYmdToLocalDate(before),
      });
    } else {
      setJoinedBetweenRange(undefined);
    }
  }, [open, defaultValues]);

  const handleJoinedBetweenChange = (next: DateRange | undefined) => {
    setJoinedBetweenRange(next);
    if (next?.from && next?.to) {
      onUpdateFilters(
        FilterKeys.JoinedBetweenAfter,
        formatLocalDateYmd(next.from),
      );
      onUpdateFilters(
        FilterKeys.JoinedBetweenBefore,
        formatLocalDateYmd(next.to),
      );
    } else if (!next?.from && !next?.to) {
      onRemoveFilter(FilterKeys.JoinedBetweenAfter);
      onRemoveFilter(FilterKeys.JoinedBetweenBefore);
    }
  };

  return (
    <FiltersModal open={open} onClose={onClose}>
      <Card width={CardSizes.Large}>
        <CardHeader>Filters</CardHeader>
        <CardContent align="flex-start">
          <DropdownRow>
            <DropdownItem>
              <Label bold>Joined between</Label>
              <DateRangePicker
                range={joinedBetweenRange}
                setRange={handleJoinedBetweenChange}
                inModal
                numberOfMonths={1}
              />
            </DropdownItem>
          </DropdownRow>

          <DropdownRow>
            <DropdownItem>
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
            </DropdownItem>
            <DropdownItem>
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
            </DropdownItem>
          </DropdownRow>

          <DropdownRow>
            <DropdownItem>
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
            </DropdownItem>

            <DropdownItem>
              <Dropdown
                key={
                  FilterKeys.CountryOfResidence +
                  filters[FilterKeys.CountryOfResidence]
                }
                onValueChange={val => {
                  onUpdateFilters(FilterKeys.CountryOfResidence, val);
                }}
                value={filters[FilterKeys.CountryOfResidence]}
                label={'Residence'}
                placeholder="Select a country"
                disabled={filtersLoading}
                options={
                  isEmpty(countryChoices)
                    ? []
                    : countryChoices.map(
                        ({ tag, value }: { tag: string; value: string }) => ({
                          label: tag,
                          value: value,
                        }),
                      )
                }
              />
            </DropdownItem>
          </DropdownRow>

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

          <JourneySection>
            <Label bold>User journey variables</Label>
            <JourneyBooleanRow
              label="Email authenticated"
              filterKey={FilterKeys.EmailAuthenticated}
              rawValue={filters[FilterKeys.EmailAuthenticated]}
              onUpdateFilters={onUpdateFilters}
              onRemoveFilter={onRemoveFilter}
            />
            <JourneyBooleanRow
              label="User form completed"
              filterKey={FilterKeys.UserFormCompleted}
              rawValue={filters[FilterKeys.UserFormCompleted]}
              onUpdateFilters={onUpdateFilters}
              onRemoveFilter={onRemoveFilter}
            />
            <JourneyBooleanRow
              label="Is onboarded"
              filterKey={FilterKeys.IsOnboarded}
              rawValue={filters[FilterKeys.IsOnboarded]}
              onUpdateFilters={onUpdateFilters}
              onRemoveFilter={onRemoveFilter}
            />
            <JourneyBooleanRow
              label="Searching for a job"
              filterKey={FilterKeys.JobSearch}
              rawValue={filters[FilterKeys.JobSearch]}
              onUpdateFilters={onUpdateFilters}
              onRemoveFilter={onRemoveFilter}
            />
          </JourneySection>

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
        <CardFooter align="space-between">
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
