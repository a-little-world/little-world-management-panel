import {
  Button,
  ButtonSizes,
  Card,
  CardHeader,
  CardSizes,
  Modal,
  StatusMessage,
  StatusTypes,
  Text,
  TextArea,
} from '@a-little-world/little-world-design-system';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { reactivateMatch } from '../../../api/index';
import { registerInput } from '../../../store';

// Matches REACTIVATION_REASON_MIN_LENGTH in the backend, which enforces it too.
const REASON_MIN_LENGTH = 20;

interface ConfirmReactivateModalProps {
  dialogOpen: boolean;
  onClose: () => void;
  onMatchUpdate: () => void | Promise<unknown>;
  matchId: string;
  user1Name: string;
  user2Name: string;
}

interface ReactivateFormData {
  reason: string;
}

const StyledForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const StyledButton = styled(Button)`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.xsmall};
`;

const ConfirmReactivateModal = ({
  dialogOpen,
  onClose,
  matchId,
  user1Name,
  user2Name,
  onMatchUpdate,
}: ConfirmReactivateModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set once the backend has reactivated the match. Submitting again would only get
  // "match is active" back, so the form stays disabled even if the page refresh fails.
  const [reactivated, setReactivated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReactivateFormData>({
    mode: 'onSubmit',
    defaultValues: {
      reason: '',
    },
  });

  const handleOnClose = () => {
    setError(null);
    setIsSubmitting(false);
    setReactivated(false);
    reset();
    onClose();
  };

  const onSubmit = (data: ReactivateFormData) => {
    if (isSubmitting || reactivated) return;
    setIsSubmitting(true);
    setError(null);

    reactivateMatch({
      id: matchId,
      reason: data.reason.trim(),
      onSuccess: async () => {
        setReactivated(true);
        try {
          await onMatchUpdate();
          handleOnClose();
        } catch {
          // The match is active now; only the refresh failed. Unlock the modal so it can
          // be closed, but keep the form disabled.
          setIsSubmitting(false);
          setError(
            'The match was reactivated, but the page did not refresh. Please reload the page.',
          );
        }
      },
      onError: (e: any) => {
        setIsSubmitting(false);
        setError(
          e?.message ?? 'Issue reactivating. Please refresh and try again.',
        );
      },
    });
  };

  return (
    <Modal
      open={dialogOpen}
      {...(isSubmitting
        ? { locked: true as const }
        : { onClose: handleOnClose })}
    >
      <Card width={CardSizes.Medium}>
        <CardHeader>Reactivate this match?</CardHeader>

        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <Text>
            {user1Name} and {user2Name} will be matched again. The match
            reappears for both of them, with their chat and call room.
          </Text>
          <Text>
            Automatic emails that would go out straight away are skipped; ones
            that come due later are still sent. Your account and the reason are
            saved in the match log.
          </Text>
          <TextArea
            {...registerInput({
              register,
              name: 'reason',
              options: {
                required: 'Please provide a reason for reactivating this match',
                validate: (value: string) =>
                  value.trim().length >= REASON_MIN_LENGTH ||
                  `Reason must be at least ${REASON_MIN_LENGTH} characters long`,
              },
            })}
            placeholder="Why is this match being reactivated?"
            error={errors.reason?.message}
          />
          {error && (
            <StatusMessage type={StatusTypes.Error} visible>
              {error}
            </StatusMessage>
          )}
          <StyledButton
            type="submit"
            size={ButtonSizes.Medium}
            loading={isSubmitting}
            disabled={isSubmitting || reactivated}
          >
            Reactivate match
          </StyledButton>
        </StyledForm>
      </Card>
    </Modal>
  );
};

export default ConfirmReactivateModal;
