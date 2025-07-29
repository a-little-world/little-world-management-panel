import { Text } from '@a-little-world/little-world-design-system';
import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  height: 100%;
  min-height: 0px;
`;

export const Content = styled.div`
  gap: ${({ theme }) => theme.spacing.small};
  display: flex;
  height: 100%;
  min-height: 0px;
  flex-wrap: wrap;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    flex-wrap: nowrap;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
  flex-wrap: wrap;
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
  overflow: scroll;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    max-width: 400px;
  }
`;

export const TemplateWrapper = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  overflow: scroll;
  width: 100%;
  min-height: 0;
  height: 100%;
`;

export const PageHeading = styled(Text)`
  text-transform: capitalize;
`;
