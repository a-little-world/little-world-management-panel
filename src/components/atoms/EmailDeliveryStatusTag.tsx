import {
  Tag,
  TagAppearance,
  TagSizes,
} from '@a-little-world/little-world-design-system';
import React from 'react';

import { AMBER_40 } from '../../constants';

export type EmailDeliveryStatus = 'sent' | 'emulated' | 'failed';

export interface EmailDeliveryStatusTagProps {
  status: EmailDeliveryStatus;
}

const EmailDeliveryStatusTag = ({ status }: EmailDeliveryStatusTagProps) => {
  if (status === 'failed') {
    return (
      <Tag appearance={TagAppearance.error} size={TagSizes.small}>
        Failed
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

  return (
    <Tag appearance={TagAppearance.success} size={TagSizes.small}>
      Sent
    </Tag>
  );
};

export default EmailDeliveryStatusTag;
