import { Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { css } from 'styled-components';

const Container = styled.div<{ $size: number }>`
  --gap: 0px;
  --line-offset: calc(var(--gap) / 2);
  --line-thickness: 2px;
  display: grid;
  grid-template-columns: auto repeat(${props => props.$size}, 1fr);
  grid-template-rows: auto repeat(${props => props.$size}, 1fr);
  gap: var(--gap);
`;

const Cell = styled.div<{ $color?: string; $size: number }>`
  position: relative;
  background-color: ${({ $color, theme }) =>
    `${$color}10` || theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  // only display internal borders of matrix
  ${({ $color, $size, theme }) => css`
    &:nth-child(${$size + 1}n)::before,
    &:nth-child(n + ${$size + 5})::after {
      content: '';
      position: absolute;
      background-color: ${`${$color}60` || theme.color.border.moderate};
      z-index: 1;
    }
  `}

  // Row Borders
  &::after {
    inline-size: 100%;
    block-size: var(--line-thickness);
    inset-inline-start: 0;
    inset-block-start: calc(var(--line-offset) * -1);
  }

  // Column Borders
  &::before {
    inline-size: var(--line-thickness);
    block-size: 100%;
    inset-inline-start: calc(var(--line-offset) * -1);
  }
`;

const Label = styled(Text)<{ $yAxis?: boolean }>`
  font-weight: bold;
  text-align: center;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $yAxis, theme }) =>
    $yAxis &&
    css`
      padding-right: ${theme.spacing.xxsmall};
    `};
`;

export interface MatrixData {
  xLabels: string[];
  yLabels: string[];
  cells: Array<{
    title: string;
    content: string;
    color: string;
  }>;
  size: number;
}

const Matrix = ({ xLabels, yLabels, size = 2, cells }: MatrixData) => {
  if (
    xLabels.length !== size ||
    yLabels.length !== size ||
    cells.length !== size * size
  ) {
    throw new Error('Invalid matrix dimensions');
  }

  return (
    <Container $size={size}>
      <aside />
      {xLabels.map((label, i) => (
        <Label tag="label" key={i}>
          {label}
        </Label>
      ))}
      {yLabels.map((label, row) => (
        <React.Fragment key={row}>
          <Label tag="label" $yAxis>
            {label}
          </Label>
          {[...Array(size)].map((_, col) => (
            <Cell key={col} $color={cells[row * size + col].color} $size={size}>
              <Text tag="h4">{cells[row * size + col].title}</Text>
              <Text>{cells[row * size + col].content}</Text>
            </Cell>
          ))}
        </React.Fragment>
      ))}
    </Container>
  );
};

export default Matrix;
