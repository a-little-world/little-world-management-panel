import {
  Tag,
  TagAppearance,
  TagSizes,
} from '@a-little-world/little-world-design-system';
import React from 'react';

import { AMBER_40 } from '../../constants';

export interface AutoEmailStatusTagProps {
  enabled: boolean;
  emulated: boolean;
}

const AutoEmailStatusTag = ({ enabled, emulated }: AutoEmailStatusTagProps) => {
  if (!enabled) {
    return (
      <Tag appearance={TagAppearance.error} size={TagSizes.small}>
        Off
      </Tag>
    );
  }

  if (emulated) {
    return (
      <Tag
        appearance={TagAppearance.outline}
        color={AMBER_40}
        size={TagSizes.small}
      >
        Emulated
      </Tag>
    );
  }

  return (
    <Tag appearance={TagAppearance.success} size={TagSizes.small}>
      Live
    </Tag>
  );
};

export default AutoEmailStatusTag;
