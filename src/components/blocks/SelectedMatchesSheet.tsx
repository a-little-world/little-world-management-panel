import { isEmpty, map, size } from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';

import styled from 'styled-components';
import useSelectUser from '../../hooks/useSelectUser';
import { useGlobalState } from '../../store';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetScrollableContent,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import SearchBar from './SearchBar';
import MatchCard from './match/MatchCard';

const SelectedMatches = styled(SheetScrollableContent)`
  gap: ${({ theme }) => theme.spacing.small};
`;

export function SelectedMatchesSheet() {
  const {
    formState: { errors },
  } = useForm();

  const { selectedMatches, deselectMatch } = useGlobalState();
  const { isSubmitting, onSelectUser, error } = useSelectUser();

  return (
    <Sheet>
      {!isEmpty(selectedMatches) && (
        <SheetTrigger>
          {`View Selected Matches (${size(selectedMatches)})`}
        </SheetTrigger>
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Selected Matches</SheetTitle>
          <SheetDescription>
            Review your selected matches here.
          </SheetDescription>
        </SheetHeader>
        <SelectedMatches>
          {map(selectedMatches, match => {
            return (
              <MatchCard
                variant="compact"
                match={match}
                onViewDetails={() => {}}
              />
            );
          })}
        </SelectedMatches>
        <SheetFooter>
          <SearchBar
            name="matchUuid"
            isSubmitting={isSubmitting}
            onSubmit={onSelectUser}
            error={error}
            placeholder="Enter match UUID"
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
