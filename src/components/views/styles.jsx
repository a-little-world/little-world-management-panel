import styled, { css } from 'styled-components';

import { ReactComponent as Close } from '../../assets/close.svg';
import Box from '../atoms/box';

export const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

export const Selections = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: top;
  align-items: top;

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

export const ActionsMenuResultsContainer = styled.div`
  min-width: 500px;
`;

export const InputFormContainer = styled.div`
  max-width: 500px;
  overflow-y: auto;
  flex-grow: 1;
`;

export const UserList = styled(Box)`
  border-radius: 0px;
  overflow-y: scroll;
  max-height: 800px;
  min-width: 600px;
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

export const Table = styled.table.attrs(props => ({
  className: 'styled-table',
}))`
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
`;

export const UserDetailed = styled.li`
  width: 100;
  border-bottom: 1px solid black;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  column-gap: ${({ theme: { spacing } }) => spacing(1)};
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme: { spacing } }) => spacing(1)} 0px;
`;

export const UserTags = styled.li`
  width: 100;
  border-bottom: 1px solid black;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  column-gap: ${({ theme: { spacing } }) => spacing(0)};
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme: { spacing } }) => spacing(0)} 0px;
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

  &:selected {
    background: lightgreen;
  }

  &:disabled {
    cursor: not-allowed;
    background: lightgray;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

export const OverlaySelector = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  right: 0;
  top: 0;
  height: 100%;
  width: 75%;
`;

export const OverlaySelectorTopMenu = styled.div`
  height: 100px;
`;

export const OverlaySelectorListContainer = styled.div`
  padding: 20px;
  margin-top: 50px;
  overflow-y: scroll;
  max-height: 80%;
`;

export const OverlaySelectorToggle = styled.div`
  z-index: 10;
  width: 40px;
  height: 40px;
  background: black;
  position: absolute;
  right: 0;
  top: 0;
`;

export const CloseIcon = styled(Close)`
  height: 16px;
  width: 16px;
  margin-left: ${({ theme: { spacing } }) => spacing(1)};
`;

export const Name = styled.span`
  flex-shrink: 0;
  font-weight: bold;
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
  flex-direction: row;
  flex-wrap: wrap;
  padding: ${({ theme: { spacing } }) => spacing(1)};
  gap: ${({ theme: { spacing } }) => spacing(1)};
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
  background: #f2f2f2;
  align-items: center;
  gap: ${({ theme: { spacing } }) => spacing(1)};
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

  &:hover {
    opacity: 0.6;
  }

  &:not(:last-child) {
    margin-right: ${({ theme: { spacing } }) => spacing(1)};
  }
`;
