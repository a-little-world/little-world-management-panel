import React, {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useRef,
  useState,
} from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    updateText(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      inputRef?.current?.blur();
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
          ref={inputRef}
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
