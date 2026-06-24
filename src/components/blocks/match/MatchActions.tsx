import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Checkbox,
  StatusMessage,
  StatusTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { setMatchCompletedOffplattform } from '../../../api';
import { MATCH_STATUS } from '../../../constants';
import ConfirmUnmatchModal from './ConfirmUnmatchModal';

const StyledStatusMessage = styled(StatusMessage)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const ActionsStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const UnmatchButton = styled(Button)`
  width: 320px;
  max-width: 100%;
`;

const MatchActions = ({
  match,
  onUpdate,
}: {
  match: any;
  onUpdate: () => void;
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isProposed = match.status === MATCH_STATUS.proposed;

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, errors },
    setError,
    reset,
  } = useForm({
    defaultValues: {
      completed_off_plattform: match.completed_off_plattform,
    },
  });

  const saveChanges = (data: any) => {
    if (isEmpty(dirtyFields)) return;
    setShowSuccessMessage(false);

    // Assume setMatchCompletedOffplattform is a function to update the match status
    setMatchCompletedOffplattform({
      matchId: match.uuid,
      completed_off_plattform: data.completed_off_plattform,
      onError: (error: any) => {
        setError('completed_off_plattform', error.message);
        setShowSuccessMessage(false);
      },
      onSuccess: () => {
        setShowSuccessMessage(true);
        onUpdate();
        reset(data); // Reset form to reflect the saved state
      },
    });
  };

  return (
    <ActionsStack>
      <form onSubmit={handleSubmit(saveChanges)}>
        <Controller
          name="completed_off_plattform"
          control={control}
          render={({
            field: { onChange, onBlur, value, name, ref },
            fieldState: { error },
          }) => (
            <Checkbox
              id="completed_off_plattform"
              name={name}
              inputRef={ref as unknown as React.RefObject<HTMLButtonElement>}
              onCheckedChange={val => onChange({ target: { value: val } })}
              onBlur={onBlur}
              value={value}
              defaultChecked={value}
              error={error?.message}
              label="Match completed off-platform"
            />
          )}
        />
        <StyledStatusMessage
          visible={!!errors?.completed_off_plattform || showSuccessMessage}
          type={showSuccessMessage ? StatusTypes.Success : StatusTypes.Error}
        >
          {String(
            errors?.completed_off_plattform?.message ||
              '✅ Changes successfully updated!',
          )}
        </StyledStatusMessage>
        <Button type="submit" disabled={isEmpty(dirtyFields)}>
          Save Changes
        </Button>
      </form>
      {!isProposed && match.active && (
        <UnmatchButton
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Large}
          color={'#faf4f4'}
          backgroundColor={'red'}
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Unmatch
        </UnmatchButton>
      )}
      <ConfirmUnmatchModal
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onMatchUpdate={onUpdate}
        matchId={match.uuid}
        user1Name={match.user1.profile.first_name}
        user2Name={match.user2.profile.first_name}
      />
    </ActionsStack>
  );
};

export default MatchActions;
