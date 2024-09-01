import React, { ChangeEvent, FocusEvent, KeyboardEvent, useState } from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  width: 100%;
  border: none;
  border-radius: ${({ theme }) => theme.radius.small};
  font-size: inherit;
  font-weight: inherit;
`;

const EditableText: React.FC = ({
  Component,
  componentProps,
  defaultText,
  updateText,
}: {
  defaultText: string;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [text, setText] = useState<string>(defaultText);

  const handleDoubleClick = () => {
    console.log('onDoubleClick');
    setIsEditing(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    console.log('handleBlur');
    setIsEditing(false);
    updateText(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <Component
      {...(isEditing ? { as: 'div' } : componentProps)}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <StyledInput
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        text
      )}
    </Component>
  );
};

export default EditableText;
