// Create a new file: front/apps/admin_panel_frontend/src/blocks/DownloadSettingsModal.tsx
import {
  Button,
  ButtonAppearance,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Checkbox,
  Dropdown,
  Modal,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

export const DEFAULT_HEADERS = [
  'email',
  'profile.first_name',
  'profile.user_type',
  'profile.postal_code',
  'profile.birth_year',
  'profile.gender',
];

interface DownloadSettingsModalProps {
  selectedFormat: ExportDownloadFormat;
  selectedHeaders: string[];
  setSelectedFormat: React.Dispatch<React.SetStateAction<ExportDownloadFormat>>;
  setSelectedHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  open: boolean;
  onClose: () => void;
  onSave: (selectedHeaders: string[]) => void;
  availableHeaders?: string[];
  title?: string;
  description?: string;
}

export type ExportDownloadFormat = 'csv' | 'json';

const ALL_AVAILABLE_HEADERS = [...DEFAULT_HEADERS, 'uuid', 'id'];

const Description = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'p' as const,
})`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  margin-top: ${({ theme }) => theme.spacing.xxxsmall};
`;

const SelectedCount = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const SelectionArea = styled(CardContent).attrs({
  align: 'flex-start' as const,
})`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  max-height: 320px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xsmall};
`;

const HeaderGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.xxxsmall}
    ${({ theme }) => theme.spacing.small};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    grid-template-columns: 1fr;
  }
`;

const ModalFooter = styled(CardFooter)`
  margin-top: ${({ theme }) => theme.spacing.xxxsmall};
`;

const FormatRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const formatHeaderLabel = (header: string) =>
  header
    .split('.')
    .map(part => part.replace(/_/g, ' '))
    .join(' / ')
    .replace(/\b\w/g, char => char.toUpperCase());

export function DownloadSettingsModal({
  selectedFormat,
  selectedHeaders,
  setSelectedFormat,
  setSelectedHeaders,
  open,
  onClose,
  onSave,
  availableHeaders = ALL_AVAILABLE_HEADERS,
  title = 'Download Settings',
  description = 'Select the fields you want to include in the download',
}: DownloadSettingsModalProps) {
  const allSelected =
    availableHeaders.length > 0 &&
    selectedHeaders.length === availableHeaders.length;

  const handleHeaderToggle = (header: string) => {
    setSelectedHeaders(prev =>
      prev.includes(header)
        ? prev.filter(h => h !== header)
        : [...prev, header],
    );
  };

  const handleSave = () => {
    onSave(selectedHeaders);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <CardHeader>{title}</CardHeader>
        <Description>{description}</Description>
        <FormatRow>
          <Dropdown
            id="download_settings_format"
            label="Download format"
            value={selectedFormat}
            options={[
              { value: 'csv', label: 'CSV' },
              { value: 'json', label: 'JSON' },
            ]}
            onValueChange={(value: string) =>
              setSelectedFormat(value as ExportDownloadFormat)
            }
            placeholder="Select format"
            cannotError
            maxWidth="180px"
          />
        </FormatRow>

        <ControlsRow>
          <Checkbox
            id="download_settings_select_all"
            label="Select All"
            checked={allSelected}
            onCheckedChange={checked =>
              setSelectedHeaders(checked ? availableHeaders : [])
            }
            disabled={availableHeaders.length === 0}
          />
          <Button
            appearance={ButtonAppearance.Secondary}
            onClick={() => setSelectedHeaders([])}
            disabled={selectedHeaders.length === 0}
          >
            Deselect All
          </Button>
        </ControlsRow>
        <SelectedCount>
          {selectedHeaders.length} of {availableHeaders.length} fields selected
        </SelectedCount>

        <SelectionArea>
          <HeaderGrid>
            {availableHeaders.map(header => (
              <Checkbox
                key={header}
                id={header}
                checked={selectedHeaders.includes(header)}
                onCheckedChange={() => handleHeaderToggle(header)}
                label={formatHeaderLabel(header)}
              />
            ))}
          </HeaderGrid>
        </SelectionArea>

        <ModalFooter align="space-between">
          <Button appearance={ButtonAppearance.Secondary} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedHeaders.length === 0}>
            Save Settings
          </Button>
        </ModalFooter>
      </Card>
    </Modal>
  );
}
