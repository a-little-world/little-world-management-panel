import { Button } from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { isEmpty, map, size } from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import useSelectUser from '../hooks/useSelectUser';
import { useGlobalState } from '../store';
import SearchBar from './SearchBar';
import { SelectedMatchCard } from './match/MatchCard';

const StyledSheetButton = styled(Button)`
  position: fixed;
  left: 0;
`;

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
        <SheetTrigger asChild>
          <StyledSheetButton className="fixed bottom-14 left-2/4 translate-x-2/4">
            View Selected Matches ({size(selectedMatches)})
          </StyledSheetButton>
        </SheetTrigger>
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Selected Matches</SheetTitle>
          <SheetDescription>
            Review your selected matches here.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full overflow-scroll">
          {map(selectedMatches, match => {
            return <SelectedMatchCard match={match} onViewDetails={() => {}} />;
          })}
        </ScrollArea>
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
