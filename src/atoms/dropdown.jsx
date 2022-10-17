import styled from 'styled-components';

const StyledSelect = styled.select`
  height: 32px;
  padding: 0 16px;
  margin-right: 32px;
  font-size: 16px;
`;

const Dropdown = ({ children, ...selectProps }) => (
  <StyledSelect {...selectProps}>{children}</StyledSelect>
);

export default Dropdown;
