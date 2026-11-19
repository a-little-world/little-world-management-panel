import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Checkbox,
  Separator,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { setMatchCompletedOffplattform } from '../../../api';
import { MATCH_STATUS } from '../../../constants';
import ConfirmReactivateModal from './ConfirmReactivateModal';
import ConfirmUnmatchModal from './ConfirmUnmatchModal';

const ActionsStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  max-width: 36rem;
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.small};
`;

const StatusForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

const SectionHeading = styled(Text).attrs({
  type: TextTypes.Heading6,
  tag: 'h3' as const,
})`
  margin: 0;
`;

const SectionHint = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'p' as const,
})`
  margin: 0;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ActionButton = styled(Button)`
  width: 320px;
  max-width: 100%;
`;

const UnmatchButton = styled(ActionButton).attrs(({ theme }) => ({
  appearance: ButtonAppearance.Primary,
  size: ButtonSizes.Large,
  backgroundColor: theme.color.surface.reject,
}))``;

const MatchActions = ({
  match,
  onUpdate,
}: {
  match: any;
  onUpdate: () => void | Promise<unknown>;
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
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
      <SectionBlock>
        <SectionHeading>Status</SectionHeading>
        <StatusForm onSubmit={handleSubmit(saveChanges)}>
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
          <StatusMessage
            visible={!!errors?.completed_off_plattform || showSuccessMessage}
            type={showSuccessMessage ? StatusTypes.Success : StatusTypes.Error}
          >
            {String(
              errors?.completed_off_plattform?.message ||
                '✅ Changes successfully updated!',
            )}
          </StatusMessage>
          <ActionButton type="submit" disabled={isEmpty(dirtyFields)}>
            Save Changes
          </ActionButton>
        </StatusForm>
      </SectionBlock>
      {!isProposed && (
        <>
          <Separator />
          <SectionBlock>
            <SectionHeading>
              {match.active ? 'End the match' : 'Restore the match'}
            </SectionHeading>
            <SectionHint>
              {match.active
                ? 'Unmatching closes the match for both people.'
                : 'Reactivating opens the match again and restores the call room.'}
            </SectionHint>
            {match.active ? (
              <UnmatchButton onClick={() => setDialogOpen(true)}>
                Unmatch
              </UnmatchButton>
            ) : (
              <ActionButton
                size={ButtonSizes.Large}
                onClick={() => setReactivateOpen(true)}
              >
                Reactivate match
              </ActionButton>
            )}
          </SectionBlock>
        </>
      )}
      <ConfirmReactivateModal
        dialogOpen={reactivateOpen}
        onClose={() => setReactivateOpen(false)}
        onMatchUpdate={onUpdate}
        matchId={match.uuid}
        user1Name={match.user1.profile.first_name}
        user2Name={match.user2.profile.first_name}
      />
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
