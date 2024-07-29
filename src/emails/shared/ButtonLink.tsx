import { Button } from '@react-email/components';
import React from 'react';

import { button } from './styles';

const ButtonLink: React.FC = ({ children }) => (
  <div style={{ width: '100%', textAlign: 'center' }}>
    <Button style={button}>{children}</Button>
  </div>
);

export default ButtonLink;
