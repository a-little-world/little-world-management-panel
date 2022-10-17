import { Box, BoxHeading } from './box';

const Panel = ({ heading, children, Wrapper = Box }) => (
  <Wrapper>
    <BoxHeading>{heading}</BoxHeading>
    {children}
  </Wrapper>
);

export default Panel;
