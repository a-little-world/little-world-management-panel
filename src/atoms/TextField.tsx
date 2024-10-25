import styled from 'styled-components';

const TextField = styled.div<{ $active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  background: ${({ $active, theme }) =>
    $active ? theme.color.surface.primary : theme.color.surface.disabled};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  white-space: pre-line;
`;

export default TextField;
