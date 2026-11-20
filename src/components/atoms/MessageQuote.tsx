import styled from 'styled-components';

const MessageQuote = styled.blockquote`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  border-left: 3px solid ${({ theme }) => theme.color.border.accent};
  border-radius: 0 ${({ theme }) => theme.radius.xsmall}
    ${({ theme }) => theme.radius.xsmall} 0;
  color: ${({ theme }) => theme.color.text.primary};
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export default MessageQuote;
