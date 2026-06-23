import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Tag,
  TagAppearance,
  TagSizes,
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
  getActionTypeConfig,
} from '../../api/supportTasks';
import { ORANGE_40 } from '../../constants';
import { Card, CardContent, CardHeader } from '../atoms/Card';
import ChangeCountryOfResidenceAction from './supportTaskActions/ChangeCountryOfResidenceAction';

// ─── Styled ───────────────────────────────────────────────────────────────────

const ActionCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const HeaderTitle = styled.h3`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: ${ORANGE_40};
  margin: 0;
`;

const CompactHeader = styled(CardHeader)`
  padding: ${({ theme }) => theme.spacing.small};
`;

const CompactContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing.small};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const ErrorText = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'p' as const,
})`
  margin: 0;
  color: ${({ theme }) => theme.color.text.error};
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
  const actionTypeCfg = getActionTypeConfig(action.action_type);

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
  const customContent = renderContent();

  return (
    <ActionCard center={false}>
      <CompactHeader>
        <HeaderRow>
          <HeaderMeta>
            <HeaderTitle>Action - {action.action_type}</HeaderTitle>
            <Tag
              size={TagSizes.small}
              appearance={TagAppearance.outline}
              color={actionTypeCfg.color}
            >
              {actionTypeCfg.label}
            </Tag>
            <Tag size={TagSizes.small}>{STATUS_SUBTITLE[action.status]}</Tag>
          </HeaderMeta>
          {isOpen && (
            <HeaderActions>
              <Button
                appearance={ButtonAppearance.Secondary}
                size={ButtonSizes.Small}
                disabled={loading !== null}
                onClick={() => handle('cancel')}
              >
                Cancel
              </Button>
              <Button
                size={ButtonSizes.Small}
                disabled={loading !== null}
                onClick={() => handle('execute')}
              >
                Execute <CheckIcon size={14} />
              </Button>
            </HeaderActions>
          )}
        </HeaderRow>
      </CompactHeader>

      {(error || customContent) && (
        <CompactContent>
          {error && <ErrorText>{error}</ErrorText>}
          {customContent}
        </CompactContent>
      )}
    </ActionCard>
  );
}
