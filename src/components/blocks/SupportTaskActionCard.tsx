import {
  Button,
  ButtonAppearance,
  Tag,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { CheckIcon } from 'lucide-react';
import React, { useState } from 'react';
import styled from 'styled-components';

import {
  ActionStatus,
  SupportTaskAction,
  cancelAction,
  executeAction,
} from '../../api/supportTasks';
import { ORANGE_40 } from '../../constants';
import { Card, CardContent, CardFooter, CardHeader } from '../atoms/Card';
import ChangeCountryOfResidenceAction from './supportTaskActions/ChangeCountryOfResidenceAction';

// ─── Styled ───────────────────────────────────────────────────────────────────

const HeaderTitle = styled.h3`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: ${ORANGE_40};
  margin: 0 0 2px;
`;

const FooterActions = styled.div`
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

// ─── SupportTaskActionCard ────────────────────────────────────────────────────

interface SupportTaskActionCardProps {
  action: SupportTaskAction;
  taskId: number;
  onResolved?: () => void;
}

export default function SupportTaskActionCard({
  action,
  taskId,
  onResolved,
}: SupportTaskActionCardProps) {
  const [loading, setLoading] = useState<'execute' | 'cancel' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isOpen = action.status === 'OPEN';

  const handle = async (type: 'execute' | 'cancel') => {
    setLoading(type);
    setError(null);
    try {
      if (type === 'execute') await executeAction(taskId);
      else await cancelAction(taskId);
      onResolved?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  function renderContent() {
    switch (action.action_type) {
      case 'profile_change_action_country_of_residence':
        return (
          <ChangeCountryOfResidenceAction
            currentCode={String(action.static_parameters.current_value ?? '')}
            newCode={String(action.parameters.new_value ?? '')}
            taskId={taskId}
            isEditable={isOpen}
            onChanged={onResolved ?? (() => {})}
          />
        );
      default:
        return null;
    }
  }

  return (
    <Card center={false}>
      <CardHeader>
        <HeaderTitle>Action - {action.action_type}</HeaderTitle>
        <Tag>{STATUS_SUBTITLE[action.status]}</Tag>
      </CardHeader>

      <CardContent>{renderContent()}</CardContent>

      <StyledFooter>
        {error && (
          <Text type={TextTypes.Body6} tag="span">
            {error}
          </Text>
        )}
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
