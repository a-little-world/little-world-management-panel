import { Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

interface DataFieldProps {
  title: string;
  value: string | number;
}

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled(Text)`
  margin-right: ${({ theme }) => theme.spacing.xxsmall};
`;

const Value = styled(Text)``;

const DataField: React.FC<DataFieldProps> = ({ title, value }) => {
  return (
    <Container>
      <Title bold>{title}:</Title>
      <Value>{value}</Value>
    </Container>
  );
};

export default DataField;
