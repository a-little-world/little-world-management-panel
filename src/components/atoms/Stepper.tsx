import React from 'react';
import styled from 'styled-components';

import { Text } from '@a-little-world/little-world-design-system';

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  isCompleted: boolean;
  Icon?: React.ComponentType<{ className?: string }>;
}

interface StepperProps {
  steps: StepperStep[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
}

const StepperContainer = styled.div<{
  $orientation: 'horizontal' | 'vertical';
}>`
  display: flex;
  flex-direction: ${({ $orientation }) =>
    $orientation === 'vertical' ? 'column' : 'row'};
  width: 100%;
`;

const StepItem = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean;
  $orientation: 'horizontal' | 'vertical';
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: ${({ $orientation }) =>
    $orientation === 'vertical' ? 'flex-start' : 'center'};
  flex: ${({ $orientation }) => ($orientation === 'vertical' ? 'none' : '1')};
  position: relative;
  gap: ${({ theme }) => theme.spacing.small};

  ${({ $orientation, $size, theme }) => {
    const sizes = {
      small: { stepSize: theme.spacing.small, fontSize: '1rem' },
      medium: { stepSize: theme.spacing.medium, fontSize: '1.25rem' },
      large: { stepSize: theme.spacing.large, fontSize: '1.5rem' },
    };
    const currentSize = sizes[$size];

    return `
      min-height: ${$orientation === 'vertical' ? 'auto' : currentSize.stepSize};
      font-size: ${currentSize.fontSize};
    `;
  }}
`;

const StepCircleContainer = styled.div<{
  $orientation: 'horizontal' | 'vertical';
}>`
  display: flex;
  flex-direction: ${({ $orientation }) =>
    $orientation === 'vertical' ? 'column' : 'row'};
  align-items: center;
  flex-shrink: 0;
`;

const StepCircle = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.half};
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${({ $size }) => {
    const sizes = {
      small: { width: '24px', height: '24px' },
      medium: { width: '32px', height: '32px' },
      large: { width: '40px', height: '40px' },
    };
    const currentSize = sizes[$size];

    return `
      width: ${currentSize.width};
      height: ${currentSize.height};
    `;
  }}

  ${({ $isCompleted, $isActive, theme }) => {
    if ($isCompleted) {
      return `
        background-color: ${theme.color.surface.success};
        color: ${theme.color.text.success};
        border: 2px solid ${theme.color.border.success};
      `;
    } else if ($isActive) {
      return `
        background-color: ${theme.color.surface.primary};
        color: ${theme.color.text.secondary};
        border: 2px solid ${theme.color.border.success};
      `;
    } else {
      return `
        background-color: ${theme.color.surface.secondary};
        color: ${theme.color.text.secondary};
        border: 2px solid ${theme.color.border.moderate};
      `;
    }
  }}
`;

const StepContent = styled.div<{ $orientation: 'horizontal' | 'vertical' }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  ${({ $orientation }) =>
    $orientation === 'horizontal' &&
    `
    text-align: center;
  `}
`;

const StepLabel = styled(Text)<{
  $isCompleted: boolean;
  $isActive: boolean;
  $size: 'small' | 'medium' | 'large';
  $hasDescription: boolean;
}>`
  margin-top: ${({ $hasDescription, theme }) =>
    $hasDescription ? '0' : theme.spacing.xxxsmall};
  font-weight: ${({ $isActive }) => ($isActive ? 'bold' : 'normal')};
  line-height: ${({ $hasDescription }) => ($hasDescription ? '1' : '1.25')};
  color: ${({ $isCompleted, $isActive, theme }) => {
    if ($isCompleted) return theme.color.text.primary;
    if ($isActive) return theme.color.text.primary;
    return theme.color.text.secondary;
  }};
`;

const StepDescription = styled(Text)<{ $size: 'small' | 'medium' | 'large' }>`
  font-weight: normal;
  font-size: ${({ $size }) => {
    const sizes = {
      small: '0.875rem',
      medium: '0.875rem',
      large: '1rem',
    };
    return sizes[$size];
  }};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const StepConnector = styled.div<{
  $isCompleted: boolean;
  $orientation: 'horizontal' | 'vertical';
  $size: 'small' | 'medium' | 'large';
}>`
  ${({ $orientation, $size, theme }) => {
    const sizes = {
      small: { width: '2px', height: '16px' },
      medium: { width: '2px', height: '20px' },
      large: { width: '3px', height: '24px' },
    };
    const currentSize = sizes[$size];

    if ($orientation === 'vertical') {
      return `
        width: ${currentSize.width};
        height: ${currentSize.height};
      `;
    } else {
      return `
        width: 100%;
        height: ${currentSize.width};
      `;
    }
  }}

  background-color: ${({ $isCompleted, theme }) =>
    $isCompleted ? theme.color.border.success : theme.color.border.moderate};
  transition: background-color 0.2s ease;
`;

const CheckIcon = styled.svg`
  width: 12px;
  height: 12px;
  fill: currentColor;
`;

const DashIcon = styled.svg`
  width: 12px;
  height: 12px;
  fill: currentColor;
`;

const Stepper: React.FC<StepperProps> = ({
  steps,
  orientation = 'vertical',
  size = 'medium',
}) => {
  // Calculate which step should be active (the step after the last completed step)
  const getActiveStepIndex = () => {
    const lastCompletedIndex = steps.findIndex(step => !step.isCompleted);
    return lastCompletedIndex === -1 ? steps.length - 1 : lastCompletedIndex;
  };

  const activeStepIndex = getActiveStepIndex();

  return (
    <StepperContainer $orientation={orientation}>
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex;

        return (
          <StepItem
            key={step.id}
            $isCompleted={step.isCompleted}
            $isActive={isActive}
            $orientation={orientation}
            $size={size}
          >
            <StepCircleContainer $orientation={orientation}>
              <StepCircle
                $isCompleted={step.isCompleted}
                $isActive={isActive}
                $size={size}
              >
                {step.isCompleted ? (
                  <CheckIcon viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </CheckIcon>
                ) : step.Icon ? (
                  <step.Icon />
                ) : (
                  <DashIcon viewBox="0 0 20 20">
                    <path
                      d="M4 10h12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </DashIcon>
                )}
              </StepCircle>
              {index < steps.length - 1 && (
                <StepConnector
                  $isCompleted={step.isCompleted}
                  $orientation={orientation}
                  $size={size}
                />
              )}
            </StepCircleContainer>
            <StepContent $orientation={orientation}>
              <StepLabel
                $isCompleted={step.isCompleted}
                $isActive={isActive}
                $size={size}
                $hasDescription={!!step.description}
              >
                {step.label}
              </StepLabel>
              {step.description && (
                <StepDescription $size={size}>
                  {step.description}
                </StepDescription>
              )}
            </StepContent>
          </StepItem>
        );
      })}
    </StepperContainer>
  );
};

export default Stepper;
