import styled from 'styled-components';

export const BoxHeading = styled.h3`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: ${({ theme: { spacing } }) => spacing(2)}; ;
`;

export const Box = styled.div`
  background: white;
  padding: ${({ theme: { spacing } }) => `${spacing(3)} ${spacing(2)}`};
  display: flex;
  flex-direction: column;
  width: 50%;
  overflow-x: scroll;
  max-width: 500px;
  min-height: 200px;
  border: 4px solid #e6e8ec;
  border-radius: 30px;
`;

export default Box;
