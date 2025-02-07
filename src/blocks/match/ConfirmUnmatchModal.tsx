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
} from '@a-little-world/little-world-design-system';
import React, { useState } from 'react';

import { removeMatch } from '../../api/index';

interface ConfirmRemoveMatchDialogProps {
  dialogOpen: boolean;
  onClose: () => void;
  onMatchUpdate: any;
  matchId: string;
  user1Name: string;
  user2Name: string;
}

const ConfirmUnmatchModal = ({
  dialogOpen,
  onClose,
  matchId,
  user1Name,
  user2Name,
  onMatchUpdate,
}: ConfirmRemoveMatchDialogProps) => {
  const [error, setError] = useState<null | string>(null);
  const handleOnClose = () => {
    setError(null);
    onClose();
  };
  return (
    <Modal open={dialogOpen} onClose={handleOnClose}>
      <Card className="items-center justify-center" width={CardSizes.Medium}>
        <CardHeader>Do you want to remove this match?</CardHeader>
        <Text>
          This will permanently unmatch {user1Name} and {user2Name}.
        </Text>
        {error && (
          <StatusMessage $type={MessageTypes.Error} $visible>
            {error}
          </StatusMessage>
        )}
        <Button
          className="mt-6"
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Medium}
          backgroundColor={'red'}
          color={'red'}
          onClick={() => {
            setError(null);
            removeMatch({
              id: matchId,
              onSuccess: () => {
                onMatchUpdate();
                onClose();
              },
              onError: e =>
                setError(
                  e?.message ??
                    'Issue unmatching. Please refresh and try again.',
                ),
            });
          }}
        >
          Remove Match
        </Button>
      </Card>
    </Modal>
  );
};

export default ConfirmUnmatchModal;
