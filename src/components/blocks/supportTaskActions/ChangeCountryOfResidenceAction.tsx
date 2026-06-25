import {
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ArrowRightIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { patchAction } from '../../../api/supportTasks';
import { ORANGE_40 } from '../../../constants';
import { useGlobalState } from '../../../store';

// ─── Styled ───────────────────────────────────────────────────────────────────

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  align-items: stretch;
`;

const CountryPanel = styled.div<{ $editable?: boolean }>`
  background: ${({ $editable, theme }) =>
    $editable ? theme.color.surface.primary : theme.color.surface.secondary};
  border: 2px solid
    ${({ $editable }) => ($editable ? ORANGE_40 : 'transparent')};
  border-radius: ${({ theme }) => theme.radius.large};
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const PanelTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const PanelLabelEditable = styled(PanelLabel)`
  color: ${ORANGE_40};
`;

const FlagText = styled.span`
  font-size: 52px;
  line-height: 1;
`;

const CountryName = styled.h4`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: ${ORANGE_40};
  margin: 0;
`;

const ArrowWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFlag(code: string): string {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 0x1f1a5))
    .join('');
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface ChangeCountryOfResidenceActionProps {
  currentCode: string;
  newCode: string;
  taskId: number;
  isEditable: boolean;
  onChanged: () => void;
}

export default function ChangeCountryOfResidenceAction({
  currentCode,
  newCode,
  taskId,
  isEditable,
  onChanged,
}: ChangeCountryOfResidenceActionProps) {
  const [saving, setSaving] = useState(false);
  const { apiOptions } = useGlobalState();
  const { t } = useTranslation();

  const countryOptions: { value: string; label: string }[] = (
    (apiOptions as any)?.profile?.country_of_residence ?? []
  ).map(({ value, tag }: { value: string; tag: string }) => ({
    value,
    label: t(tag),
  }));

  const getCountryName = (code: string) =>
    countryOptions.find(o => o.value === code)?.label ?? code;

  const handleChange = async (code: string) => {
    setSaving(true);
    try {
      await patchAction(taskId, { new_value: code });
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ComparisonGrid>
      <CountryPanel>
        <PanelTopRow>
          <PanelLabel>Current country</PanelLabel>
        </PanelTopRow>
        <FlagText>{getFlag(currentCode)}</FlagText>
        <CountryName>
          {getCountryName(currentCode)} ({currentCode})
        </CountryName>
      </CountryPanel>

      <ArrowWrapper>
        <ArrowRightIcon size={20} />
      </ArrowWrapper>

      <CountryPanel $editable>
        <PanelTopRow>
          <PanelLabelEditable>New country</PanelLabelEditable>
        </PanelTopRow>
        <FlagText>{getFlag(newCode)}</FlagText>
        <CountryName>
          {getCountryName(newCode)} ({newCode})
        </CountryName>
        {isEditable && (
          <Select
            value={newCode}
            options={countryOptions}
            onValueChange={handleChange}
            placeholder="Change country"
            cannotError
            disabled={saving}
          />
        )}
      </CountryPanel>
    </ComparisonGrid>
  );
}
