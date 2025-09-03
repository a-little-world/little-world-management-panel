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
    background-image: url(data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27white%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e);
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
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={className}
    />
  );
};

export default SelectBox;
