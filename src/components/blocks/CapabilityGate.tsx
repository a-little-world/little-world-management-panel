import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  CapabilityRequirement,
  usePanelCapability,
} from '../../helpers/panelCapabilities';

const NoAccessContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.xxlarge}
    ${({ theme }) => theme.spacing.medium};
`;

export function NoAccess() {
  const navigate = useNavigate();
  return (
    <NoAccessContainer>
      <Text type={TextTypes.Heading5} tag="h1" center>
        You don&apos;t have access to this page
      </Text>
      <Text type={TextTypes.Body5} center>
        Ask an admin if you think you should.
      </Text>
      <Button
        size={ButtonSizes.Small}
        appearance={ButtonAppearance.Secondary}
        onClick={() => navigate('/')}
      >
        Back to home
      </Button>
    </NoAccessContainer>
  );
}

/** Renders children only when the panel user has the capability. */
export function RequireCapability({
  capability,
  children,
}: PropsWithChildren<{ capability: CapabilityRequirement }>) {
  const allowed = usePanelCapability(capability);
  return allowed ? <>{children}</> : <NoAccess />;
}

/** Like RequireCapability, but renders nothing when not allowed. */
export function IfCapability({
  capability,
  children,
}: PropsWithChildren<{ capability: CapabilityRequirement }>) {
  const allowed = usePanelCapability(capability);
  return allowed ? <>{children}</> : null;
}
