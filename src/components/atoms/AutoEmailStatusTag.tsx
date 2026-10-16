import {
  Tag,
  TagAppearance,
  TagSizes,
} from '@a-little-world/little-world-design-system';
import React from 'react';

import { AMBER_40, GRAY_40 } from '../../constants';

export type AutoEmailStatus =
  | 'live'
  | 'emulated'
  | 'off'
  | 'always_on'
  | 'unused';

export interface AutoEmailStatusTagProps {
  status: AutoEmailStatus;
}

const AutoEmailStatusTag = ({ status }: AutoEmailStatusTagProps) => {
  if (status === 'off') {
    return (
      <Tag appearance={TagAppearance.error} size={TagSizes.small}>
        Off
      </Tag>
    );
  }

  if (status === 'emulated') {
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

  if (status === 'unused') {
    return (
      <Tag
        appearance={TagAppearance.outline}
        color={GRAY_40}
        size={TagSizes.small}
      >
        Unused
      </Tag>
    );
  }

  return (
    <Tag appearance={TagAppearance.success} size={TagSizes.small}>
      {status === 'always_on' ? 'Always on' : 'Live'}
    </Tag>
  );
};

export default AutoEmailStatusTag;
