import React from 'react';
import ButtonLink from './ButtonLink';

interface TwoButtonsProps {
  leftHref: string;
  rightHref: string;
  leftChildren: React.ReactNode;
  rightChildren: React.ReactNode;
  onLeftDoubleClick?: () => void;
  onRightDoubleClick?: () => void;
}

const TwoButtons: React.FC<TwoButtonsProps> = ({
  leftHref,
  rightHref,
  leftChildren,
  rightChildren,
  onLeftDoubleClick,
  onRightDoubleClick,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%' }}>
      <div style={{ flex: 1, maxWidth: '250px' }}>
        <ButtonLink href={leftHref} onDoubleClick={onLeftDoubleClick}>
          {leftChildren}
        </ButtonLink>
      </div>
      <div style={{ flex: 1, maxWidth: '250px' }}>
        <ButtonLink href={rightHref} onDoubleClick={onRightDoubleClick}>
          {rightChildren}
        </ButtonLink>
      </div>
    </div>
  );
};

export default TwoButtons;
