import styled from 'styled-components';
import logo from '../assets/logo.svg';

const StyledHeader = styled.header`
  width: 100%;
  padding: ${({ theme: { spacing } }) => `${spacing(2)} ${spacing(4)}`};
  color: white;
  background: linear-gradient(
    90deg,
    rgba(216, 85, 9, 0.7203256302521008) 0%,
    rgba(243, 147, 37, 0.7147233893557423) 35%,
    rgba(54, 169, 225, 0.6979166666666667) 71%,
    rgba(0, 99, 175, 0.7371323529411764) 100%
  ) !important;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  height: 48px;
  margin-right: ${({ theme: { spacing } }) => spacing(2)}; ;
`;

const Title = styled.h1`
  font-size: 32px;
  text-align: center;
`;

const Header = () => (
  <StyledHeader>
    <Logo alt="little world logo" src={logo} />
    <Title>Admin Panel</Title>
  </StyledHeader>
);

export default Header;
