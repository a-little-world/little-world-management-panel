import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardHeader,
  CardSizes,
  MessageTypes,
  Modal,
  StatusMessage,
  Text,
  TextArea,
} from '@a-little-world/little-world-design-system';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { removeMatch } from '../../../api/index';
import { registerInput } from '../../../store';

interface ConfirmRemoveMatchDialogProps {
  dialogOpen: boolean;
  onClose: () => void;
  onMatchUpdate: () => void;
  matchId: string;
  user1Name: string;
  user2Name: string;
}

interface UnmatchFormData {
  reason: string;
}

const StyledForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledTextArea = styled(TextArea)`
  width: 100%;
  margin ${({ theme }) => theme.spacing.small} 0;
`;

const StyledButton = styled(Button)`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.medium};
`;

const ConfirmUnmatchModal = ({
  dialogOpen,
  onClose,
  matchId,
  user1Name,
  user2Name,
  onMatchUpdate,
}: ConfirmRemoveMatchDialogProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UnmatchFormData>({
    mode: 'onSubmit',
    defaultValues: {
      reason: '',
    },
  });

  const handleOnClose = () => {
    setError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: UnmatchFormData) => {
    setIsSubmitting(true);
    setError(null);

    removeMatch({
      id: matchId,
      reason: data.reason,
      onSuccess: () => {
        setIsSubmitting(false);
        onMatchUpdate();
        handleOnClose();
      },
      onError: (e: any) => {
        setIsSubmitting(false);
        setError(
          e?.message ?? 'Issue unmatching. Please refresh and try again.',
        );
      },
    });
  };

  return (
    <Modal open={dialogOpen} onClose={handleOnClose}>
      <Card width={CardSizes.Medium}>
        <CardHeader>Do you want to remove this match?</CardHeader>

        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <Text>
            This will permanently unmatch {user1Name} and {user2Name}.
          </Text>
          <StyledTextArea
            {...registerInput({
              register,
              name: 'reason',
              options: {
                required: 'Please provide a reason for unmatching these users',
                minLength: {
                  value: 20,
                  message: 'Reason must be at least 20 characters long',
                },
              },
            })}
            placeholder="Please provide a reason for unmatching these users"
            error={errors.reason?.message}
          />
          {error && (
            <StatusMessage $type={MessageTypes.Error} $visible>
              {error}
            </StatusMessage>
          )}
          <StyledButton
            type="submit"
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Medium}
            backgroundColor={'red'}
            disabled={isSubmitting}
            color={'red'}
          >
            {isSubmitting ? 'Removing Match...' : 'Remove Match'}
          </StyledButton>
        </StyledForm>
      </Card>
    </Modal>
  );
};

export default ConfirmUnmatchModal;
