import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SelectBoxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const checkmarkAnimation = keyframes`
  0% {
    background-position-y: 5px;
  }
  50% {
    background-position-y: -2px;
  }
  100% {
    background-position-y: 0;
  }
`;

// Properly encoded SVG checkmark for checkbox
const checkmarkSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z"/></svg>',
);
const checkmarkDataUrl = `data:image/svg+xml,${checkmarkSvg}`;

const StyledSelectBox = styled.input<SelectBoxProps>`
  flex-shrink: 0;
  height: 1.5rem;
  width: 1.5rem;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-width: 1px;
  border-color: ${({ theme }) => theme.color.border.moderate};
  border-radius: 0.5rem;
  margin-left: 0.5rem;
  padding: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  display: inline-block;
  vertical-align: middle;
  background-origin: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  color: ${({ theme }) => theme.color.surface.primary};
  background-color: ${({ theme }) => theme.color.surface.primary};

  &:checked {
    color: ${({ theme }) => theme.color.surface.contrast};
    background-color: ${({ theme }) => theme.color.surface.contrast};
    background-repeat: no-repeat;
    animation: ${checkmarkAnimation} 0.2s ease-in-out;
    background-image: url('${checkmarkDataUrl}');
    border-color: transparent;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
`;

const SelectBox: React.FC<SelectBoxProps> = ({
  checked,
  onChange,
  className,
}) => {
  return (
    <StyledSelectBox
      name="select-box"
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={className}
    />
  );
};

export default SelectBox;
