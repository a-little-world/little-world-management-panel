// Create a new file: front/apps/admin_panel_frontend/src/blocks/DownloadSettingsModal.tsx
import {
  Button,
  ButtonAppearance,
  Card,
  CardSizes,
  Checkbox,
  Modal,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';

export const DEFAULT_HEADERS = [
  'email',
  'profile.first_name',
  'profile.user_type',
  'profile.postal_code',
  'profile.birth_year',
  'profile.gender',
];

interface DownloadSettingsModalProps {
  selectedHeaders: any;
  setSelectedHeaders: (selectedHeaders: any) => void;
  open: boolean;
  onClose: () => void;
  onSave: (selectedHeaders: any) => void;
}

const ALL_AVAILABLE_HEADERS = [...DEFAULT_HEADERS, 'hash', 'id'];

export function DownloadSettingsModal({
  selectedHeaders,
  setSelectedHeaders,
  open,
  onClose,
  onSave,
}: DownloadSettingsModalProps) {
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
        <div className="space-y-4 p-4">
          <Text type={TextTypes.Body3} bold>
            Download Settings
          </Text>
          <Text type={TextTypes.Body5}>
            Select the fields you want to include in the download
          </Text>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ALL_AVAILABLE_HEADERS.map(header => (
              <div key={header} className="flex items-center gap-2">
                <Checkbox
                  id={header}
                  checked={selectedHeaders.includes(header)}
                  onCheckedChange={() => handleHeaderToggle(header)}
                  label={header
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button appearance={ButtonAppearance.Secondary} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedHeaders.length === 0}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </Modal>
  );
}
