import { Button } from '@react-email/components';
import React from 'react';

import { button } from './styles';

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  onDoubleClick?: () => void;
  color?: string;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({ href, children, onDoubleClick, color }) => {
  // Create a custom style by merging the default button style with any color overrides
  const buttonStyle = {
    ...button,
    ...(color && { 
      color: color,
      borderColor: color
    })
  };

  return (
    <div
      style={{ width: '100%', textAlign: 'center' }}
      onDoubleClick={onDoubleClick}
    >
      <Button href={href} style={buttonStyle} target="_blank">
        {children}
      </Button>
    </div>
  );
};

export default ButtonLink;
