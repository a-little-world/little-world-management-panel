import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import styled from 'styled-components';

const Badge = styled(Text).attrs({
  type: TextTypes.Body7,
  bold: true,
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 ${({ theme }) => theme.spacing.xxxsmall};
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme }) => theme.color.surface.highlight};
  color: ${({ theme }) => theme.color.text.button};
  line-height: 100%;
  flex-shrink: 0;
`;

export default Badge;
