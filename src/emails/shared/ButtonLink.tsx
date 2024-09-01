import { Button } from '@react-email/components';
import React from 'react';

import { button } from './styles';

const ButtonLink: React.FC = ({ href, children, onDoubleClick }) => (
  <div
    style={{ width: '100%', textAlign: 'center' }}
    onDoubleClick={onDoubleClick}
  >
    <Button href={href} style={button} target="_blank">
      {children}
    </Button>
  </div>
);

export default ButtonLink;
