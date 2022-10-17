import styled, { css } from 'styled-components';
import Box from '../atoms/box';
import { ReactComponent as Close } from '../assets/close.svg';

export const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

export const Selections = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  ${({ theme: { spacing } }) => css`
    padding: ${spacing(8)} ${spacing(4)} ${spacing(4)};
    gap: ${spacing(4)};
  `}
`;

export const Text = styled.p`
  font-size: 14px;
  margin-bottom: ${({ theme: { spacing } }) => spacing(1)};
`;

export const InteractionsContainer = styled.div``;

export const UserList = styled(Box)`
  border-radius: 0px;
  overflow-y: scroll;
  height: 500px;
`;

export const User = styled.li`
  width: 100;
  border-bottom: 1px solid black;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  column-gap: ${({ theme: { spacing } }) => spacing(1)};
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme: { spacing } }) => spacing(1)} 0px;
`;

export const Option = styled.button`
  width: 100%;
  background: white;
  border: 1px solid black;
  padding: ${({ theme: { spacing } }) => spacing(1)};
  cursor: pointer;
  width: fit-content;
  justify-self: end;

  &:hover:enabled {
    opacity: 0.6;
  }

  &:disabled {
    cursor: not-allowed;
    background: lightgray;
  }
`;

export const CloseIcon = styled(Close)`
  height: 16px;
  width: 16px;
  margin-left: ${({ theme: { spacing } }) => spacing(1)};
`;

export const Name = styled.span`
  flex-shrink: 0;
`;

export const OrderedList = styled.ol`
  padding: 0px;
`;

export const Button = styled.button`
  display: block;
  width: 270px;
  height: 56px;
  background: #187fc2;
  color: white;
  margin: 0 auto;

  &:hover {
    opacity: 0.6;
  }
`;

export const PanelFallbackText = styled.p`
  text-align: center;
`;

export const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme: { spacing } }) => spacing(4)};
  gap: ${({ theme: { spacing } }) => spacing(4)}; ;
`;

export const SearchPanels = styled.div`
  display: flex;
  gap: ${({ theme: { spacing } }) => spacing(8)};
`;

export const Subheading = styled.label`
  font-size: 20px;
`;

export const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme: { spacing } }) => spacing(1)}; ;
`;

export const Filter = styled.button`
  border-radius: 15px;
  border: 1px solid #187fc2;
  display: inline-flex;
  align-items: center;
  color: #187fc2;
  cursor: pointer;
  padding: 0 ${({ theme: { spacing } }) => spacing(2)};
  height: 32px;
  line-height: 1;
  text-transform: capitalize;

  &:hover {
    opacity: 0.6;
  }

  &:not(:last-child) {
    margin-right: ${({ theme: { spacing } }) => spacing(1)};
  }
`;
