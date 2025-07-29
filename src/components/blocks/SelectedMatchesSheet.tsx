import { isEmpty, map, size } from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';

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
import { SelectedMatchCard } from './match/MatchCard';

export function SelectedMatchesSheet() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
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
        <SheetScrollableContent className="h-full overflow-scroll">
          {map(selectedMatches, match => {
            return <SelectedMatchCard match={match} onViewDetails={() => {}} />;
          })}
        </SheetScrollableContent>
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
