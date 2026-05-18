import {
  Button,
  ButtonAppearance,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { CheckIcon } from 'lucide-react';
import React, { useState } from 'react';
import styled from 'styled-components';

import { ActionStatus, SupportTaskAction } from '../../api/supportTasks';
import { ORANGE_40 } from '../../constants';
import { Card, CardContent, CardFooter, CardHeader } from '../atoms/Card';

// ─── Styled ───────────────────────────────────────────────────────────────────

const HeaderTitle = styled.h3`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: ${ORANGE_40};
  margin: 0 0 2px;
`;

const FooterActions = styled.div`\
  display: flex;
  gap: ${({ theme }) => theme.spacing.xsmall};
  flex-shrink: 0;
`;

const StyledFooter = styled(CardFooter)`
  padding: ${({ theme }) => theme.spacing.medium};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_SUBTITLE: Record<ActionStatus, string> = {
  OPEN: 'Open',
  EXECUTED: 'Executed',
  CANCELLED: 'Cancelled',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface SupportTaskActionCardProps {
  action: SupportTaskAction;
  onResolved?: () => void;
}

export default function SupportTaskActionCard({
  action,
  onResolved,
}: SupportTaskActionCardProps) {
  const [loading, setLoading] = useState<'execute' | 'cancel' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isOpen = action.status === 'OPEN';

  const handle = async (type: 'execute' | 'cancel') => {
    setLoading(type);
    setError(null);
    try {
      // if (type === 'execute') await executeAction(action.task_id);
      // else await cancelAction(action.task_id);
      onResolved?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card center={false}>
      <CardHeader>
        <HeaderTitle>Action - {action.action_type}</HeaderTitle>
        <Text type={TextTypes.Body6} tag="span">
          {STATUS_SUBTITLE[action.status]}
        </Text>
      </CardHeader>

      <CardContent></CardContent>

      <StyledFooter>
        {isOpen && (
          <FooterActions>
            <Button
              appearance={ButtonAppearance.Secondary}
              disabled={loading !== null}
              onClick={() => handle('cancel')}
            >
              Cancel
            </Button>
            <Button
              disabled={loading !== null}
              onClick={() => handle('execute')}
            >
              Execute action <CheckIcon size={14} />
            </Button>
          </FooterActions>
        )}
      </StyledFooter>
    </Card>
  );
}
