import { CheckboxGrid, Text } from '@a-little-world/little-world-design-system';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AvailabilityGrid } from './UserCard.styles';

const COLUMN_KEYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'] as const;
const SLOTS = [
  '08_10',
  '10_12',
  '12_14',
  '14_16',
  '16_18',
  '18_20',
  '20_22',
] as const;

type Availability = Record<string, string[]>;

const buildCheckboxesByColumn = (t: TFunction) =>
  COLUMN_KEYS.map(key =>
    SLOTS.map((value, rowIndex) => ({
      name: t(`availability.row${rowIndex + 1}`),
      value,
      key,
    })),
  );

interface UserAvailabilityProps {
  availability?: Availability | null;
}

const UserAvailability: React.FC<UserAvailabilityProps> = ({ availability }) => {
  const { t } = useTranslation();

  if (!availability) {
    return <Text tag="span">No availability set</Text>;
  }

  return (
    <AvailabilityGrid>
      <CheckboxGrid
        name="availability"
        readOnly
        columnHeadings={Array.from({ length: 8 }, (_, index) =>
          t(`availability.column${index + 1}`),
        )}
        rowHeadings={SLOTS.map((_, index) => t(`availability.row${index + 1}`))}
        checkboxesByColumn={buildCheckboxesByColumn(t)}
        preSelected={availability}
        onSelection={() => undefined}
        legendText={t('availability.legend_text')}
      />
    </AvailabilityGrid>
  );
};

export default UserAvailability;
