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
  selectedHeaders: string[];
  setSelectedHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  open: boolean;
  onClose: () => void;
  onSave: (selectedHeaders: string[]) => void;
  availableHeaders?: string[];
  title?: string;
  description?: string;
}

const ALL_AVAILABLE_HEADERS = [...DEFAULT_HEADERS, 'hash', 'id'];

export function DownloadSettingsModal({
  selectedHeaders,
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
        <Text type={TextTypes.Body5}>{description}</Text>

        <div className="flex justify-between items-center mt-2">
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
            Clear All
          </Button>
        </div>

        <CardContent align="flex-start">
          {availableHeaders.map(header => (
            <Checkbox
              key={header}
              id={header}
              checked={selectedHeaders.includes(header)}
              onCheckedChange={() => handleHeaderToggle(header)}
              label={header
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())}
            />
          ))}
        </CardContent>

        <CardFooter align="space-between">
          <Button appearance={ButtonAppearance.Secondary} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedHeaders.length === 0}>
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
}
